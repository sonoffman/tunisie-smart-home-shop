
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const checkoutSchema = z.object({
  fullName: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  phone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres"),
  address: z.string().min(10, "L'adresse doit être complète (au moins 10 caractères)")
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, totalAmount, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: ''
    }
  });

  const handleContinueShopping = () => {
    navigate('/');
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Votre panier est vide",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Créer la commande
      let orderQuery = {
        customer_name: data.fullName,
        customer_phone: data.phone,
        customer_address: data.address,
        total_amount: totalAmount,
        status: 'new'
      } as any;
      
      // N'ajoutez user_id que si l'utilisateur est connecté et que son ID est de type UUID valide
      if (user?.id && typeof user.id === 'string' && user.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        orderQuery.user_id = user.id;
      }
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderQuery])
        .select('id')
        .single();

      if (orderError) throw orderError;

      if (!orderData || !orderData.id) {
        throw new Error("Impossible d'obtenir l'ID de la commande");
      }

      // Préparer les éléments de la commande
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (orderItemsError) throw orderItemsError;

      // Vérifier si le client a des problèmes non résolus
      const { data: issueData, error: issueError } = await supabase
        .from('customer_issues')
        .select('id')
        .eq('customer_phone', data.phone)
        .eq('resolved', false);

      if (issueError) throw issueError;

      // Alerter en cas de problèmes non résolus
      if (issueData && issueData.length > 0) {
        console.log(`Warning: Customer with phone ${data.phone} has unresolved issues`);
      }

      toast({
        title: "Commande confirmée",
        description: "Votre commande a été enregistrée avec succès",
      });

      // Vider le panier
      clearCart();
      
      // Rediriger vers la page d'accueil
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de finaliser votre commande: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-sonoff-blue">Validation de la commande</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Résumé du panier</CardTitle>
                <CardDescription>
                  {cartItems.length} article{cartItems.length > 1 ? 's' : ''} dans votre panier
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <p className="text-center py-4">Votre panier est vide</p>
                ) : (
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-4 flex items-center">
                        <div className="h-16 w-16 rounded overflow-hidden mr-4">
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x {item.price.toFixed(2)} TND
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} TND</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl">{totalAmount.toFixed(2)} TND</span>
              </CardFooter>
            </Card>
          </div>
          
          {/* Customer form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Informations client</CardTitle>
                <CardDescription>
                  Complétez vos informations pour finaliser la commande
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet *</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom complet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre numéro de téléphone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse de livraison *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Votre adresse complète" {...field} />
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
                            disabled={processing || cartItems.length === 0}
                          >
                            {processing ? 'Traitement...' : 'Finaliser la commande'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Confirmer et enregistrer votre commande</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full"
                            onClick={handleContinueShopping}
                          >
                            Continuer mes achats
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Revenir à la page d'accueil</p>
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

export default CheckoutPage;
