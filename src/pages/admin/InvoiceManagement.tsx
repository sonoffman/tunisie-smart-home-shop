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
import { ArrowLeft, Download, FileText, Plus, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import jsPDF from 'jspdf';
// @ts-ignore
import 'jspdf-autotable';
import { Order, OrderItem } from '@/types/supabase';

type OrderStatusFilter = Order['status'] | 'all';

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
        // Now statusFilter is properly typed as a valid order status when it's not 'all'
        query = query.eq('status', statusFilter as Order['status']);
      }
      
      // Exécuter la requête
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to Order[] to fix TypeScript error
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

  const generateManualInvoice = () => {
    // Rediriger vers une interface de création manuelle de facture
    navigate('/admin/invoices/new');
  };

  const handleRowClick = (orderId: string) => {
    navigate(`/admin/invoices/${orderId}`);
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
      // Fix: Use optional chaining to safely access order_id
      return item.order_id === order.id && item.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    return orderProductItems.length > 0;
  });

  if (!user || !isAdmin) {
    return null;
  }

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

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setIsGenerateManualDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Créer une facture
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Créer une nouvelle facture</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-2">
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
                    <SelectItem value="processing">En cours de traitement</SelectItem>
                    <SelectItem value="shipped">Expédiées</SelectItem>
                    <SelectItem value="delivered">Livrées</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
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
            <TableCaption>Liste des commandes facturables</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
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
                  <TableRow 
                    key={order.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(order.id)}
                  >
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{order.customer_phone}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/invoices/${order.id}`);
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Générer une facture</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog pour la création manuelle de facture */}
        <Dialog open={isGenerateManualDialogOpen} onOpenChange={setIsGenerateManualDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une facture manuellement</DialogTitle>
              <DialogDescription>
                Choisissez comment vous souhaitez créer votre facture.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => {
                  setIsGenerateManualDialogOpen(false);
                  navigate('/admin/sales');
                }}
              >
                <Plus className="h-6 w-6 mb-2" />
                <span>Nouvelle vente manuelle</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => {
                  setIsGenerateManualDialogOpen(false);
                  navigate('/admin/orders');
                }}
              >
                <FileText className="h-6 w-6 mb-2" />
                <span>À partir d'une commande</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default InvoiceManagement;
