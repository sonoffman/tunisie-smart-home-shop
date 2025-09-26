import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_name: string;
  price: number;
  quantity: number;
};

const DebugPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugMessage, setDebugMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setDebugMessage("⏳ Chargement des données...");

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);
      setDebugMessage(`✅ ${ordersData?.length || 0} commandes chargées`);

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*");

      if (itemsError) throw itemsError;

      setOrderItems(itemsData || []);
    } catch (err: any) {
      console.error("Erreur DebugPage:", err);
      setDebugMessage("❌ Erreur: " + (err.message || "Impossible de charger"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout>
      <Card className="max-w-4xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>🛠 Debug Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button onClick={loadData} disabled={loading}>
              {loading ? "Chargement..." : "Recharger"}
            </Button>
            {debugMessage && (
              <span className="text-sm text-gray-600">{debugMessage}</span>
            )}
          </div>

          {orders.length === 0 && (
            <p className="text-gray-500">Aucune commande trouvée.</p>
          )}

          {orders.map((order) => (
            <div
              key={order.id}
              className="border p-3 rounded mb-3 bg-gray-50 shadow-sm"
            >
              <p>
                <strong>ID:</strong> {order.id}
              </p>
              <p>
                <strong>Nom:</strong> {order.customer_name} |{" "}
                <strong>Tél:</strong> {order.customer_phone}
              </p>
              <p>
                <strong>Adresse:</strong> {order.customer_address}
              </p>
              <p>
                <strong>Total:</strong> {order.total_amount} TND |{" "}
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>

              <div className="mt-2 pl-3 border-l">
                <p className="font-semibold">🛒 Produits :</p>
                {orderItems
                  .filter((item) => item.order_id === order.id)
                  .map((item) => (
                    <p key={item.id}>
                      {item.product_name} × {item.quantity} → {item.price} TND
                    </p>
                  ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default DebugPage;
