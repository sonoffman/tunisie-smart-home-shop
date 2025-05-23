
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Customer } from '@/types/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CustomerForm from './CustomerForm';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerChange: (customerId: string) => void;
  onCustomerCreated?: () => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  onCustomerChange,
  onCustomerCreated
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCustomerCreated = (customerId: string) => {
    setIsDialogOpen(false);
    onCustomerChange(customerId);
    if (onCustomerCreated) {
      onCustomerCreated();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="customer">Client</Label>
      <div className="flex space-x-2">
        <Select value={selectedCustomer?.id || ''} onValueChange={onCustomerChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
              <DialogDescription>
                Créez un nouveau client pour la facture.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm 
              onCustomerCreated={handleCustomerCreated}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerSelector;
