
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Order } from '@/types/supabase';

interface OrdersTableProps {
  loading: boolean;
  orders: Order[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

const OrdersTable = ({
  loading,
  orders,
  formatDate,
  formatCurrency,
  getStatusLabel,
  getStatusColor,
}: OrdersTableProps) => {
  const navigate = useNavigate();

  const handleRowClick = (orderId: string) => {
    navigate(`/admin/invoices/${orderId}`);
  };

  return (
    <Table>
      <TableCaption>Liste des commandes facturables</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">Chargement...</TableCell>
          </TableRow>
        ) : orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">Aucune commande trouvée</TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow 
              key={order.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleRowClick(order.id)}
            >
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell className="font-medium">{order.customer_name}</TableCell>
              <TableCell>{order.customer_phone}</TableCell>
              <TableCell>{formatCurrency(order.total_amount)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/invoices/${order.id}`);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Générer une facture</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default OrdersTable;
