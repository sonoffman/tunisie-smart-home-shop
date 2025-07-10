
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateInvoicePDF } from '@/components/invoice/InvoicePdfGenerator';
import { FileText, Download } from 'lucide-react';

const TestPdfGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleTestPdf = async () => {
    try {
      setIsGenerating(true);
      console.log('Starting PDF test generation...');

      // Créer un client test
      const testCustomer = {
        name: 'Client Test',
        address: '123 Rue de Test, 75001 Paris',
        phone: '01 23 45 67 89',
        email: 'test@example.com'
      };

      console.log('Creating test customer:', testCustomer);

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([testCustomer])
        .select()
        .single();

      if (customerError) {
        console.error('Customer creation error:', customerError);
        throw new Error(`Erreur création client: ${customerError.message}`);
      }

      console.log('Customer created successfully:', customer);

      // Créer une facture test
      const testInvoice = {
        invoice_number: `TEST-${Date.now()}`,
        customer_id: customer.id,
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            description: 'Produit Test 1',
            quantity: 2,
            unitPrice: 25.00,
            total: 50.00
          },
          {
            description: 'Produit Test 2',
            quantity: 1,
            unitPrice: 75.00,
            total: 75.00
          }
        ],
        subtotal_ht: 125.00,
        tva: 25.00,
        timbre_fiscal: 1.00,
        total_ttc: 151.00,
        document_type: 'Facture'
      };

      console.log('Creating test invoice:', testInvoice);

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([testInvoice])
        .select()
        .single();

      if (invoiceError) {
        console.error('Invoice creation error:', invoiceError);
        throw new Error(`Erreur création facture: ${invoiceError.message}`);
      }

      console.log('Invoice created successfully:', invoice);

      // Générer le PDF
      console.log('Generating PDF...');
      const pdfBlob = await generateInvoicePDF(invoice, customer);
      
      // Télécharger le PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-test-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF généré avec succès",
        description: "Le PDF de test a été généré et téléchargé",
      });

      console.log('PDF generation test completed successfully');

    } catch (error: any) {
      console.error('PDF test error:', error);
      toast({
        title: "Erreur test PDF",
        description: `Impossible de générer le PDF de test: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Test Génération PDF
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleTestPdf}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>Génération en cours...</>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Tester PDF Facture
            </>
          )}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Ce test va créer un client et une facture de test, puis générer un PDF.
        </p>
      </CardContent>
    </Card>
  );
};

export default TestPdfGeneration;
