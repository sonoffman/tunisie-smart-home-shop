
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileText, Plus, Search, Trash2, Edit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X, Check } from 'lucide-react';

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

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

const SalesManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateSaleDialogOpen, setIsCreateSaleDialogOpen] = useState(false);
  const [isEditOrderDialogOpen, setIsEditOrderDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentOrderItems, setCurrentOrderItems] = useState<CartItem[]>([]);
  
  // États pour la création/modification de vente
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');

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
      fetchValidatedOrders();
      fetchProducts();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchValidatedOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'validated')
        .order('created_at', { ascending: false });

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

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity')
        .order('name');

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les produits: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleCreateSale = () => {
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setIsCreateSaleDialogOpen(true);
  };

  const handleEditOrder = async (order: Order) => {
    setCurrentOrder(order);
    setCustomerName(order.customer_name);
    setCustomerPhone(order.customer_phone);
    setCustomerAddress(order.customer_address);
    
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (error) throw error;
      
      const items: CartItem[] = (data || []).map(item => ({
        product_id: item.product_id || '',
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity
      }));
      
      setCartItems(items);
      setCurrentOrderItems(items);
      setIsEditOrderDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les détails de la commande: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const saveSale = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit",
        variant: "destructive",
      });
      return;
    }
    
    if (!customerName || !customerPhone || !customerAddress) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs client",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Créer la commande
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          total_amount: calculateTotal(cartItems),
          status: 'validated'
        })
        .select()
        .single();

      if (orderError) throw orderError;
      
      // Ajouter les éléments de la commande
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
      
      // Mettre à jour les stocks
      for (const item of cartItems) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          const newStock = Math.max(0, product.stock_quantity - item.quantity);
          
          await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', item.product_id);
        }
      }
      
      toast({
        title: "Succès",
        description: "La vente a été enregistrée avec succès",
      });
      
      setIsCreateSaleDialogOpen(false);
      fetchValidatedOrders();
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer la vente: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateOrder = async () => {
    if (!currentOrder) return;
    
    if (cartItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit",
        variant: "destructive",
      });
      return;
    }
    
    if (!customerName || !customerPhone || !customerAddress) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs client",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Mettre à jour les informations de la commande
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          total_amount: calculateTotal(cartItems)
        })
        .eq('id', currentOrder.id);

      if (orderError) throw orderError;
      
      // Supprimer tous les éléments de commande existants
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', currentOrder.id);
        
      if (deleteError) throw deleteError;
      
      // Ajouter les nouveaux éléments de commande
      const orderItems = cartItems.map(item => ({
        order_id: currentOrder.id,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
      
      // Ajuster les stocks si nécessaire
      // Pour les anciens éléments, réintégrer le stock
      for (const oldItem of currentOrderItems) {
        const product = products.find(p => p.id === oldItem.product_id);
        if (product) {
          await supabase
            .from('products')
            .update({ 
              stock_quantity: product.stock_quantity + oldItem.quantity 
            })
            .eq('id', oldItem.product_id);
        }
      }
      
      // Pour les nouveaux éléments, déduire du stock
      for (const newItem of cartItems) {
        const product = products.find(p => p.id === newItem.product_id);
        if (product) {
          const newStock = Math.max(0, product.stock_quantity - newItem.quantity);
          
          await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', newItem.product_id);
        }
      }
      
      toast({
        title: "Succès",
        description: "La commande a été mise à jour avec succès",
      });
      
      setIsEditOrderDialogOpen(false);
      fetchValidatedOrders();
      fetchProducts();
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour la commande: ${error.message}`,
        variant: "destructive",
      });
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

  // Filtrer les commandes selon le terme de recherche
  const filteredOrders = orders.filter(order => 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_phone.includes(searchTerm) ||
    order.customer_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrer les produits selon le terme de recherche
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des Ventes</h1>
          
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleCreateSale} className="bg-sonoff-blue hover:bg-sonoff-teal">
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle vente
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créer une nouvelle vente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom, téléphone ou adresse"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Commandes validées</h2>
          {loading ? (
            <div className="text-center py-10">
              <p>Chargement...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableCaption>Liste des commandes validées</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell className="font-medium">{order.customer_name}</TableCell>
                        <TableCell>{order.customer_phone}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{order.customer_address}</div>
                        </TableCell>
                        <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditOrder(order)}
                                  >
                                    <Edit className="mr-1 h-4 w-4" /> Modifier
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Modifier la commande</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-sonoff-blue hover:bg-sonoff-teal"
                                    onClick={() => navigate(`/admin/invoices/${order.id}`)}
                                  >
                                    <FileText className="mr-1 h-4 w-4" /> Facture
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Générer une facture</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Aucune commande validée trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Dialog pour créer une nouvelle vente */}
        <Dialog open={isCreateSaleDialogOpen} onOpenChange={setIsCreateSaleDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Créer une vente</DialogTitle>
              <DialogDescription>
                Sélectionnez les produits et les quantités pour créer une vente
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Informations client</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Nom du client</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nom complet"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customerPhone">Téléphone</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customerAddress">Adresse</Label>
                    <Input
                      id="customerAddress"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Adresse complète"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Panier</h3>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-md">
                      <p className="text-gray-500">Le panier est vide</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <button 
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                              onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                              type="button"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button 
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              type="button"
                            >
                              +
                            </button>
                            
                            <button 
                              className="ml-2 text-red-500 hover:text-red-700"
                              onClick={() => removeFromCart(item.product_id)}
                              type="button"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg">{formatCurrency(calculateTotal(cartItems))}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <Label htmlFor="productSearch">Rechercher un produit</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="productSearch"
                      className="pl-9"
                      placeholder="Nom du produit"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            Aucun produit trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{formatCurrency(product.price)}</TableCell>
                            <TableCell>{product.stock_quantity}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={product.stock_quantity <= 0}
                                onClick={() => addToCart(product)}
                              >
                                <Plus size={16} className="mr-1" /> Ajouter
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline"
                onClick={() => setIsCreateSaleDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={saveSale}
                className="bg-sonoff-blue hover:bg-sonoff-teal"
              >
                <Check size={16} className="mr-2" /> Valider la vente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog pour modifier une commande */}
        <Dialog open={isEditOrderDialogOpen} onOpenChange={setIsEditOrderDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Modifier la commande</DialogTitle>
              <DialogDescription>
                {currentOrder && `Commande du ${formatDate(currentOrder.created_at)}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Informations client</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Nom du client</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nom complet"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customerPhone">Téléphone</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customerAddress">Adresse</Label>
                    <Input
                      id="customerAddress"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Adresse complète"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Panier</h3>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-md">
                      <p className="text-gray-500">Le panier est vide</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <button 
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                              onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                              type="button"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button 
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              type="button"
                            >
                              +
                            </button>
                            
                            <button 
                              className="ml-2 text-red-500 hover:text-red-700"
                              onClick={() => removeFromCart(item.product_id)}
                              type="button"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg">{formatCurrency(calculateTotal(cartItems))}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <Label htmlFor="productSearch">Rechercher un produit</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="productSearch"
                      className="pl-9"
                      placeholder="Nom du produit"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            Aucun produit trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{formatCurrency(product.price)}</TableCell>
                            <TableCell>{product.stock_quantity}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addToCart(product)}
                              >
                                <Plus size={16} className="mr-1" /> Ajouter
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline"
                onClick={() => setIsEditOrderDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={updateOrder}
                className="bg-sonoff-blue hover:bg-sonoff-teal"
              >
                <Check size={16} className="mr-2" /> Mettre à jour la commande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SalesManagement;
