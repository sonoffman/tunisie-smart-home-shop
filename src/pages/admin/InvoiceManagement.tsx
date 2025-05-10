
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import OrdersTable from '@/components/invoice/OrdersTable';
import InvoiceFilters, { OrderStatusFilter } from '@/components/invoice/InvoiceFilters';
import CreateInvoiceDialog from '@/components/invoice/CreateInvoiceDialog';
import { Order, OrderItem } from '@/types/supabase';

const InvoiceManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('validated');
  const [isGenerateManualDialogOpen, setIsGenerateManualDialogOpen] = useState(false);

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
      fetchOrders();
    }
  }, [user, isAdmin, navigate, toast, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Construire la requête de base
      let query = supabase
        .from('orders')
        .select('*');
      
      // Ajouter le filtre de statut si différent de 'all'
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as Order['status']);
      }
      
      // Exécuter la requête
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data as unknown as Order[]);
      
      // Récupérer tous les éléments de commande pour la recherche par produit
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*');
        
      if (itemsError) throw itemsError;
      
      setOrderItems(items || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les commandes: ${error.message}`,
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

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'new': return 'Nouveau';
      case 'pending': return 'En attente';
      case 'validated': return 'Validé';
      case 'cancelled': return 'Annulé';
      case 'processing': return 'En cours de traitement';
      case 'shipped': return 'Expédié';
      case 'delivered': return 'Livré';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrer les commandes selon le terme de recherche
  const filteredOrders = orders.filter(order => {
    if (searchTerm === '') return true;
    
    // Vérifier le nom du client et le téléphone
    if (order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.includes(searchTerm)) {
      return true;
    }
    
    // Vérifier les produits dans la commande
    const orderProductItems = orderItems.filter(item => {
      return item.order_id === order.id && item.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    return orderProductItems.length > 0;
  });

  if (!user || !isAdmin) {
    return null;
  }

  // Function to handle status filter changes with proper typing
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as OrderStatusFilter);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des Factures</h1>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Retourner au tableau de bord d'administration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <InvoiceFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          handleStatusFilterChange={handleStatusFilterChange}
          setIsGenerateManualDialogOpen={setIsGenerateManualDialogOpen}
        />
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <OrdersTable 
            loading={loading}
            orders={filteredOrders}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            getStatusLabel={getStatusLabel}
            getStatusColor={getStatusColor}
          />
        </div>

        <CreateInvoiceDialog 
          isOpen={isGenerateManualDialogOpen} 
          onOpenChange={setIsGenerateManualDialogOpen} 
        />
      </div>
    </Layout>
  );
};

export default InvoiceManagement;
