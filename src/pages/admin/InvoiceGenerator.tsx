
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface OrderItem {
  product_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  items: OrderItem[];
}

const InvoiceGenerator = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceNumber, setInvoiceNumber] = useState('');

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
      fetchOrderDetails();
      // Générer un numéro de facture unique
      const date = new Date();
      setInvoiceNumber(`INV-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`);
    }
  }, [user, isAdmin, orderId, navigate, toast]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      
      // Récupération des informations de la commande
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Récupération des articles de la commande
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Combinaison des données
      const fullOrder = {
        ...orderData,
        items: itemsData
      };

      setOrder(fullOrder);
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} TND`;
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = () => {
    if (!order) return;

    const doc = new jsPDF();
    
    // Configuration de base
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Facture', 105, 20, { align: 'center' });
    
    // Informations de l'entreprise
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Sonoff Tunisie', 20, 40);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Avenue de la Liberté', 20, 46);
    doc.text('Tunis, Tunisie', 20, 52);
    doc.text('Tél: +216 71 123 456', 20, 58);
    doc.text('Email: contact@sonofftunisie.com', 20, 64);
    
    // Numéro et date de facture
    doc.setFontSize(10);
    doc.text(`Facture #: ${invoiceNumber}`, 140, 40);
    doc.text(`Date: ${formatDate(new Date().toISOString())}`, 140, 46);
    doc.text(`Commande #: ${order.id.slice(0, 8)}`, 140, 52);
    doc.text(`Date de commande: ${formatDate(order.created_at)}`, 140, 58);
    
    // Informations du client
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Facturé à:', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(order.customer_name, 20, 88);
    doc.text(`Tél: ${order.customer_phone}`, 20, 96);
    doc.text(`Adresse: ${order.customer_address}`, 20, 104);
    
    // Tableau des articles
    doc.autoTable({
      startY: 120,
      head: [['Produit', 'Prix unitaire', 'Quantité', 'Total']],
      body: order.items.map(item => [
        item.product_name,
        formatCurrency(item.price),
        item.quantity.toString(),
        formatCurrency(item.price * item.quantity)
      ]),
      foot: [
        ['', '', 'Total', formatCurrency(order.total_amount)]
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      }
    });
    
    // Termes et conditions
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Termes et conditions:', 20, finalY + 20);
    doc.setFont('helvetica', 'normal');
    doc.text('Paiement à la livraison', 20, finalY + 28);
    doc.text('Les produits restent la propriété de Sonoff Tunisie jusqu'au paiement complet', 20, finalY + 36);
    doc.text('Garantie de 12 mois sur tous les produits', 20, finalY + 44);
    
    // Signature
    doc.text('Signature: _______________________', 140, finalY + 44);
    
    // Pied de page
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Merci pour votre confiance!', 105, finalY + 60, { align: 'center' });
    
    // Télécharger le PDF
    doc.save(`facture_${invoiceNumber}.pdf`);
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => navigate('/admin/orders')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux commandes
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Retourner à la liste des commandes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Imprimer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Imprimer la facture</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={generatePDF}>
                    <Download className="mr-2 h-4 w-4" /> Télécharger PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Télécharger la facture au format PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Chargement...</p>
          </div>
        ) : !order ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Commande non trouvée</h2>
            <p>La commande demandée n'existe pas ou n'est pas accessible.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8" id="invoice-to-print">
            {/* Entête de la facture */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Sonoff Tunisie</h1>
                <p>123 Avenue de la Liberté</p>
                <p>Tunis, Tunisie</p>
                <p>Tél: +216 71 123 456</p>
                <p>Email: contact@sonofftunisie.com</p>
              </div>
              
              <div className="text-right">
                <h2 className="text-xl font-bold mb-2">Facture</h2>
                <p className="text-gray-600">Facture #: {invoiceNumber}</p>
                <p className="text-gray-600">Date: {formatDate(new Date().toISOString())}</p>
                <p className="text-gray-600">Commande #: {order.id.slice(0, 8)}</p>
                <p className="text-gray-600">Date de commande: {formatDate(order.created_at)}</p>
              </div>
            </div>

            {/* Informations client */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-2">Facturé à:</h3>
              <p>{order.customer_name}</p>
              <p>Tél: {order.customer_phone}</p>
              <p>Adresse: {order.customer_address}</p>
            </div>
            
            {/* Tableau des articles */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2 px-4 text-left">Produit</th>
                    <th className="py-2 px-4 text-right">Prix unitaire</th>
                    <th className="py-2 px-4 text-right">Quantité</th>
                    <th className="py-2 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.product_name}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.price)}</td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td className="py-3 px-4" colSpan={2}></td>
                    <td className="py-3 px-4 text-right">Total</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(order.total_amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Termes et conditions */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-2">Termes et conditions:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                <li>Paiement à la livraison</li>
                <li>Les produits restent la propriété de Sonoff Tunisie jusqu'au paiement complet</li>
                <li>Garantie de 12 mois sur tous les produits</li>
              </ul>
            </div>
            
            {/* Signature */}
            <div className="flex justify-end mb-8">
              <div className="border-t border-gray-300 pt-2 w-64 text-center">
                <p>Signature</p>
              </div>
            </div>
            
            {/* Pied de page */}
            <div className="text-center text-sm text-gray-500 mt-12">
              <p>Merci pour votre confiance!</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InvoiceGenerator;
