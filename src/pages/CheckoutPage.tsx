import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Exposer supabase dans la console (utile pour debug)
(window as any).supabase = supabase;

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
    defaultValues: { fullName: '', phone: '', address: '' }
  });

  const handleCheckout = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({ title: "Votre panier est vide" });
      return;
    }

    setProcessing(true);

    try {
      // 1️⃣ Créer la commande dans la table orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: data.fullName,
          customer_phone: data.phone,
          customer_address: data.address,
          total_amount: totalAmount,
          status: 'new',
          user_id: user?.id ?? null
        }])
        .select('id')
        .single();

      if (orderError) throw orderError;

      // 2️⃣ Enregistrer les produits liés
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

      // 3️⃣ Envoyer la notification de commande
      try {
        const { data: notifData, error: notifError } = await supabase.functions.invoke('send-order-notification', {
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

        if (notifError) {
          console.error('Erreur notification :', notifError);
          toast({ title: "Commande créée", description: "⚠️ Notification email échouée" });
        } else {
          console.log('Notification envoyée :', notifData);
          toast({ title: "✅ Commande passée avec succès !" });
        }

      } catch (emailError) {
        console.error('Erreur lors de l’envoi du mail :', emailError);
        toast({ title: "Commande créée", description: "⚠️ Erreur d’envoi email" });
      }

      clearCart();
      navigate('/'); // Retour à l'accueil
    } catch (err: any) {
      console.error('Erreur finale checkout :', err);
      toast({ title: "❌ Erreur lors du paiement", description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Finaliser votre commande</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulaire de livraison */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-6">
                  
                  <FormField name="fullName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl><Input {...field} placeholder="Votre nom complet" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="phone" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl><Input {...field} placeholder="+216 XX XXX XXX" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="address" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse de livraison</FormLabel>
                      <FormControl><Textarea {...field} placeholder="Adresse complète (ville, code postal...)" rows={4} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* 🟩 Bouton renommé */}
                  <Button type="submit" disabled={processing} className="w-full" size="lg">
                    {processing ? "Traitement en cours..." : "Commander"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Résumé de commande */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start pb-4 border-b">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} DT</p>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{totalAmount.toFixed(2)} DT</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🚚</span>
                    <div>
                      <p className="font-medium">Livraison rapide</p>
                      <p className="text-muted-foreground">Sous 2-3 jours ouvrables</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="font-medium">Paiement sécurisé</p>
                      <p className="text-muted-foreground">Paiement à la livraison</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
