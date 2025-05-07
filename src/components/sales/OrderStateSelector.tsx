
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
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">En cours</Badge>;
      case 'termine':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Terminé</Badge>;
      default:
        return <Badge variant="outline">{state}</Badge>;
    }
  };

  return (
    <Select
      defaultValue={state}
      onValueChange={(value) => onStateChange(value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          {getStateBadge(state)}
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
