import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

  // 🔹 Diagnostic RLS et exposition de supabase sur window
  useEffect(() => {
    (window as any).supabase = supabase;
    console.log("supabase exposé sur window");

    const testAnonymousInsert = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        console.log("Utilisateur actuel:", userData);

        const { data, error } = await supabase
          .from('orders')
          .insert({
            customer_name: "Test Anonyme",
            customer_phone: "12345678",
            customer_address: "Adresse Test",
            total_amount: 1,
            status: "new",
            user_id: null,
            cancellation_reason: null
          });

        if (error) {
          console.error("Erreur insertion anonyme:", error);
        } else {
          console.log("Insertion anonyme réussie:", data);
        }
      } catch (err) {
        console.error("Erreur lors du test supabase:", err);
      }
    };

    testAnonymousInsert();
  }, []);

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
        product_id: item.id, // doit être un UUID réel
        product_name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (orderItemsError) throw orderItemsError;

      // 3️⃣ Envoyer notification
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
        {/* ... Formulaire et résumé du panier comme avant ... */}
      </div>
    </Layout>
  );
};

export default CheckoutPage;
