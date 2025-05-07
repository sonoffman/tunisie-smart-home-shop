
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface OrderStatusSelectorProps {
  status: string;
  onStatusChange: (status: string) => void;
}

const OrderStatusSelector: React.FC<OrderStatusSelectorProps> = ({ status, onStatusChange }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Nouvelle</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En traitement</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Expédiée</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Livrée</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Annulée</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">En attente</Badge>;
      case 'validated':
        return <Badge variant="outline" className="bg-emerald-100 text-emerald-800">Validée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Select
      defaultValue={status}
      onValueChange={(value) => onStatusChange(value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          {getStatusBadge(status)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="new">Nouvelle</SelectItem>
        <SelectItem value="processing">En traitement</SelectItem>
        <SelectItem value="shipped">Expédiée</SelectItem>
        <SelectItem value="delivered">Livrée</SelectItem>
        <SelectItem value="pending">En attente</SelectItem>
        <SelectItem value="validated">Validée</SelectItem>
        <SelectItem value="cancelled">Annulée</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default OrderStatusSelector;
