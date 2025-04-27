
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Save, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type OrderStatus = 'new' | 'pending' | 'validated' | 'cancelled';

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: OrderStatus;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

const InvoiceGenerator = () => {
  const { user, isAdmin } = useAuth();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
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
    } else {
      fetchOrder();
      fetchOrderItems();
    }
  }, [user, isAdmin, navigate, toast, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger la commande: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les éléments de la commande: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} TND`;
  };

  const generatePDF = async () => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Company logo and info
      doc.setFontSize(20);
      doc.setTextColor(0, 71, 187); // Sonoff blue
      doc.text('SONOFF TUNISIE', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('123 Rue de l\'Innovation, Tunis 1001, Tunisie', 105, 27, { align: 'center' });
      doc.text('Tel: +216 71 234 567 | Email: info@sonoff-tunisie.com', 105, 32, { align: 'center' });
      
      // Invoice title and number
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(`FACTURE #${order?.id?.slice(0, 8).toUpperCase() || 'N/A'}`, 105, 45, { align: 'center' });
      
      // Customer info
      doc.setFontSize(11);
      doc.text('Client:', 15, 60);
      doc.text(`Nom: ${order?.customer_name || 'N/A'}`, 15, 65);
      doc.text(`Téléphone: ${order?.customer_phone || 'N/A'}`, 15, 70);
      doc.text(`Adresse: ${order?.customer_address || 'N/A'}`, 15, 75);
      
      // Date info
      doc.text('Date de facture:', 140, 60);
      doc.text(`${order ? formatDate(order.created_at) : 'N/A'}`, 140, 65);
      
      // Items table
      const tableColumn = ["Produit", "Quantité", "Prix unitaire", "Total"];
      const tableRows: any[] = [];
      
      let subtotal = 0;
      
      orderItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        tableRows.push([
          item.product_name,
          item.quantity,
          `${item.price.toFixed(2)} TND`,
          `${itemTotal.toFixed(2)} TND`
        ]);
      });
      
      // Fix for the autoTable error - using the jspdf-autotable properly
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 90,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 71, 187] }
      });
      
      const finalY = (doc as any).lastAutoTable.finalY;
      
      // Total amount
      doc.line(14, finalY + 10, 196, finalY + 10);
      doc.text('Sous-total:', 130, finalY + 20);
      doc.text(`${subtotal.toFixed(2)} TND`, 175, finalY + 20);
      doc.text('TVA (19%):', 130, finalY + 25);
      doc.text(`${(subtotal * 0.19).toFixed(2)} TND`, 175, finalY + 25);
      doc.line(130, finalY + 27, 195, finalY + 27);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Total:', 130, finalY + 35);
      doc.text(`${(subtotal * 1.19).toFixed(2)} TND`, 175, finalY + 35);
      
      // Save the PDF
      doc.save(`facture-${order?.id?.slice(0, 8) || 'sonoff'}.pdf`);
      
      toast({
        title: "Succès",
        description: "La facture a été générée avec succès",
      });
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast({
        title: "Erreur",
        description: `Impossible de générer la facture: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">
            Facture #{order?.id?.slice(0, 8).toUpperCase() || 'N/A'}
          </h1>
          
          <Button variant="outline" onClick={() => navigate('/admin/invoices')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste des factures
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p>Chargement...</p>
          </div>
        ) : order ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Informations de la commande</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Client:</strong> {order.customer_name}
                </div>
                <div>
                  <strong>Téléphone:</strong> {order.customer_phone}
                </div>
                <div>
                  <strong>Adresse:</strong> {order.customer_address}
                </div>
                <div>
                  <strong>Date de la commande:</strong> {formatDate(order.created_at)}
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Éléments de la commande</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.product_name}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-6 border-t">
              <div className="text-right">
                <h3 className="text-lg font-semibold">
                  Total: {formatCurrency(order.total_amount)}
                </h3>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-4">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </Button>
              <Button className="bg-sonoff-blue hover:bg-sonoff-teal" onClick={generatePDF}>
                <Download className="mr-2 h-4 w-4" />
                Générer PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p>Commande non trouvée.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InvoiceGenerator;
