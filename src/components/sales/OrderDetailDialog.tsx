
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Order, OrderItem } from '@/types/supabase';
import OrderStatusSelector from './OrderStatusSelector';

interface OrderDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onStatusChange: (orderId: string, status: string) => void;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  isOpen,
  onOpenChange,
  order,
  onStatusChange,
}) => {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détails de la commande</DialogTitle>
          <DialogDescription>
            Informations sur la commande et les produits achetés
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Date de commande</h4>
            <p>{formatDate(order.created_at)}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm">Client</h4>
            <p>{order.customer_name}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm">Téléphone</h4>
            <p>{order.customer_phone}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm">Adresse</h4>
            <p>{order.customer_address}</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="items">
              <AccordionTrigger>Produits commandés</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span>{(item.price * item.quantity).toFixed(3)} DT</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Aucun produit trouvé</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{order.total_amount.toFixed(3)} DT</span>
          </div>
          
          <div className="flex justify-between pt-4">
            <div className="space-x-2">
              <OrderStatusSelector 
                status={order.status} 
                onStatusChange={(status) => onStatusChange(order.id, status)}
              />
            </div>
            
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
