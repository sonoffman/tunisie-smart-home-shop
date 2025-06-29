
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface InvoiceHeaderProps {
  invoiceNumber: string;
  invoiceDate: string;
  onNumberChange: (number: string) => void;
  onDateChange: (date: string) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoiceNumber,
  invoiceDate,
  onNumberChange,
  onDateChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="invoice-number">Numéro de facture</Label>
        <Input
          id="invoice-number"
          value={invoiceNumber}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder="Entrez le numéro de facture"
        />
      </div>
      <div>
        <Label htmlFor="invoice-date">Date de facture</Label>
        <Input
          id="invoice-date"
          type="date"
          value={invoiceDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InvoiceHeader;
