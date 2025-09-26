import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ixurnulffowefnouwfcs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXJudWxmZm93ZWZub3V3ZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDg2MTQsImV4cCI6MjA2MDkyNDYxNH0.7TJGUB7uo2oQTLFA762YGFKlPwu6-h5t-k6KjJqB8zg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  const handleContinueShopping = () => navigate('/');

  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({ title: "Erreur", description: "Votre panier est vide", variant: "destructive" });
      return;
    }

    setProcessing(true);

    try {
      // 1️⃣ Créer la commande dans orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: data.fullName,
          customer_phone: data.phone,
          customer_address: data.address,
          total_amount: totalAmount,
          status: 'new',
          user_id: user?.id ?? null // 👈 clé pour anonymes
        }])
        .select('id')
        .single();

      if (orderError) throw orderError;

      // 2️⃣ Préparer les produits pour order_items
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

      // 3️⃣ Envoyer notification via Supabase function
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

      toast({
        title: "Commande confirmée",
        description: "Votre commande a été enregistrée avec succès et une notification a été envoyée",
      });

      clearCart();
      navigate('/');
    } catch (error: any) {
      toast({ title: "Erreur", description: `Impossible de finaliser votre commande: ${error.message}`, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-sonoff-blue">Validation de la commande</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Résumé du panier</CardTitle>
                <p>{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</p>
              </CardHeader>
              <CardContent>
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between py-2">
                    <div>{item.name} x {item.quantity}</div>
                    <div>{(item.price * item.quantity).toFixed(2)} TND</div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                <span>Total</span>
                <span>{totalAmount.toFixed(2)} TND</span>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Informations client</CardTitle>
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
                            <Input {...field} placeholder="Votre nom complet" />
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
                            <Input {...field} placeholder="Votre numéro de téléphone" />
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
                          <FormLabel>Adresse *</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Votre adresse complète" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <Button type="submit" className="w-full bg-sonoff-blue hover:bg-sonoff-teal" disabled={processing || cartItems.length === 0}>
                      {processing ? 'Traitement...' : 'Finaliser la commande'}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={handleContinueShopping}>
                      Continuer mes achats
                    </Button>
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
