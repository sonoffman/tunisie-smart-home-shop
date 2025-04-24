
import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Pencil, 
  FileText, 
  AlertTriangle,
} from 'lucide-react';

type OrderStatus = 'new' | 'pending' | 'validated' | 'cancelled';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  cancellation_reason?: string;
  items?: OrderItem[];
  has_customer_issues?: boolean;
}

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
}

const OrderManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    // Redirect non-admin users
    if (user === null) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
    } else if (!isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
    } else {
      fetchOrders();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all((ordersData as Order[]).map(async (order) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) throw itemsError;

        // Check if customer phone exists in customer_issues table
        const { data: issuesData, error: issuesError } = await supabase
          .from('customer_issues')
          .select('id')
          .eq('customer_phone', order.customer_phone)
          .eq('resolved', false);

        if (issuesError) throw issuesError;

        return {
          ...order,
          items: itemsData as OrderItem[],
          has_customer_issues: issuesData && issuesData.length > 0
        };
      }));

      setOrders(ordersWithItems);
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

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, reason?: string) => {
    try {
      const updateData: { status: OrderStatus, cancellation_reason?: string } = {
        status: newStatus
      };
      
      if (newStatus === 'cancelled' && reason) {
        updateData.cancellation_reason = reason;
      }
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Le statut de la commande a été modifié en ${getStatusLabel(newStatus)}`,
      });

      // Refresh orders
      fetchOrders();
      setCancellationReason('');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de modifier le statut: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch(status) {
      case 'new': return 'Nouveau';
      case 'pending': return 'En attente';
      case 'validated': return 'Validé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2) + ' TND';
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des commandes</h1>
          
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Retour au dashboard
          </Button>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Label htmlFor="status-filter">Filtrer par statut:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="new">Nouvelles</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="validated">Validées</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <span className="text-sm text-gray-500">
              {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} trouvée{filteredOrders.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>Liste des commandes</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Aucune commande trouvée</TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.customer_name}
                      {order.has_customer_issues && (
                        <span className="ml-2 inline-flex items-center">
                          <AlertTriangle className="h-4 w-4 text-amber-500" aria-label="Client avec problème signalé" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{order.customer_phone}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* View/Edit Order Details */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setCurrentOrder(order)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Détails de la commande</DialogTitle>
                              <DialogDescription>
                                Commande #{order.id.slice(0, 8)} - {formatDate(order.created_at)}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {currentOrder && (
                              <div className="grid gap-6 py-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                                    <p className="font-medium">{currentOrder.customer_name}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h3>
                                    <p className="font-medium">{currentOrder.customer_phone}</p>
                                  </div>
                                  <div className="md:col-span-2">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Adresse</h3>
                                    <p className="font-medium">{currentOrder.customer_address}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-2">Produits</h3>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Produit</TableHead>
                                        <TableHead className="text-right">Prix</TableHead>
                                        <TableHead className="text-right">Qté</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {currentOrder.items && currentOrder.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>{item.product_name}</TableCell>
                                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                          <TableCell className="text-right">{item.quantity}</TableCell>
                                          <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(currentOrder.total_amount)}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                                
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-2">Statut de la commande</h3>
                                  <div className="flex space-x-2">
                                    {/* Set to Pending */}
                                    <Button 
                                      variant={currentOrder.status === 'pending' ? 'default' : 'outline'}
                                      onClick={() => handleStatusChange(currentOrder.id, 'pending')}
                                      className="flex-1"
                                    >
                                      En attente
                                    </Button>
                                    
                                    {/* Set to Validated */}
                                    <Button 
                                      variant={currentOrder.status === 'validated' ? 'default' : 'outline'}
                                      onClick={() => handleStatusChange(currentOrder.id, 'validated')}
                                      className="flex-1"
                                    >
                                      Valider
                                    </Button>
                                    
                                    {/* Dialog for cancellation with reason */}
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button 
                                          variant={currentOrder.status === 'cancelled' ? 'destructive' : 'outline'}
                                          className="flex-1"
                                        >
                                          Annuler
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Annuler la commande</DialogTitle>
                                          <DialogDescription>
                                            Veuillez indiquer la raison de l'annulation de cette commande.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <Textarea
                                            value={cancellationReason}
                                            onChange={(e) => setCancellationReason(e.target.value)}
                                            placeholder="Raison d'annulation..."
                                            className="min-h-[100px]"
                                          />
                                        </div>
                                        <div className="flex justify-end gap-4">
                                          <DialogClose asChild>
                                            <Button variant="outline">Annuler</Button>
                                          </DialogClose>
                                          <DialogClose>
                                            <Button 
                                              variant="destructive" 
                                              onClick={() => handleStatusChange(currentOrder.id, 'cancelled', cancellationReason)}
                                              disabled={!cancellationReason.trim()}
                                            >
                                              Confirmer l'annulation
                                            </Button>
                                          </DialogClose>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                  
                                  {currentOrder.status === 'cancelled' && currentOrder.cancellation_reason && (
                                    <div className="mt-4 bg-red-50 p-3 rounded-md">
                                      <p className="text-sm text-red-800 font-medium">Raison d'annulation:</p>
                                      <p className="text-sm text-red-600">{currentOrder.cancellation_reason}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex justify-end space-x-4">
                                  <DialogClose asChild>
                                    <Button variant="outline">Fermer</Button>
                                  </DialogClose>
                                  <Button 
                                    onClick={() => navigate(`/admin/invoices/${currentOrder.id}`)}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Générer facture
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {/* Generate Invoice */}
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => navigate(`/admin/invoices/${order.id}`)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default OrderManagement;
