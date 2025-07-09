
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';
import { InvoiceItem } from '@/types/supabase';

interface InvoiceItemListProps {
  items: InvoiceItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: keyof InvoiceItem, value: string | number) => void;
}

const InvoiceItemList = ({ items, onAddItem, onRemoveItem, onItemChange }: InvoiceItemListProps) => {

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Aucun article ajouté</p>
        <Button onClick={onAddItem} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un article
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        // Calculer le prix TTC à partir du prix HT
        const prixTTC = item.unitPrice * 1.19;
        const totalHT = item.unitPrice * item.quantity;
        const totalTTC = prixTTC * item.quantity;

        return (
          <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg">
            <div className="col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={item.description}
                onChange={(e) => onItemChange(item.id, 'description', e.target.value)}
                placeholder="Description du produit"
                rows={2}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité
              </label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix HT unitaire
              </label>
              <Input
                type="number"
                step="0.001"
                value={item.unitPrice.toFixed(3)}
                onChange={(e) => {
                  const htValue = parseFloat(e.target.value) || 0;
                  onItemChange(item.id, 'unitPrice', htValue);
                }}
              />
              <div className="text-xs text-gray-500 mt-1">
                TTC: {prixTTC.toFixed(3)} DT
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total HT
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                {totalHT.toFixed(3)} DT
              </div>
              <div className="text-xs text-gray-500 mt-1">
                TTC: {totalTTC.toFixed(3)} DT
              </div>
            </div>
            
            <div className="col-span-1 flex items-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
      
      <Button onClick={onAddItem} variant="outline" className="w-full flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Ajouter un article
      </Button>
    </div>
  );
};

export default InvoiceItemList;
