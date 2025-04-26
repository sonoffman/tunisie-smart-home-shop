
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  created_at: string;
  total_amount: number;
  status: string;
}

const InvoiceGenerator = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);
  
  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
        
      if (orderError) throw orderError;
      
      if (orderData) {
        setOrder(orderData);
        
        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);
          
        if (itemsError) throw itemsError;
        
        if (itemsData) {
          setOrderItems(itemsData);
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les détails de la commande: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };
  
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} DT`;
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const generateInvoicePDF = () => {
    if (!order) return;
    
    try {
      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add company header
      doc.setFontSize(20);
      doc.setTextColor(36, 99, 165); // sonoff-blue
      doc.text('SONOFF Store', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Tunis, Tunisie', pageWidth / 2, 20, { align: 'center' });
      doc.text('contact@sonoff-store.tn', pageWidth / 2, 25, { align: 'center' });
      doc.text('+216 55 123 456', pageWidth / 2, 30, { align: 'center' });
      
      // Add invoice title
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('FACTURE', pageWidth / 2, 40, { align: 'center' });
      
      // Add invoice info
      doc.setFontSize(11);
      doc.text(`N° Facture: INV-${order.id.substring(0, 8)}`, 15, 50);
      doc.text(`Date: ${formatDate(order.created_at)}`, 15, 55);
      
      // Add customer info
      doc.setFontSize(12);
      doc.text('Informations client:', 15, 65);
      doc.setFontSize(11);
      doc.text(`Nom: ${order.customer_name}`, 15, 70);
      doc.text(`Téléphone: ${order.customer_phone}`, 15, 75);
      doc.text(`Adresse: ${order.customer_address}`, 15, 80);
      
      // Add item table
      const tableColumn = ["Produit", "Quantité", "Prix unitaire", "Total"];
      const tableRows: any[] = [];
      
      orderItems.forEach(item => {
        const itemData = [
          item.product_name,
          item.quantity,
          formatCurrency(item.price),
          formatCurrency(item.price * item.quantity)
        ];
        tableRows.push(itemData);
      });
      
      // Generate table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 90,
        styles: { fontSize: 10 }
      });
      
      // Add total
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.text(`Total: ${formatCurrency(order.total_amount)}`, pageWidth - 40, finalY);
      
      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100);
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.text('Merci pour votre confiance!', pageWidth / 2, footerY - 5, { align: 'center' });
      doc.text('SONOFF Store - Le meilleur de la domotique en Tunisie', pageWidth / 2, footerY, { align: 'center' });
      
      // Save the PDF
      doc.save(`facture-${order.id.substring(0, 8)}.pdf`);
      
      toast({
        title: "Succès",
        description: "La facture a été générée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de générer la facture: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Chargement...</h1>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Commande non trouvée</h1>
            <Button onClick={handleGoBack}>Retour</Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Facture</h1>
          
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Commande #{order.id.substring(0, 8)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client info */}
                  <div>
                    <h3 className="font-semibold mb-2">Client</h3>
                    <p>{order.customer_name}</p>
                    <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    <p className="text-sm text-gray-600">{order.customer_address}</p>
                  </div>
                  
                  {/* Order info */}
                  <div>
                    <h3 className="font-semibold mb-2">Détails de la commande</h3>
                    <p className="text-sm text-gray-600">Date: {formatDate(order.created_at)}</p>
                    <p className="text-sm text-gray-600">Statut: <span className="font-medium capitalize">{order.status}</span></p>
                    <p className="mt-2 text-lg font-bold text-sonoff-blue">Total: {formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
                
                {/* Items */}
                <div className="mt-8">
                  <h3 className="font-semibold mb-2">Articles</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Produit</th>
                          <th className="px-4 py-2 text-right">Prix unitaire</th>
                          <th className="px-4 py-2 text-right">Quantité</th>
                          <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">{item.product_name}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                          <td className="px-4 py-3" colSpan={3}>Total</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(order.total_amount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-sonoff-blue hover:bg-sonoff-teal" 
                  onClick={generateInvoicePDF}
                >
                  <FileText className="mr-2 h-4 w-4" /> Générer PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvoiceGenerator;
