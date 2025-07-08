
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DocumentTypeSelector from './DocumentTypeSelector';

interface InvoiceParameters {
  documentType: 'Facture' | 'Devis' | 'Bon de Livraison';
  invoiceNumber: string;
  footerMessage: string;
}

interface InvoiceParametersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (parameters: InvoiceParameters) => void;
  defaultInvoiceNumber: string;
}

const InvoiceParametersDialog: React.FC<InvoiceParametersDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  defaultInvoiceNumber
}) => {
  const [parameters, setParameters] = useState<InvoiceParameters>({
    documentType: 'Facture',
    invoiceNumber: defaultInvoiceNumber,
    footerMessage: 'Merci de votre confiance'
  });

  // Mettre à jour le numéro par défaut quand il change
  useEffect(() => {
    setParameters(prev => ({
      ...prev,
      invoiceNumber: defaultInvoiceNumber
    }));
  }, [defaultInvoiceNumber]);

  const handleConfirm = () => {
    onConfirm(parameters);
    onOpenChange(false);
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    
    const prefix = parameters.documentType === 'Facture' ? 'FAC' : 
                   parameters.documentType === 'Devis' ? 'DEV' : 'BL';
    
    const newNumber = `${prefix}-${year}${month}${day}-${time}`;
    setParameters(prev => ({ ...prev, invoiceNumber: newNumber }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-sonoff-blue">
            Paramètres du document
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <DocumentTypeSelector
            value={parameters.documentType}
            onChange={(value: 'Facture' | 'Devis' | 'Bon de Livraison') =>
              setParameters(prev => ({ ...prev, documentType: value }))
            }
          />

          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Numéro de document</Label>
            <div className="flex gap-2">
              <Input
                id="invoiceNumber"
                value={parameters.invoiceNumber}
                onChange={(e) =>
                  setParameters(prev => ({ ...prev, invoiceNumber: e.target.value }))
                }
                placeholder="Saisir le numéro"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateInvoiceNumber}
                className="whitespace-nowrap"
              >
                Auto
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerMessage">Message en bas de document</Label>
            <Textarea
              id="footerMessage"
              value={parameters.footerMessage}
              onChange={(e) =>
                setParameters(prev => ({ ...prev, footerMessage: e.target.value }))
              }
              placeholder="Message personnalisé..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="bg-sonoff-blue hover:bg-sonoff-teal text-white"
            disabled={!parameters.invoiceNumber.trim()}
          >
            Générer le document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceParametersDialog;
