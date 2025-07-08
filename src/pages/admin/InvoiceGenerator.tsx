
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Settings } from 'lucide-react';
import CustomerSelector from '@/components/invoice/CustomerSelector';
import InvoiceItemList from '@/components/invoice/InvoiceItemList';
import InvoiceSummary from '@/components/invoice/InvoiceSummary';
import { generateInvoicePDF } from '@/components/invoice/InvoicePdfGenerator';
import InvoiceParametersDialog from '@/components/invoice/InvoiceParametersDialog';
import { Customer, InvoiceItem } from '@/types/supabase';

interface Item {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const InvoiceGenerator = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [showParametersDialog, setShowParametersDialog] = useState(false);

  useEffect(() => {
    if (user === null || !isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: user === null
          ? "Vous devez être connecté pour accéder à cette page."
          : "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
    } else {
      fetchCustomers();
      // Ajouter un article par défaut pour commencer
      handleAddItem();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les clients: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: string, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const clearForm = () => {
    setSelectedCustomer(null);
    setItems([]);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    // Ajouter un article par défaut
    setTimeout(() => {
      handleAddItem();
    }, 100);
  };

  const generateDefaultInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    return `FAC-${year}${month}${day}-${time}`;
  };

  const handleGenerateInvoice = () => {
    if (!selectedCustomer) {
      toast({
        title: "Client requis",
        description: "Veuillez sélectionner un client avant de continuer",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0 || items.every(item => !item.description.trim())) {
      toast({
        title: "Articles requis",
        description: "Veuillez ajouter au moins un article avec une description",
        variant: "destructive",
      });
      return;
    }

    // Vérifier que tous les articles ont une description et un prix
    const invalidItems = items.filter(item => !item.description.trim() || item.unitPrice <= 0);
    if (invalidItems.length > 0) {
      toast({
        title: "Articles incomplets",
        description: "Tous les articles doivent avoir une description et un prix valide",
        variant: "destructive",
      });
      return;
    }

    setShowParametersDialog(true);
  };

  const handleConfirmGeneration = async (parameters: any) => {
    try {
      setSaving(true);

      // Calculs corrects - les prix entrés sont en TTC
      const realSubtotalHT = items.reduce((sum, item) => {
        return sum + ((item.unitPrice / 1.19) * item.quantity);
      }, 0);
      
      const totalTVA = realSubtotalHT * 0.19;
      const timbreFiscal = 1; // Fixé à 1 DT
      const totalTTC = realSubtotalHT + totalTVA + timbreFiscal;

      console.log('Calculs de facturation:', {
        realSubtotalHT,
        totalTVA,
        timbreFiscal,
        totalTTC,
        itemsWithPrices: items.map(item => ({
          description: item.description,
          prixTTC: item.unitPrice,
          prixHT: item.unitPrice / 1.19,
          quantity: item.quantity
        }))
      });

      // Créer la facture dans la base de données
      const invoiceData = {
        customer_id: selectedCustomer!.id,
        invoice_number: parameters.invoiceNumber,
        invoice_date: invoiceDate,
        document_type: parameters.documentType,
        items: items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice, // Stocker le prix TTC
          total: item.unitPrice * item.quantity
        })),
        subtotal_ht: realSubtotalHT,
        tva: totalTVA,
        timbre_fiscal: timbreFiscal,
        total_ttc: totalTTC,
        created_by: user?.id
      };

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la facture:', error);
        throw error;
      }

      console.log('Facture créée avec succès:', invoice);

      // Convertir les données pour le PDF
      const invoiceForPdf = {
        ...invoice,
        items: items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice, // Prix TTC
          total: item.unitPrice * item.quantity
        }))
      };

      // Générer et télécharger le PDF
      const doc = generateInvoicePDF(invoiceForPdf, selectedCustomer!, parameters);
      doc.save(`${parameters.documentType}_${parameters.invoiceNumber}.pdf`);

      toast({
        title: "Succès !",
        description: `${parameters.documentType} générée et sauvegardée avec succès`,
      });

      // Réinitialiser le formulaire
      clearForm();

    } catch (error: any) {
      console.error('Erreur lors de la génération:', error);
      toast({
        title: "Erreur",
        description: `Erreur lors de la génération: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculer les totaux pour l'affichage
  const calculateTotals = () => {
    // Les prix unitaires sont entrés en TTC
    const subtotalTTC = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const subtotalHT = subtotalTTC / 1.19;
    const tva = subtotalHT * 0.19;
    const timbreFiscal = 1;
    const totalTTC = subtotalHT + tva + timbreFiscal;

    return {
      subtotalHT,
      tva,
      timbreFiscal,
      totalTTC
    };
  };

  const totals = calculateTotals();

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-sonoff-blue" />
            <h1 className="text-3xl font-bold text-sonoff-blue">
              Générateur de Documents
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
          </Button>
        </div>

        {/* Informations du client */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👤 Informations du client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerSelector
              customers={customers}
              selectedCustomer={selectedCustomer}
              onCustomerChange={(customerId) => {
                const customer = customers.find(c => c.id === customerId);
                setSelectedCustomer(customer || null);
              }}
              onCustomerCreated={fetchCustomers}
            />
          </CardContent>
        </Card>

        {/* Détails du document */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Détails du document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date du document
              </Label>
              <Input
                type="date"
                id="invoiceDate"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-4">
                Articles / Services (prix TTC)
              </Label>
              <InvoiceItemList
                items={items.map(item => ({
                  id: item.id,
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  total: item.unitPrice * item.quantity
                }))}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onItemChange={handleItemChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Récapitulatif */}
        {selectedCustomer && items.length > 0 && items.some(item => item.description.trim()) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧮 Récapitulatif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceSummary
                subtotalHT={totals.subtotalHT}
                tva={totals.tva}
                timbreFiscal={totals.timbreFiscal}
                totalTTC={totals.totalTTC}
              />
            </CardContent>
          </Card>
        )}
        
        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={clearForm}>
            🔄 Réinitialiser
          </Button>
          <Button 
            onClick={handleGenerateInvoice}
            disabled={!selectedCustomer || items.length === 0 || saving}
            className="bg-sonoff-blue hover:bg-sonoff-teal text-white flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {saving ? 'Génération...' : 'Configurer et Générer'}
          </Button>
        </div>
      </div>

      <InvoiceParametersDialog
        open={showParametersDialog}
        onOpenChange={setShowParametersDialog}
        onConfirm={handleConfirmGeneration}
        defaultInvoiceNumber={generateDefaultInvoiceNumber()}
      />
    </Layout>
  );
};

export default InvoiceGenerator;
