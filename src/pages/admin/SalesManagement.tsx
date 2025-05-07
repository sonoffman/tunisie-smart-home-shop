
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, FileText, Trash2 } from 'lucide-react';
import OrderStatusSelector from '@/components/sales/OrderStatusSelector';
import OrderStateSelector from '@/components/sales/OrderStateSelector';
import OrderDetailDialog from '@/components/sales/OrderDetailDialog';
import DeleteOrderDialog from '@/components/sales/DeleteOrderDialog';
import { Order, OrderItem } from '@/types/supabase';

const SalesManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

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
  }, [user, isAdmin, navigate, toast]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to include the state field with a default value if it's not present
      const formattedData = data.map(order => ({
        ...order,
        state: order.state || 'en_cours'
      })) as Order[];

      setOrders(formattedData);
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

  const fetchOrderDetails = async (orderId: string) => {
    try {
      // Fetch order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Find the order and add items to it
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder({
          ...order,
          order_items: orderItems as OrderItem[]
        });
        setViewDialogOpen(true);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les détails de la commande: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderToDelete);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToDelete);

      if (orderError) throw orderError;

      toast({
        title: "Succès",
        description: "La commande a été supprimée avec succès",
      });

      // Update local state
      setOrders(orders.filter(order => order.id !== orderToDelete));
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la commande: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleGenerateInvoice = (orderId: string) => {
    navigate(`/admin/invoice/${orderId}`);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: status as Order['status'] })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: status as Order['status'] } : order
      ));

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: status as Order['status'] });
      }

      toast({
        title: "Succès",
        description: `Statut de la commande mis à jour: ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le statut: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateOrderState = async (orderId: string, state: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ state })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, state } : order
      ));

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, state });
      }

      toast({
        title: "Succès",
        description: `État de la commande mis à jour: ${state === 'en_cours' ? 'En cours' : 'Terminé'}`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour l'état: ${error.message}`,
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
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des ventes</h1>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Retour au dashboard
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>Liste des commandes</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>État</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Aucune commande trouvée</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{order.total_amount.toFixed(3)} DT</TableCell>
                    <TableCell>
                      <OrderStatusSelector 
                        status={order.status} 
                        onStatusChange={(status) => updateOrderStatus(order.id, status)} 
                      />
                    </TableCell>
                    <TableCell>
                      <OrderStateSelector
                        state={order.state || 'en_cours'}
                        onStateChange={(state) => updateOrderState(order.id, state)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => fetchOrderDetails(order.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleGenerateInvoice(order.id)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Facture
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500"
                          onClick={() => {
                            setOrderToDelete(order.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* View Order Dialog */}
        <OrderDetailDialog
          isOpen={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          order={selectedOrder}
          onStatusChange={updateOrderStatus}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteOrderDialog
          isOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={handleDeleteOrder}
        />
      </div>
    </Layout>
  );
};

export default SalesManagement;
