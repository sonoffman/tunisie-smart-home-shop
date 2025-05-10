
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectGroup, 
  SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Order } from '@/types/supabase';

export type OrderStatusFilter = Order['status'] | 'all';

interface InvoiceFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: OrderStatusFilter;
  handleStatusFilterChange: (value: string) => void;
  setIsGenerateManualDialogOpen: (value: boolean) => void;
}

const InvoiceFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  handleStatusFilterChange,
  setIsGenerateManualDialogOpen,
}: InvoiceFiltersProps) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setIsGenerateManualDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Créer une facture
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Créer une nouvelle facture</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouvelles</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="validated">Validées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
                <SelectItem value="processing">En cours de traitement</SelectItem>
                <SelectItem value="shipped">Expédiées</SelectItem>
                <SelectItem value="delivered">Livrées</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="w-full sm:w-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher par nom, téléphone ou produit"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilters;
export type { OrderStatusFilter };
