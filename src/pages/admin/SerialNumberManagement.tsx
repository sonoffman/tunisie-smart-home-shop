
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface SerialNumber {
  id: string;
  serial_number: string;
  product_id: string | null;
  is_valid: boolean;
  created_at: string;
  product_name?: string;
}

interface Product {
  id: string;
  name: string;
}

const SerialNumberManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Redirect non-admin users
    if (user === null) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
    } else if (!isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
    } else {
      fetchSerialNumbers();
      fetchProducts();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchSerialNumbers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('serial_numbers')
        .select(`
          id,
          serial_number,
          product_id,
          is_valid,
          created_at,
          products:product_id (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the SerialNumber interface
      const formattedData = data.map((item: any) => ({
        id: item.id,
        serial_number: item.serial_number,
        product_id: item.product_id,
        is_valid: item.is_valid,
        created_at: item.created_at,
        product_name: item.products?.name || 'Non assigné'
      }));
      
      setSerialNumbers(formattedData);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les numéros de série: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setProducts(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les produits: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddSerialNumber = async () => {
    if (!newSerialNumber.trim()) {
      toast({
        title: "Erreur",
        description: "Le numéro de série ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('serial_numbers')
        .insert([
          { 
            serial_number: newSerialNumber,
            // Modified to handle the "none" value properly
            product_id: selectedProductId === "none" ? null : selectedProductId,
            is_valid: true
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Le numéro de série a été ajouté avec succès",
      });
      
      // Clear form
      setNewSerialNumber('');
      setSelectedProductId(null);
      setIsDialogOpen(false);
      
      // Refresh data
      fetchSerialNumbers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter le numéro de série: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteSerialNumber = async (id: string) => {
    try {
      const { error } = await supabase
        .from('serial_numbers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Le numéro de série a été supprimé avec succès",
      });
      
      // Refresh data
      fetchSerialNumbers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le numéro de série: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const toggleValidity = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('serial_numbers')
        .update({ is_valid: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: `Le numéro de série a été ${!currentStatus ? 'validé' : 'invalidé'}`,
      });
      
      // Refresh data
      fetchSerialNumbers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le statut: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des numéros de série</h1>
          <div className="flex gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Ajouter un numéro de série
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau numéro de série</DialogTitle>
                  <DialogDescription>
                    Saisissez le numéro de série et associez-le à un produit
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="serialNumber" className="text-sm font-medium">
                      Numéro de série
                    </label>
                    <Input 
                      id="serialNumber"
                      value={newSerialNumber}
                      onChange={(e) => setNewSerialNumber(e.target.value)}
                      placeholder="Entrez le numéro de série"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="product" className="text-sm font-medium">
                      Produit associé (optionnel)
                    </label>
                    <Select 
                      value={selectedProductId || undefined} 
                      onValueChange={(value) => setSelectedProductId(value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Fix: Replace empty string value with a non-empty string value */}
                        <SelectItem value="none">Non associé</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={handleAddSerialNumber}>Ajouter</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Retour au dashboard
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>Liste des numéros de série</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro de série</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : serialNumbers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Aucun numéro de série trouvé</TableCell>
                </TableRow>
              ) : (
                serialNumbers.map((serial) => (
                  <TableRow key={serial.id}>
                    <TableCell className="font-medium">{serial.serial_number}</TableCell>
                    <TableCell>{serial.product_name || 'Non assigné'}</TableCell>
                    <TableCell>
                      {serial.is_valid ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Valide
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Invalide
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(serial.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleValidity(serial.id, serial.is_valid)}
                        className={serial.is_valid ? "text-red-500" : "text-green-500"}
                      >
                        {serial.is_valid ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Invalider
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Valider
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDeleteSerialNumber(serial.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default SerialNumberManagement;
