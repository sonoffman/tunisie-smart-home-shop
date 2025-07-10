
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateInvoicePDF } from '@/components/invoice/InvoicePdfGenerator';
import { Json } from '@/integrations/supabase/types';
import { InvoiceItem } from '@/types/supabase';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  document_type: string | null;
  items: Json;
  subtotal_ht: number;
  tva: number;
  timbre_fiscal: number;
  total_ttc: number;
  created_at: string;
  created_by: string | null;
}

interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

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
    } else if (id) {
      fetchInvoice();
    }
  }, [user, isAdmin, navigate, toast, id]);

  const fetchInvoice = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log('Fetching invoice with ID:', id);
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (invoiceError) {
        console.error('Invoice fetch error:', invoiceError);
        toast({
          title: "Erreur de base de données",
          description: `Erreur lors du chargement: ${invoiceError.message}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!invoiceData) {
        console.log('No invoice found with ID:', id);
        toast({
          title: "Facture introuvable",
          description: "Aucune facture trouvée avec cet identifiant",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      console.log('Invoice data fetched successfully:', invoiceData);
      setInvoice(invoiceData);

      if (invoiceData?.customer_id) {
        console.log('Fetching customer with ID:', invoiceData.customer_id);
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', invoiceData.customer_id)
          .maybeSingle();

        if (customerError) {
          console.error('Customer fetch error:', customerError);
          toast({
            title: "Erreur client",
            description: `Impossible de charger les données client: ${customerError.message}`,
            variant: "destructive",
          });
        } else if (customerData) {
          console.log('Customer data fetched successfully:', customerData);
          setCustomer(customerData);
        } else {
          console.log('No customer found with ID:', invoiceData.customer_id);
        }
      }
    } catch (error: any) {
      console.error('Unexpected error fetching invoice:', error);
      toast({
        title: "Erreur inattendue",
        description: `Une erreur inattendue s'est produite: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely convert Json to InvoiceItem[]
  const parseInvoiceItems = (items: Json): InvoiceItem[] => {
    if (!items) {
      console.log('No items data provided');
      return [];
    }
    
    if (!Array.isArray(items)) {
      console.log('Items is not an array:', typeof items, items);
      return [];
    }
    
    return items.map((item: any, index: number) => ({
      id: item.id || `item-${index}`,
      description: item.name || item.description || 'Article sans nom',
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.price || item.unitPrice) || 0,
      total: Number(item.total) || (Number(item.quantity) * Number(item.price || item.unitPrice)) || 0
    }));
  };

  const handlePreviewPdf = () => {
    if (!invoice || !customer) {
      toast({
        title: "Erreur",
        description: "Données de facture incomplètes",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Generating PDF preview...');
      const items = parseInvoiceItems(invoice.items);
      console.log('Parsed items for PDF:', items);
      
      // Vérifier que les items sont valides
      if (!items || items.length === 0) {
        toast({
          title: "Erreur",
          description: "Aucun article trouvé dans la facture",
          variant: "destructive",
        });
        return;
      }

      const invoiceForPdf = {
        ...invoice,
        items: items
      };

      console.log('Invoice data for PDF:', invoiceForPdf);
      console.log('Customer data for PDF:', customer);

      const pdf = generateInvoicePDF(invoiceForPdf, customer, {
        documentType: (invoice.document_type as 'Facture' | 'Devis' | 'Bon de Livraison') || 'Facture',
        footerMessage: 'Merci de votre confiance'
      });

      // Ouvrir le PDF dans un nouvel onglet
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      console.log('PDF preview generated successfully');
      
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      toast({
        title: "Erreur PDF",
        description: `Impossible de générer l'aperçu PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive",
      });
    }
  };

  const handleDownloadPdf = () => {
    if (!invoice || !customer) {
      toast({
        title: "Erreur",
        description: "Données de facture incomplètes",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Generating PDF download...');
      const items = parseInvoiceItems(invoice.items);
      console.log('Parsed items for download:', items);
      
      // Vérifier que les items sont valides
      if (!items || items.length === 0) {
        toast({
          title: "Erreur",
          description: "Aucun article trouvé dans la facture",
          variant: "destructive",
        });
        return;
      }

      const invoiceForPdf = {
        ...invoice,
        items: items
      };

      const pdf = generateInvoicePDF(invoiceForPdf, customer, {
        documentType: (invoice.document_type as 'Facture' | 'Devis' | 'Bon de Livraison') || 'Facture',
        footerMessage: 'Merci de votre confiance'
      });

      // Sauvegarder le PDF
      const fileName = `${invoice.document_type || 'Facture'}-${invoice.invoice_number}.pdf`;
      pdf.save(fileName);
      console.log('PDF downloaded successfully as:', fileName);
      
      toast({
        title: "Succès",
        description: "PDF téléchargé avec succès",
      });
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Erreur téléchargement",
        description: `Impossible de télécharger le PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive",
      });
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">Chargement de la facture...</div>
        </div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Facture non trouvée</h1>
            <Button onClick={() => navigate('/admin/invoices')}>
              Retour aux factures
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Parse items safely from Json type
  const items = parseInvoiceItems(invoice.items);

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
            <h1 className="text-3xl font-bold text-sonoff-blue">
              Facture {invoice.invoice_number}
            </h1>
          </div>
          <div className="space-x-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={handlePreviewPdf}>
              <Eye className="h-4 w-4" />
              Aperçu
            </Button>
            <Button className="flex items-center gap-2" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4" />
              Télécharger PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de la facture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium">Numéro:</span> {invoice.invoice_number}
              </div>
              <div>
                <span className="font-medium">Type:</span> {invoice.document_type || 'Facture'}
              </div>
              <div>
                <span className="font-medium">Date:</span> {format(new Date(invoice.invoice_date), 'PPP', { locale: fr })}
              </div>
              <div>
                <span className="font-medium">Créée le:</span> {format(new Date(invoice.created_at), 'PPP à HH:mm', { locale: fr })}
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle>Informations client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium">Nom:</span> {customer.name}
                </div>
                <div>
                  <span className="font-medium">Téléphone:</span> {customer.phone}
                </div>
                {customer.email && (
                  <div>
                    <span className="font-medium">Email:</span> {customer.email}
                  </div>
                )}
                <div>
                  <span className="font-medium">Adresse:</span>
                  <p className="mt-1 text-sm text-gray-600">{customer.address}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Article</th>
                      <th className="text-right p-2">Quantité</th>
                      <th className="text-right p-2">Prix unitaire</th>
                      <th className="text-right p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: InvoiceItem, index: number) => (
                      <tr key={item.id || index} className="border-b">
                        <td className="p-2">{item.description}</td>
                        <td className="text-right p-2">{item.quantity}</td>
                        <td className="text-right p-2">{item.unitPrice.toFixed(2)} DT</td>
                        <td className="text-right p-2">{item.total.toFixed(2)} DT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-sm ml-auto">
                <div className="flex justify-between">
                  <span>Sous-total HT:</span>
                  <span>{invoice.subtotal_ht.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA:</span>
                  <span>{invoice.tva.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between">
                  <span>Timbre fiscal:</span>
                  <span>{invoice.timbre_fiscal.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total TTC:</span>
                  <span>{invoice.total_ttc.toFixed(2)} DT</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default InvoiceDetail;
