
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onValueChange }) => {
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'all': return 'Tous les statuts';
      case 'new': return 'Nouveau';
      case 'pending': return 'En attente';
      case 'validated': return 'Validé';
      case 'cancelled': return 'Annulé';
      case 'processing': return 'En cours de traitement';
      case 'shipped': return 'Expédié';
      case 'delivered': return 'Livré';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue>
          {value === 'all' ? (
            'Tous les statuts'
          ) : (
            <Badge variant="outline" className={getStatusColor(value)}>
              {getStatusLabel(value)}
            </Badge>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les statuts</SelectItem>
        <SelectItem value="new">Nouveau</SelectItem>
        <SelectItem value="pending">En attente</SelectItem>
        <SelectItem value="validated">Validé</SelectItem>
        <SelectItem value="cancelled">Annulé</SelectItem>
        <SelectItem value="processing">En cours de traitement</SelectItem>
        <SelectItem value="shipped">Expédié</SelectItem>
        <SelectItem value="delivered">Livré</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
