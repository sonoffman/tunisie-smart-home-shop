
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface OrderStateSelectorProps {
  state: string;
  onStateChange: (state: string) => void;
}

const OrderStateSelector: React.FC<OrderStateSelectorProps> = ({ state, onStateChange }) => {
  const getStateBadge = (state: string) => {
    switch (state) {
      case 'en_cours':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">En cours</Badge>;
      case 'termine':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Terminé</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Non défini</Badge>;
    }
  };

  return (
    <Select
      defaultValue={state || 'en_cours'}
      onValueChange={(value) => onStateChange(value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          {getStateBadge(state || 'en_cours')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en_cours">En cours</SelectItem>
        <SelectItem value="termine">Terminé</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default OrderStateSelector;
