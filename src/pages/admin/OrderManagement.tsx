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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Eye, Search, Settings, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

const OrderManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
        // Fix type issue by explicitly casting the statusFilter to OrderStatus when it's not 'all'
        query = query.eq('status', statusFilter as OrderStatus);
      }
      
      // Exécuter la requête
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
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

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      
      setOrderItems(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les détails de la commande: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleViewOrder = async (order: Order) => {
    setCurrentOrder(order);
    await fetchOrderItems(order.id);
    setIsViewDialogOpen(true);
  };

  const handleChangeStatus = (order: Order) => {
    setCurrentOrder(order);
    setSelectedStatus(order.status);
    setIsStatusDialogOpen(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setCurrentOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const updateOrderStatus = async () => {
    if (!currentOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: selectedStatus })
        .eq('id', currentOrder.id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour avec succès",
      });

      setIsStatusDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le statut: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async () => {
    if (!currentOrder) return;

    try {
      // D'abord supprimer tous les éléments de commande associés
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', currentOrder.id);

      if (itemsError) throw itemsError;

      // Ensuite supprimer la commande elle-même
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', currentOrder.id);

      if (orderError) throw orderError;

      toast({
        title: "Commande supprimée",
        description: "La commande a été supprimée avec succès",
      });

      setIsDeleteDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la commande: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrer les commandes selon le terme de recherche
  const filteredOrders = orders.filter(order => 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_phone.includes(searchTerm) ||
    orderItems.some(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des Commandes</h1>
          
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

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="new">Nouvelles</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="validated">Validées</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom, téléphone ou produit"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>Liste des commandes</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Aucune commande trouvée</TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{order.customer_phone}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{order.customer_address}</div>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Voir les détails</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleChangeStatus(order)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Changer le statut</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteOrder(order)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Supprimer la commande</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog pour afficher les détails d'une commande */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails de la commande</DialogTitle>
              <DialogDescription>
                {currentOrder && (
                  <>
                    Commande passée le {formatDate(currentOrder.created_at)} par {currentOrder.customer_name}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {currentOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">Informations client</h3>
                    <div className="space-y-2 mt-2">
                      <p><span className="font-medium">Nom:</span> {currentOrder.customer_name}</p>
                      <p><span className="font-medium">Téléphone:</span> {currentOrder.customer_phone}</p>
                      <p><span className="font-medium">Adresse:</span> {currentOrder.customer_address}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">Détails de commande</h3>
                    <div className="space-y-2 mt-2">
                      <p>
                        <span className="font-medium">Statut:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(currentOrder.status)}`}>
                          {getStatusLabel(currentOrder.status)}
                        </span>
                      </p>
                      <p><span className="font-medium">Total:</span> {formatCurrency(currentOrder.total_amount)}</p>
                      <p><span className="font-medium">ID de commande:</span> {currentOrder.id}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Articles</h3>
                  <div className="bg-gray-50 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead className="text-right">Prix unitaire</TableHead>
                          <TableHead className="text-right">Quantité</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog pour changer le statut d'une commande */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Changer le statut</DialogTitle>
              <DialogDescription>
                Modifiez le statut de la commande
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nouveau</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="validated">Validé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsStatusDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={updateOrderStatus}
                className="bg-sonoff-blue hover:bg-sonoff-teal"
              >
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog pour supprimer une commande */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Supprimer la commande</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            
            {currentOrder && (
              <div className="py-4">
                <p><span className="font-medium">Client:</span> {currentOrder.customer_name}</p>
                <p><span className="font-medium">Date:</span> {formatDate(currentOrder.created_at)}</p>
                <p><span className="font-medium">Total:</span> {formatCurrency(currentOrder.total_amount)}</p>
              </div>
            )}
            
            <DialogFooter className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive"
                onClick={deleteOrder}
              >
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default OrderManagement;
