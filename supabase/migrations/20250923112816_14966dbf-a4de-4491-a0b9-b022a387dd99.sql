-- Créer une fonction pour déclencher l'envoi d'email lors d'une nouvelle commande
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  order_data jsonb;
  order_items jsonb;
BEGIN
  -- Récupérer les éléments de la commande
  SELECT jsonb_agg(
    jsonb_build_object(
      'product_name', oi.product_name,
      'quantity', oi.quantity,
      'price', oi.price
    )
  )
  INTO order_items
  FROM order_items oi
  WHERE oi.order_id = NEW.id;

  -- Construire les données de la commande
  order_data := jsonb_build_object(
    'id', NEW.id,
    'customer_name', NEW.customer_name,
    'customer_phone', NEW.customer_phone,
    'customer_address', NEW.customer_address,
    'total_amount', NEW.total_amount,
    'order_items', COALESCE(order_items, '[]'::jsonb)
  );

  -- Appeler la fonction Edge pour envoyer l'email
  PERFORM net.http_post(
    url := 'https://ixurnulffowefnouwfcs.supabase.co/functions/v1/send-order-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := order_data::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les nouvelles commandes
CREATE OR REPLACE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Activer l'extension http pour les requêtes externes
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA net;