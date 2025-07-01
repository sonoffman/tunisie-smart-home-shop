
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Eye, Plus } from 'lucide-react';
import CustomerSelector from '@/components/invoice/CustomerSelector';
import InvoiceHeader from '@/components/invoice/InvoiceHeader';
import InvoiceItemList from '@/components/invoice/InvoiceItemList';
import InvoiceSummary from '@/components/invoice/InvoiceSummary';
import InvoiceTaxCalculator from '@/components/invoice/InvoiceTaxCalculator';
import { generateInvoicePdf } from '@/components/invoice/InvoicePdfGenerator';
import { Customer, InvoiceItem } from '@/types/supabase';

const InvoiceGenerator = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [subtotalHT, setSubtotalHT] = useState(0);
  const [tva, setTva] = useState(0);
  const [timbreFiscal, setTimbreFiscal] = useState(0.6);
  const [totalTTC, setTotalTTC] = useState(0);
  const [saving, setSaving] = useState(false);

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
      generateInvoiceNumber();
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
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      });
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].invoice_number;
        const match = lastNumber.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const currentYear = new Date().getFullYear();
      const newInvoiceNumber = `INV-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
      setInvoiceNumber(newInvoiceNumber);
    } catch (error) {
      console.error('Error generating invoice number:', error);
      const currentYear = new Date().getFullYear();
      setInvoiceNumber(`INV-${currentYear}-001`);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
  };

  const handleCustomerCreated = () => {
    fetchCustomers();
  };

  const handleTaxCalculation = (values: {
    subtotalHT: number;
    tva: number;
    timbreFiscal: number;
    totalTTC: number;
  }) => {
    setSubtotalHT(values.subtotalHT);
    setTva(values.tva);
    setTimbreFiscal(values.timbreFiscal);
    setTotalTTC(values.totalTTC);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const saveInvoice = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Erreur", 
        description: "Veuillez ajouter au moins un article",
        variant: "destructive",
      });
      return;
    }

    if (!invoiceNumber.trim()) {
      toast({
        title: "Erreur",
        description: "Le numéro de facture est obligatoire",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    try {
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', invoiceNumber.trim())
        .maybeSingle();

      if (existingInvoice) {
        toast({
          title: "Erreur",
          description: "Ce numéro de facture existe déjà",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const invoiceData = {
        invoice_number: invoiceNumber.trim(),
        customer_id: selectedCustomer.id,
        invoice_date: invoiceDate,
        items: items as any,
        subtotal_ht: subtotalHT,
        tva: tva,
        timbre_fiscal: timbreFiscal,
        total_ttc: totalTTC,
        created_by: user?.id || null,
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      });

      navigate(`/admin/invoices/${data.id}`);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Erreur",
        description: `Impossible de créer la facture: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewPdf = () => {
    if (!selectedCustomer || items.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client et ajouter des articles",
        variant: "destructive",
      });
      return;
    }

    const pdf = generateInvoicePdf({
      invoiceNumber,
      invoiceDate,
      customer: selectedCustomer,
      items,
      taxes: {
        subtotalHT,
        tva,
        timbreFiscal,
        totalTTC
      }
    });

    pdf.output('dataurlnewwindow');
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/invoices')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-sonoff-blue">Nouvelle Facture</h1>
          </div>
          <div className="space-x-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={handlePreviewPdf}>
              <Eye className="h-4 w-4" />
              Aperçu
            </Button>
            <Button 
              onClick={saveInvoice}
              disabled={saving || !selectedCustomer || items.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerSelector 
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  onCustomerChange={handleCustomerChange}
                  onCustomerCreated={handleCustomerCreated}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations de la facture</CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceHeader
                  invoiceNumber={invoiceNumber}
                  invoiceDate={invoiceDate}
                  onNumberChange={setInvoiceNumber}
                  onDateChange={setInvoiceDate}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Articles</CardTitle>
                  <Button onClick={addItem} size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter un article
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <InvoiceItemList
                  items={items}
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                  onItemChange={updateItem}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calculs</CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceTaxCalculator
                  subtotal={subtotal}
                  onCalculate={handleTaxCalculation}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceSummary
                  subtotalHT={subtotalHT}
                  tva={tva}
                  timbreFiscal={timbreFiscal}
                  totalTTC={totalTTC}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvoiceGenerator;
