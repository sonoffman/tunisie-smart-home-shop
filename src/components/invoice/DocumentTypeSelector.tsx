
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DocumentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const DocumentTypeSelector = ({ value, onChange, className }: DocumentTypeSelectorProps) => {
  const documentTypes = [
    { value: 'Facture', label: '📄 Facture' },
    { value: 'Devis', label: '📝 Devis' },
    { value: 'Bon de Livraison', label: '📦 Bon de Livraison' }
  ];

  return (
    <div className={className}>
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        Type de document
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionner le type de document" />
        </SelectTrigger>
        <SelectContent>
          {documentTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DocumentTypeSelector;
