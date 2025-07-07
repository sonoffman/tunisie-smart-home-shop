
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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

  const handleConfirm = () => {
    onConfirm(parameters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paramètres du document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">Type de document</Label>
            <Select
              value={parameters.documentType}
              onValueChange={(value: 'Facture' | 'Devis' | 'Bon de Livraison') =>
                setParameters({ ...parameters, documentType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Facture">Facture</SelectItem>
                <SelectItem value="Devis">Devis</SelectItem>
                <SelectItem value="Bon de Livraison">Bon de Livraison</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Numéro de document</Label>
            <Input
              id="invoiceNumber"
              value={parameters.invoiceNumber}
              onChange={(e) =>
                setParameters({ ...parameters, invoiceNumber: e.target.value })
              }
              placeholder="Saisir le numéro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerMessage">Message en bas de document</Label>
            <Textarea
              id="footerMessage"
              value={parameters.footerMessage}
              onChange={(e) =>
                setParameters({ ...parameters, footerMessage: e.target.value })
              }
              placeholder="Message personnalisé..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} className="bg-sonoff-blue hover:bg-sonoff-teal">
            Générer le document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceParametersDialog;
