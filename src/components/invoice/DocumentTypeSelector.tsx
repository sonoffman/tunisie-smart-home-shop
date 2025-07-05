
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocumentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const DocumentTypeSelector = ({ value, onChange, className }: DocumentTypeSelectorProps) => {
  const documentTypes = [
    { value: 'Facture', label: 'Facture' },
    { value: 'Devis', label: 'Devis' },
    { value: 'Bon de Livraison', label: 'Bon de Livraison' }
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Type de document
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
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
