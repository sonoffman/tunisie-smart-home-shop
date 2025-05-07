
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer } from '@/types/supabase';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerChange: (customerId: string) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  onCustomerChange,
}) => {
  return (
    <div>
      <Label htmlFor="customer">Client</Label>
      <Select 
        onValueChange={onCustomerChange} 
        value={selectedCustomer?.id}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un client" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedCustomer && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="font-medium">{selectedCustomer.name}</p>
          <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
          <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
          {selectedCustomer.email && (
            <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
