
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Trash2 } from 'lucide-react';

interface OrderActionsProps {
  orderId: string;
  onViewDetails: (orderId: string) => void;
  onGenerateInvoice: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  orderId,
  onViewDetails,
  onGenerateInvoice,
  onDeleteOrder,
}) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onViewDetails(orderId)}
      >
        <Eye className="h-4 w-4 mr-1" />
        Voir
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onGenerateInvoice(orderId)}
      >
        <FileText className="h-4 w-4 mr-1" />
        Facture
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-red-500"
        onClick={() => onDeleteOrder(orderId)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Supprimer
      </Button>
    </div>
  );
};

export default OrderActions;
