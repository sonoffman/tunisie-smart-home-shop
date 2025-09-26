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
      // 1️⃣ Construire la commande
      const orderPayload = {
        customer_name: data.fullName,
        customer_phone: data.phone,
        customer_address: data.address,
        total_amount: totalAmount,
        status: 'new',
        user_id: user?.id ?? null
      };

      console.log("➡️ Order payload envoyé:", orderPayload);

      // 2️⃣ Insérer dans orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id')
        .single();

      if (orderError) throw orderError;

      // 3️⃣ Préparer les produits pour order_items
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.id, // ⚠️ doit être UUID
        product_name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      console.log("➡️ Order items envoyés:", orderItemsToInsert);

      // 4️⃣ Insérer dans order_items
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (orderItemsError) throw orderItemsError;

      // 5️⃣ Notification
      try {
        await supabase.functions.invoke('send-order-notification', {
          body: {
            id: orderData.id,
            customer_name: data.fullName,
            customer_phone: data.phone,
            customer_address: data.address,
            total_amount: totalAmount,
            order_items: cartItems.map(item => ({
              product_name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          }
        });
      } catch (emailError) {
        console.error('Notification échouée:', emailError);
      }

      // ✅ Succès
      toast({
        title: "Commande confirmée",
        description: "Votre commande a été enregistrée avec succès 🎉",
      });

      clearCart();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de finaliser votre commande: ${error.message}`,
        variant: "destructive",
      });
      console.error("❌ Erreur finale:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-sonoff-blue">Validation de la commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Résumé panier */}
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

          {/* Formulaire client */}
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
