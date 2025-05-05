
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Save, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

type OrderStatus = 'new' | 'pending' | 'validated' | 'cancelled' | 'in_progress' | 'completed';

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
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface InvoiceSettings {
  header_text: string;
  footer_text: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  tax_id: string;
  logo_url?: string;
  signature_url?: string;
}

const InvoiceGenerator = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    header_text: 'Facture',
    footer_text: 'Merci pour votre achat',
    company_name: 'SMART AFRICA TECHNOLOGY',
    company_address: 'Tunis, Tunisie',
    company_phone: '+216 XX XXX XXX',
    company_email: 'contact@sonoff-tunisie.com',
    tax_id: '',
  });
  
  // Tax variables
  const VAT_RATE = 0.19; // 19% TVA
  const FISCAL_STAMP = 1; // 1 dinar timbre fiscal
  
  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté ou pas admin
    if (user === null || !isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: user === null 
          ? "Vous devez être connecté pour accéder à cette page." 
          : "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
      return;
    }
    
    if (orderId) {
      fetchOrder();
      fetchInvoiceSettings();
    } else {
      navigate('/admin');
    }
  }, [user, isAdmin, orderId, navigate, toast]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      
      // Récupérer les détails de la commande
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      // Récupérer les articles de la commande
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (itemsError) throw itemsError;
      
      setOrder(orderData);
      setOrderItems(itemsData || []);
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger la commande: ${error.message}`,
        variant: "destructive",
      });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceSettings = async () => {
    try {
      // Récupérer les paramètres de facture depuis cms_pages
      const { data, error } = await supabase
        .from('cms_pages')
        .select('content')
        .eq('slug', 'invoice_settings')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.content) {
        try {
          const settings = JSON.parse(data.content);
          setInvoiceSettings(settings);
        } catch (parseError) {
          console.error("Erreur de parsing des paramètres de facture:", parseError);
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la récupération des paramètres de facture:", error);
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

  const calculateVAT = (grossAmount: number): number => {
    // Reverse calculate VAT from gross amount (TTC to HT)
    const netAmount = grossAmount / (1 + VAT_RATE);
    return grossAmount - netAmount;
  };
  
  const calculateNetAmount = (grossAmount: number): number => {
    // Calculate net amount (HT) from gross amount (TTC)
    return grossAmount / (1 + VAT_RATE);
  };

  const generateInvoiceNumber = (orderId: string, date: Date) => {
    // Extraire les 6 premiers caractères de l'ID de commande
    const shortId = orderId.substring(0, 6).toUpperCase();
    
    // Formatter la date au format YYYYMMDD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `INV-${year}${month}${day}-${shortId}`;
  };

  const generatePDF = async () => {
    if (!order) return;
    
    try {
      // Créer un nouveau document PDF
      const doc = new jsPDF();
      
      // Date de la commande
      const orderDate = new Date(order.created_at);
      
      // Générer un numéro de facture
      const invoiceNumber = generateInvoiceNumber(order.id, orderDate);
      
      // Marges
      const margin = 15;
      let y = margin;
      
      // Entête de la facture
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text(invoiceSettings.header_text || "FACTURE", margin, y);
      
      y += 10;
      doc.setFontSize(10);
      doc.text(`N° ${invoiceNumber}`, margin, y);
      
      y += 5;
      doc.text(`Date: ${formatDate(order.created_at)}`, margin, y);
      
      // Informations de l'entreprise et du client côte à côte
      y += 15;
      
      // Entreprise (colonne de gauche)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(invoiceSettings.company_name || "SMART AFRICA TECHNOLOGY", margin, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 5;
      doc.text(invoiceSettings.company_address || "", margin, y);
      y += 5;
      doc.text(`Tél: ${invoiceSettings.company_phone || ""}`, margin, y);
      y += 5;
      doc.text(`Email: ${invoiceSettings.company_email || ""}`, margin, y);
      
      if (invoiceSettings.tax_id) {
        y += 5;
        doc.text(`Matricule fiscal: ${invoiceSettings.tax_id}`, margin, y);
      }
      
      // Client (colonne de droite)
      const rightColumnX = 110; // Position X pour la colonne de droite
      let rightY = y - 20; // On revient en haut pour commencer la colonne du client
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("Client:", rightColumnX, rightY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      rightY += 5;
      doc.text(`Nom: ${order.customer_name}`, rightColumnX, rightY);
      rightY += 5;
      doc.text(`Téléphone: ${order.customer_phone}`, rightColumnX, rightY);
      rightY += 5;
      doc.text(`Adresse: ${order.customer_address}`, rightColumnX, rightY);
      
      // On prend le y le plus grand entre les deux colonnes
      y = Math.max(y, rightY) + 10;
      
      // Tableau des articles
      const tableColumn = [
        { header: 'Article', dataKey: 'product' },
        { header: 'Prix unitaire HT', dataKey: 'priceHT' },
        { header: 'Prix unitaire TTC', dataKey: 'priceTTC' },
        { header: 'Quantité', dataKey: 'quantity' },
        { header: 'Total HT', dataKey: 'totalHT' },
        { header: 'Total TTC', dataKey: 'totalTTC' }
      ];
      
      const tableRows = orderItems.map(item => {
        const priceHT = item.price / (1 + VAT_RATE);
        const totalHT = priceHT * item.quantity;
        const totalTTC = item.price * item.quantity;
        
        return {
          product: item.product_name,
          priceHT: formatCurrency(priceHT),
          priceTTC: formatCurrency(item.price),
          quantity: item.quantity,
          totalHT: formatCurrency(totalHT),
          totalTTC: formatCurrency(totalTTC)
        };
      });
      
      // Utiliser autoTable correctement
      autoTable(doc, {
        head: [['Article', 'Prix HT', 'Prix TTC', 'Quantité', 'Total HT', 'Total TTC']],
        body: tableRows.map(row => [
          row.product, 
          row.priceHT, 
          row.priceTTC, 
          row.quantity, 
          row.totalHT, 
          row.totalTTC
        ]),
        startY: y,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 71, 187] }
      });
      
      // Récupérer la position Y finale après le tableau
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // Calculs des totaux
      const totalTTC = order.total_amount;
      const totalHT = calculateNetAmount(totalTTC);
      const totalVAT = calculateVAT(totalTTC);
      const grandTotal = totalTTC + FISCAL_STAMP;
      
      // Résumé des totaux
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Total HT:', 130, finalY);
      doc.text(formatCurrency(totalHT), 170, finalY);
      
      doc.text('TVA (19%):', 130, finalY + 5);
      doc.text(formatCurrency(totalVAT), 170, finalY + 5);
      
      doc.text('Total TTC:', 130, finalY + 10);
      doc.text(formatCurrency(totalTTC), 170, finalY + 10);
      
      doc.text('Timbre fiscal:', 130, finalY + 15);
      doc.text(formatCurrency(FISCAL_STAMP), 170, finalY + 15);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total à payer:', 130, finalY + 25);
      doc.text(formatCurrency(grandTotal), 170, finalY + 25);
      
      // Pied de page / Message de remerciement
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(invoiceSettings.footer_text || "Merci pour votre achat", margin, 270);
      
      // Enregistrer le PDF
      doc.save(`facture_${invoiceNumber}.pdf`);
      
    } catch (error: any) {
      console.error("Erreur lors de la génération du PDF:", error);
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
            <p>Chargement...</p>
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
            <p>Commande non trouvée</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sonoff-blue mb-2">Facture</h1>
            <p className="text-gray-600">
              Commande passée le {formatDate(order.created_at)} par {order.customer_name}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/sales')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux ventes
            </Button>
            
            <Button 
              className="bg-sonoff-blue hover:bg-sonoff-teal"
              onClick={generatePDF}
            >
              <Download className="mr-2 h-4 w-4" /> Télécharger PDF
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                generatePDF();
                setTimeout(() => window.print(), 100);
              }}
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimer
            </Button>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Informations de l'entreprise */}
            <div>
              <h2 className="text-xl font-bold mb-4">{invoiceSettings.company_name}</h2>
              <p className="mb-1">{invoiceSettings.company_address}</p>
              <p className="mb-1">Tél: {invoiceSettings.company_phone}</p>
              <p className="mb-1">Email: {invoiceSettings.company_email}</p>
              {invoiceSettings.tax_id && (
                <p className="mb-1">Matricule fiscal: {invoiceSettings.tax_id}</p>
              )}
            </div>
            
            {/* Informations du client */}
            <div>
              <h2 className="text-xl font-bold mb-4">Client</h2>
              <p className="mb-1"><span className="font-medium">Nom:</span> {order.customer_name}</p>
              <p className="mb-1"><span className="font-medium">Téléphone:</span> {order.customer_phone}</p>
              <p className="mb-1"><span className="font-medium">Adresse:</span> {order.customer_address}</p>
              <p className="mb-1"><span className="font-medium">Date:</span> {formatDate(order.created_at)}</p>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Détails de la commande</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>
                  Facture générée le {new Date().toLocaleDateString()}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(order.total_amount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="text-center text-gray-500 mt-12">
            <p>{invoiceSettings.footer_text}</p>
            
            {invoiceSettings.signature_url && (
              <div className="mt-8">
                <img 
                  src={invoiceSettings.signature_url} 
                  alt="Signature" 
                  className="h-20 mx-auto"
                />
                <p className="mt-2">Signature autorisée</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvoiceGenerator;
