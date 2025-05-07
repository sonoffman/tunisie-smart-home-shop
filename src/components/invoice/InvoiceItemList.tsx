
import React from 'react';
import { InvoiceItem } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

interface InvoiceItemListProps {
  items: InvoiceItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: keyof InvoiceItem, value: string | number) => void;
}

const InvoiceItemList: React.FC<InvoiceItemListProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onItemChange,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Articles</h3>
        <Button variant="outline" size="sm" onClick={onAddItem}>
          <Plus className="h-4 w-4 mr-1" /> Ajouter un article
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Description</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Prix unitaire (DT)</TableHead>
            <TableHead>Total (DT)</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Input
                  value={item.description}
                  onChange={(e) => onItemChange(item.id, 'description', e.target.value)}
                  placeholder="Description de l'article"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => onItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                />
              </TableCell>
              <TableCell className="font-medium">
                {item.total.toFixed(3)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceItemList;
