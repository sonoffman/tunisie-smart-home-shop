
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DocumentTypeSelector from './DocumentTypeSelector';

interface InvoiceCustomizationProps {
  documentType: string;
  invoiceNumber: string;
  footerMessage: string;
  onDocumentTypeChange: (value: string) => void;
  onInvoiceNumberChange: (value: string) => void;
  onFooterMessageChange: (value: string) => void;
}

const InvoiceCustomization = ({
  documentType,
  invoiceNumber,
  footerMessage,
  onDocumentTypeChange,
  onInvoiceNumberChange,
  onFooterMessageChange
}: InvoiceCustomizationProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DocumentTypeSelector
          value={documentType}
          onChange={onDocumentTypeChange}
        />
        
        <div>
          <Label htmlFor="invoice-number">Numéro de document</Label>
          <Input
            id="invoice-number"
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
            placeholder="INV-2024-001"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="footer-message">Message personnalisé (bas de page)</Label>
        <Textarea
          id="footer-message"
          value={footerMessage}
          onChange={(e) => onFooterMessageChange(e.target.value)}
          placeholder="Merci de votre confiance !"
          rows={3}
        />
      </div>
    </div>
  );
};

export default InvoiceCustomization;
