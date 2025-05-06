import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, FileText, Trash2, Plus, Minus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import InvoiceTaxCalculator from '@/components/invoice/InvoiceTaxCalculator';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

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
      setCustomers(data || []);
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
      
      // Get the count of invoices for this month to generate a sequential number
      const { count, error } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .like('invoice_number', `FACT-${year}${month}-%`);
      
      if (error) throw error;
      
      // Generate the invoice number: FACT-YYYYMM-XXX
      const sequentialNumber = String((count || 0) + 1).padStart(3, '0');
      setInvoiceNumber(`FACT-${year}${month}-${sequentialNumber}`);
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
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add company logo and information
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Smart Africa Technology", 14, 20);
      doc.text("123 Rue de Tunis", 14, 25);
      doc.text("Tunis, Tunisie", 14, 30);
      doc.text("Tel: +216 55 123 456", 14, 35);
      doc.text("Email: contact@sonoff-store.tn", 14, 40);
      
      // Add invoice title and number
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("FACTURE", 105, 20, { align: "center" });
      doc.setFontSize(10);
      doc.text(`N° ${invoiceNumber}`, 105, 27, { align: "center" });
      doc.text(`Date: ${format(new Date(invoiceDate), 'dd MMMM yyyy', { locale: fr })}`, 105, 32, { align: "center" });
      
      // Add customer information
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Facturé à:", 140, 20);
      doc.setTextColor(0, 0, 0);
      doc.text(selectedCustomer.name, 140, 25);
      doc.text(selectedCustomer.address, 140, 30);
      doc.text(`Tel: ${selectedCustomer.phone}`, 140, 35);
      if (selectedCustomer.email) {
        doc.text(`Email: ${selectedCustomer.email}`, 140, 40);
      }
      
      // Add invoice items table
      const tableColumn = ["Description", "Quantité", "Prix unitaire (DT)", "Total (DT)"];
      const tableRows = items.map(item => [
        item.description,
        item.quantity.toString(),
        item.unitPrice.toFixed(3),
        item.total.toFixed(3)
      ]);
      
      // @ts-ignore - jspdf-autotable types are not properly recognized
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        foot: [
          [{ content: 'Sous-total HT:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, taxes.subtotalHT.toFixed(3)],
          [{ content: 'TVA (19%):', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, taxes.tva.toFixed(3)],
          [{ content: 'Timbre fiscal:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, taxes.timbreFiscal.toFixed(3)],
          [{ content: 'Total TTC:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, taxes.totalTTC.toFixed(3)]
        ],
        footStyles: { fillColor: [240, 240, 240] }
      });
      
      // Add payment information and terms
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text("Modalités de paiement:", 14, finalY);
      doc.text("Paiement à la livraison ou par virement bancaire", 14, finalY + 5);
      doc.text("Merci pour votre confiance!", 105, finalY + 20, { align: "center" });
      
      // Save the invoice in the database
      const { error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          customer_id: selectedCustomer.id,
          invoice_date: invoiceDate,
          items: items,
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="invoice-number">Numéro de facture</Label>
                <Input
                  id="invoice-number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="invoice-date">Date de facture</Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customer">Client</Label>
              <Select onValueChange={handleCustomerChange} value={selectedCustomer?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCustomer && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                  {selectedCustomer.email && (
                    <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Invoice Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Articles</h3>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter un article
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Description</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix unitaire (DT)</TableHead>
                  <TableHead>Total (DT)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Description de l'article"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.total.toFixed(3)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Tax Calculator (hidden component) */}
          <InvoiceTaxCalculator subtotal={subtotal} onCalculate={handleTaxCalculation} />
          
          {/* Invoice Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total HT:</span>
                <span>{taxes.subtotalHT.toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between">
                <span>TVA (19%):</span>
                <span>{taxes.tva.toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between">
                <span>Timbre fiscal:</span>
                <span>{taxes.timbreFiscal.toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total TTC:</span>
                <span>{taxes.totalTTC.toFixed(3)} DT</span>
              </div>
            </div>
          </div>
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
