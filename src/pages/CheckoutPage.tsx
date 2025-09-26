import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const checkoutSchema = z.object({
  fullName: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  phone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres"),
  address: z.string().min(10, "L'adresse doit être complète (au moins 10 caractères)"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, totalAmount, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [debugMessage, setDebugMessage] = useState<string | null>(null);

  // Exposer Supabase dans la console navigateur
  useEffect(() => {
    console.log("Supabase client chargé:", supabase);
    (window as any).supabase = supabase;
  }, []);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fullName: "", phone: "", address: "" },
  });

  const handleCheckout = async (data: CheckoutFormValues) => {
    try {
      setProcessing(true);
      setDebugMessage("⏳ Insertion de la commande en cours...");

      // 1️⃣ Créer la commande
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: data.fullName,
            customer_phone: data.phone,
            customer_address: data.address,
            total_amount: totalAmount,
            status: "new",
            user_id: user?.id ?? null,
            cancellation_reason: null,
          },
        ])
        .select("id")
        .single();

      console.log("Résultat insert orders:", { orderData, orderError });

      if (orderError) throw orderError;

      setDebugMessage(`✅ Commande créée avec ID ${orderData.id}`);

      // 2️⃣ Ajouter les produits liés à la commande
      const orderItemsToInsert = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);

      console.log("Résultat insert order_items:", { orderItemsError });

      if (orderItemsError) throw orderItemsError;

      setDebugMessage("✅ Produits ajoutés à la commande");

      // 3️⃣ Envoi notification
      try {
        await supabase.functions.invoke("send-order-notification", {
          body: {
            id: orderData.id,
            customer_name: data.fullName,
            customer_phone: data.phone,
            customer_address: data.address,
            total_amount: totalAmount,
            order_items: cartItems.map((item) => ({
              product_name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        });
        setDebugMessage("✅ Notification envoyée");
      } catch (notifyError) {
        console.error("Erreur notification:", notifyError);
        setDebugMessage("⚠️ Erreur lors de l'envoi de la notification");
      }

      // 4️⃣ Succès → vider panier + redirection
      clearCart();
      toast({
        title: "Commande réussie ✅",
        description: "Votre commande a été enregistrée avec succès.",
      });
      navigate("/");
    } catch (err: any) {
      console.error("Erreur finale checkout:", err);
      setDebugMessage("❌ Erreur: " + (err.message || "Impossible de finaliser la commande"));
      toast({
        title: "Erreur ❌",
        description: "Impossible de finaliser la commande.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <Card className="max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle>Finaliser ma commande</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} />
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
                    <FormLabel>Téléphone</FormLabel>
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
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Votre adresse complète" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {debugMessage && (
                <div className="p-2 text-sm rounded bg-gray-100 border">
                  {debugMessage}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={processing}>
                {processing ? "Enregistrement..." : "Finaliser la commande"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p>Total : <strong>{totalAmount.toFixed(2)} TND</strong></p>
        </CardFooter>
      </Card>
    </Layout>
  );
};

export default CheckoutPage;
