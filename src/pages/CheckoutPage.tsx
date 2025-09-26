import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const checkoutSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(8),
  address: z.string().min(10)
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const SUPABASE_URL = "https://ixurnulffowefnouwfcs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXJudWxmZm93ZWZub3V3ZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDg2MTQsImV4cCI6MjA2MDkyNDYxNH0.7TJGUB7uo2oQTLFA762YGFKlPwu6-h5t-k6KjJqB8zg";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, totalAmount, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fullName: '', phone: '', address: '' }
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({ title: "Erreur", description: "Panier vide", variant: "destructive" });
      return;
    }

    setProcessing(true);

    try {
      const orderPayload = {
        customer_name: data.fullName,
        customer_phone: data.phone,
        customer_address: data.address,
        total_amount: totalAmount,
        status: 'new',
        user_id: user?.id ?? null
      };

      console.log("➡️ Création commande:", orderPayload);

      // 1️⃣ Créer commande via REST
      const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(orderPayload)
      });
      const orderDataArr = await orderRes.json();
      if (!orderRes.ok || !orderDataArr[0]) throw new Error(JSON.stringify(orderDataArr));
      const orderData = orderDataArr[0];
      console.log("✅ Commande créée:", orderData);

      // 2️⃣ Ajouter items
      const itemsPayload = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const itemsRes = await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
        method: 'POST',
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(itemsPayload)
      });
      const itemsData = await itemsRes.json();
      if (!itemsRes.ok) throw new Error(JSON.stringify(itemsData));
      console.log("✅ Items ajoutés:", itemsData);

      // 3️⃣ Notification via fonction Supabase
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
      } catch (e) { console.error("Notification échouée:", e); }

      toast({ title: "Commande réussie", description: "Votre commande a été enregistrée" });
      clearCart();
      navigate('/');
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
      console.error("❌ Erreur checkout:", err);
    } finally { setProcessing(false); }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-sonoff-blue">Validation de la commande</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Résumé du panier</CardTitle></CardHeader>
              <CardContent>
                {cartItems.length === 0 ? <p>Panier vide</p> :
                  cartItems.map(item => (
                    <div key={item.id} className="flex justify-between py-2">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{(item.price*item.quantity).toFixed(2)} TND</span>
                    </div>
                  ))
                }
              </CardContent>
              <CardFooter className="flex justify-between font-bold">
                <span>Total</span><span>{totalAmount.toFixed(2)} TND</span>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader><CardTitle>Infos client</CardTitle></CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField name="fullName" control={form.control} render={({field}) => (
                      <FormItem><FormLabel>Nom complet</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                    )}/>
                    <FormField name="phone" control={form.control} render={({field}) => (
                      <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                    )}/>
                    <FormField name="address" control={form.control} render={({field}) => (
                      <FormItem><FormLabel>Adresse</FormLabel><FormControl><Textarea {...field}/></FormControl><FormMessage/></FormItem>
                    )}/>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <Button type="submit" className="w-full bg-sonoff-blue" disabled={processing}>
                      {processing ? "Traitement..." : "Finaliser la commande"}
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
