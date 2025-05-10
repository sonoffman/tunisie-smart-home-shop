
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateInvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateInvoiceDialog = ({ isOpen, onOpenChange }: CreateInvoiceDialogProps) => {
  const navigate = useNavigate();
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une facture manuellement</DialogTitle>
          <DialogDescription>
            Choisissez comment vous souhaitez créer votre facture.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center"
            onClick={() => {
              onOpenChange(false);
              navigate('/admin/sales');
            }}
          >
            <Plus className="h-6 w-6 mb-2" />
            <span>Nouvelle vente manuelle</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center"
            onClick={() => {
              onOpenChange(false);
              navigate('/admin/orders');
            }}
          >
            <FileText className="h-6 w-6 mb-2" />
            <span>À partir d'une commande</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
