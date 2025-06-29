import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import InvoiceTaxCalculator from '@/components/invoice/InvoiceTaxCalculator';
import { Customer, InvoiceItem } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import InvoiceHeader from '@/components/invoice/InvoiceHeader';
import CustomerSelector from '@/components/invoice/CustomerSelector';
import InvoiceItemList from '@/components/invoice/InvoiceItemList';
import InvoiceSummary from '@/components/invoice/InvoiceSummary';
import { generateInvoicePdf } from '@/components/invoice/InvoicePdfGenerator';
import { format } from 'date-fns';

interface InvoiceTaxes {
  subtotalHT: number;
  tva: number;
  timbreFiscal: number;
  totalTTC: number;
}

const InvoiceGenerator = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: uuidv4(), description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [taxes, setTaxes] = useState<InvoiceTaxes>({
    subtotalHT: 0,
    tva: 0,
    timbreFiscal: 1,
    totalTTC: 0
  });

  useEffect(() => {
    if (user === null || !isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
    } else {
      fetchCustomers();
      generateInvoiceNumber();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      
      if (data) {
        setCustomers(data as Customer[]);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les clients: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      // Get the current year and month
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      // Generate the invoice number: FACT-YYYYMM-XXX
      // Using a timestamp to ensure uniqueness
      const timestamp = Date.now().toString().slice(-3);
      setInvoiceNumber(`FACT-${year}${month}-${timestamp}`);
    } catch (error: any) {
      console.error('Error generating invoice number:', error);
      // Fallback to a timestamp-based invoice number
      setInvoiceNumber(`FACT-${Date.now()}`);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId) || null;
    setSelectedCustomer(customer);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate total if quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      });
    });
  };

  const addItem = () => {
    setItems([...items, { id: uuidv4(), description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleTaxCalculation = (calculatedTaxes: InvoiceTaxes) => {
    setTaxes(calculatedTaxes);
  };

  const handleInvoiceNumberChange = (number: string) => {
    setInvoiceNumber(number);
  };

  const generatePDF = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs des articles",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate the PDF document
      const doc = generateInvoicePdf({
        invoiceNumber,
        invoiceDate,
        customer: selectedCustomer,
        items,
        taxes
      });
      
      // Convert the InvoiceItem array to a plain JavaScript object array for JSON storage
      const itemsForStorage = items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }));
      
      // Save the invoice in the database
      const { error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          customer_id: selectedCustomer.id,
          invoice_date: invoiceDate,
          items: itemsForStorage,
          subtotal_ht: taxes.subtotalHT,
          tva: taxes.tva,
          timbre_fiscal: taxes.timbreFiscal,
          total_ttc: taxes.totalTTC,
          created_by: user?.id
        });
      
      if (error) throw error;
      
      // Save the PDF
      doc.save(`${invoiceNumber}.pdf`);
      
      toast({
        title: "Succès",
        description: "La facture a été générée avec succès",
      });
      
      // Reset form for a new invoice
      setItems([{ id: uuidv4(), description: '', quantity: 1, unitPrice: 0, total: 0 }]);
      setSelectedCustomer(null);
      generateInvoiceNumber();
      setInvoiceDate(format(new Date(), 'yyyy-MM-dd'));
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de générer la facture: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  const subtotal = calculateSubtotal();

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Générateur de factures</CardTitle>
          <CardDescription>
            Créez et téléchargez des factures pour vos clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InvoiceHeader 
              invoiceNumber={invoiceNumber}
              invoiceDate={invoiceDate}
              onNumberChange={handleInvoiceNumberChange}
              onDateChange={setInvoiceDate}
            />
            <CustomerSelector 
              customers={customers}
              selectedCustomer={selectedCustomer}
              onCustomerChange={handleCustomerChange}
            />
          </div>
          
          {/* Invoice Items */}
          <InvoiceItemList
            items={items}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onItemChange={handleItemChange}
          />
          
          {/* Tax Calculator (hidden component) */}
          <InvoiceTaxCalculator subtotal={subtotal} onCalculate={handleTaxCalculation} />
          
          {/* Invoice Summary */}
          <InvoiceSummary
            subtotalHT={taxes.subtotalHT}
            tva={taxes.tva}
            timbreFiscal={taxes.timbreFiscal}
            totalTTC={taxes.totalTTC}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={generatePDF} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Générer la facture PDF
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvoiceGenerator;
