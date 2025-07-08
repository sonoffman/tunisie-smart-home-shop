
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
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
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
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const clearForm = () => {
    setSelectedCustomer(null);
    setItems([]);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
  };

  const handleGenerateInvoice = () => {
    if (!selectedCustomer || items.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client et ajouter au moins un article",
        variant: "destructive",
      });
      return;
    }

    // Générer un numéro de facture par défaut
    const defaultInvoiceNumber = `FAC-${Date.now()}`;
    setShowParametersDialog(true);
  };

  const handleConfirmGeneration = async (parameters: any) => {
    try {
      setSaving(true);

      // Calculs corrects
      const realSubtotalHT = items.reduce((sum, item) => {
        return sum + ((item.unitPrice / 1.19) * item.quantity);
      }, 0);
      
      const totalTVA = items.reduce((sum, item) => {
        const ht = item.unitPrice / 1.19;
        const tva = item.unitPrice - ht;
        return sum + (tva * item.quantity);
      }, 0);
      
      const timbreFiscal = 1; // Fixé à 1 DT
      const totalTTC = realSubtotalHT + totalTVA + timbreFiscal;

      // Créer la facture avec les bons calculs
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          customer_id: selectedCustomer.id,
          invoice_number: parameters.invoiceNumber,
          invoice_date: invoiceDate,
          document_type: parameters.documentType,
          items: items.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.unitPrice * item.quantity
          })),
          subtotal_ht: realSubtotalHT,
          tva: totalTVA,
          timbre_fiscal: timbreFiscal,
          total_ttc: totalTTC,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Convertir les données pour le PDF
      const invoiceForPdf = {
        ...invoice,
        items: items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * item.quantity
        }))
      };

      // Générer le PDF avec les nouveaux paramètres
      const doc = generateInvoicePDF(invoiceForPdf, selectedCustomer, parameters);
      doc.save(`${parameters.documentType}_${parameters.invoiceNumber}.pdf`);

      toast({
        title: "Succès",
        description: `${parameters.documentType} générée avec succès`,
      });

      // Reset
      setItems([]);
      setSelectedCustomer(null);
      setInvoiceDate(new Date().toISOString().split('T')[0]);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la génération: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals for summary
  const calculateTotals = () => {
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">
            Générateur de Factures
          </h1>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informations du client</CardTitle>
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Détails de la facture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700">
                Date de la facture
              </Label>
              <Input
                type="date"
                id="invoiceDate"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="mt-1"
              />
            </div>

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
          </CardContent>
        </Card>

        {selectedCustomer && items.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
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
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={clearForm}>
            Réinitialiser
          </Button>
          <Button 
            onClick={handleGenerateInvoice}
            disabled={!selectedCustomer || items.length === 0 || saving}
            className="bg-sonoff-blue hover:bg-sonoff-teal"
          >
            {saving ? 'Génération...' : 'Configurer et Générer'}
          </Button>
        </div>
      </div>

      <InvoiceParametersDialog
        open={showParametersDialog}
        onOpenChange={setShowParametersDialog}
        onConfirm={handleConfirmGeneration}
        defaultInvoiceNumber={`FAC-${Date.now()}`}
      />
    </Layout>
  );
};

export default InvoiceGenerator;
