import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderData {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  order_items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderData = await req.json();
    console.log("Sending order notification for order:", orderData.id);

    // Créer le contenu HTML de l'email
    const htmlContent = `
      <h2>🎉 Nouvelle commande reçue sur Sonoff Tunisie</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📝 Informations client :</h3>
        <p><strong>Nom :</strong> ${orderData.customer_name}</p>
        <p><strong>Téléphone :</strong> ${orderData.customer_phone}</p>
        <p><strong>Adresse :</strong> ${orderData.customer_address}</p>
      </div>

      <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>🛒 Produits commandés :</h3>
        <ul>
          ${orderData.order_items.map(item => 
            `<li><strong>${item.product_name}</strong> - Quantité: ${item.quantity} - Prix unitaire: ${item.price} TND</li>`
          ).join('')}
        </ul>
      </div>

      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>💰 Total de la commande :</h3>
        <p style="font-size: 24px; font-weight: bold; color: #2d5016;">${orderData.total_amount} TND</p>
      </div>

      <hr style="margin: 30px 0;">
      <p style="color: #666; font-size: 14px;">
        Cette notification a été générée automatiquement par le système Sonoff Tunisie.<br>
        Commande ID: ${orderData.id}
      </p>
    `;

    // Utiliser Resend au lieu de SMTP direct
    const emailResponse = await resend.emails.send({
      from: "Sonoff Tunisie <onboarding@resend.dev>",
      to: ["kbirjosef@gmail.com"],
      subject: "Notification nouvelle commande",
      html: htmlContent,
    });
    
    console.log("Email sent successfully:", emailResponse);
    console.log("RESEND:", Deno.env.get("RESEND_API_KEY"));
    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};


serve(handler);
