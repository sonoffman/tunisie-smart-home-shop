
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
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
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface SaleItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

const saleFormSchema = z.object({
  customer_name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  customer_phone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres"),
  customer_address: z.string().min(10, "L'adresse doit être complète (au moins 10 caractères)")
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

const SalesManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_address: ''
    }
  });

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
      fetchProducts();
    }
  }, [user, isAdmin, navigate, toast]);

  useEffect(() => {
    // Calculer le montant total à chaque changement du panier
    const newTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(newTotal);
  }, [cartItems]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity')
        .gt('stock_quantity', 0)
        .order('name');

      if (error) throw error;
      
      setProducts(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les produits: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct || quantity <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit et spécifier une quantité",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      toast({
        title: "Erreur",
        description: "Produit sélectionné non trouvé",
        variant: "destructive",
      });
      return;
    }

    if (product.stock_quantity < quantity) {
      toast({
        title: "Erreur",
        description: "Quantité demandée supérieure au stock disponible",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si le produit est déjà dans le panier
    const existingItemIndex = cartItems.findIndex(item => item.product_id === selectedProduct);
    if (existingItemIndex !== -1) {
      // Mettre à jour la quantité du produit existant
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setCartItems(updatedItems);
    } else {
      // Ajouter le nouvel article au panier
      setCartItems([
        ...cartItems,
        {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: quantity
        }
      ]);
    }

    // Réinitialiser les champs
    setSelectedProduct('');
    setQuantity(1);

    toast({
      title: "Produit ajouté",
      description: `${quantity}x ${product.name} ajouté au panier`,
    });
  };

  const handleRemoveFromCart = (index: number) => {
    const newCartItems = [...cartItems];
    newCartItems.splice(index, 1);
    setCartItems(newCartItems);
  };

  const onSubmit = async (data: SaleFormValues) => {
    if (cartItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Le panier est vide",
        variant: "destructive",
      });
      return;
    }

    try {
      // Créer la commande
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            customer_address: data.customer_address,
            total_amount: totalAmount,
            status: 'validated' // Les ventes manuelles sont automatiquement validées
          }
        ])
        .select('id')
        .single();

      if (orderError) throw orderError;

      if (!orderData || !orderData.id) {
        throw new Error("Impossible d'obtenir l'ID de la vente");
      }

      // Créer les éléments de la commande
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (orderItemsError) throw orderItemsError;

      // Mise à jour des stocks
      for (const item of cartItems) {
        // Get current stock quantity
        const { data: productData } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();
          
        if (productData) {
          const newStock = Math.max(0, productData.stock_quantity - item.quantity);
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', item.product_id);
            
          if (updateError) throw updateError;
        }
      }

      toast({
        title: "Vente enregistrée",
        description: "La vente a été enregistrée avec succès",
      });

      // Rediriger vers la génération de facture
      navigate(`/admin/invoices/${orderData.id}`);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer la vente: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} TND`;
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Nouvelle Vente</h1>
          
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sélection des produits */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sélection des produits</CardTitle>
                <CardDescription>
                  Ajoutez des produits à la vente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sélection du produit */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <Select
                        value={selectedProduct}
                        onValueChange={setSelectedProduct}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {loading ? (
                              <SelectItem value="loading">Chargement...</SelectItem>
                            ) : products.length === 0 ? (
                              <SelectItem value="empty">Aucun produit disponible</SelectItem>
                            ) : (
                              products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {formatCurrency(product.price)} ({product.stock_quantity} en stock)
                                </SelectItem>
                              ))
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        placeholder="Quantité"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Button
                        className="w-full bg-sonoff-blue hover:bg-sonoff-teal"
                        onClick={handleAddToCart}
                        disabled={!selectedProduct || loading}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Ajouter
                      </Button>
                    </div>
                  </div>
                  
                  {/* Liste des produits sélectionnés */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Panier</h3>
                    {cartItems.length === 0 ? (
                      <p className="text-gray-500">Aucun produit sélectionné</p>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left">Produit</th>
                              <th className="px-4 py-2 text-right">Prix unitaire</th>
                              <th className="px-4 py-2 text-right">Quantité</th>
                              <th className="px-4 py-2 text-right">Total</th>
                              <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {cartItems.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3">{item.product_name}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                                <td className="px-4 py-3 text-right">{item.quantity}</td>
                                <td className="px-4 py-3 text-right">
                                  {formatCurrency(item.price * item.quantity)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-500 hover:text-red-700"
                                          onClick={() => handleRemoveFromCart(index)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Retirer du panier</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 font-bold">
                              <td className="px-4 py-3" colSpan={3}>Total</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(totalAmount)}</td>
                              <td className="px-4 py-3"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Informations client */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Informations client</CardTitle>
                <CardDescription>
                  Renseignez les informations du client
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom du client" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customer_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input placeholder="Numéro de téléphone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customer_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Adresse complète"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            type="submit" 
                            className="w-full bg-sonoff-blue hover:bg-sonoff-teal"
                            disabled={cartItems.length === 0}
                          >
                            <FileText className="mr-2 h-4 w-4" /> Finaliser et générer facture
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enregistrer la vente et générer une facture</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SalesManagement;
