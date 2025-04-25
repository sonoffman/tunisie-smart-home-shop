
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash, Check, X } from 'lucide-react';

interface SerialNumber {
  id: string;
  serial_number: string;
  product_id: string | null;
  is_valid: boolean;
  created_at: string;
  product?: {
    name: string;
  };
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
  const [currentSerialNumber, setCurrentSerialNumber] = useState<Partial<SerialNumber>>({
    serial_number: '',
    product_id: null,
    is_valid: true
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
      return;
    } 
    
    if (!isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
      return;
    } 
    
    fetchSerialNumbers();
    fetchProducts();
  }, [user, isAdmin, navigate, toast]);

  const fetchSerialNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('serial_numbers')
        .select(`
          *,
          product:products(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSerialNumbers(data);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSerialNumber(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (value: string) => {
    setCurrentSerialNumber(prev => ({ ...prev, product_id: value }));
  };

  const handleOpenDialog = (serialNumber: SerialNumber) => {
    setCurrentSerialNumber(serialNumber);
  };

  const handleSave = async (closeDialog: () => void) => {
    try {
      if (!currentSerialNumber.serial_number) {
        toast({
          title: "Erreur",
          description: "Le numéro de série est requis",
          variant: "destructive",
        });
        return;
      }

      if (currentSerialNumber.id) {
        const { error } = await supabase
          .from('serial_numbers')
          .update({
            serial_number: currentSerialNumber.serial_number,
            product_id: currentSerialNumber.product_id,
            is_valid: currentSerialNumber.is_valid
          })
          .eq('id', currentSerialNumber.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Le numéro de série a été mis à jour",
        });
      } else {
        const { error } = await supabase
          .from('serial_numbers')
          .insert([{
            serial_number: currentSerialNumber.serial_number,
            product_id: currentSerialNumber.product_id,
            is_valid: true
          }]);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Le numéro de série a été créé",
        });
      }

      fetchSerialNumbers();
      closeDialog();
      setCurrentSerialNumber({
        serial_number: '',
        product_id: null,
        is_valid: true
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder le numéro de série: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce numéro de série ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('serial_numbers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le numéro de série a été supprimé",
      });

      fetchSerialNumbers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le numéro de série: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const toggleValidity = async (id: string, currentValidity: boolean) => {
    try {
      const { error } = await supabase
        .from('serial_numbers')
        .update({ is_valid: !currentValidity })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Le numéro de série est maintenant ${!currentValidity ? 'valide' : 'invalide'}`,
      });

      fetchSerialNumbers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de modifier la validité: ${error.message}`,
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
            <Dialog>
              <DialogTrigger asChild>
                <Button>Nouveau numéro de série</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un numéro de série</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau numéro de série pour un produit.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="serial_number">Numéro de série</Label>
                    <Input
                      id="serial_number"
                      name="serial_number"
                      value={currentSerialNumber.serial_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="product">Produit</Label>
                    <Select
                      value={currentSerialNumber.product_id || ''}
                      onValueChange={handleProductChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={() => handleSave(() => {})}>
                      Sauvegarder
                    </Button>
                  </DialogClose>
                </div>
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
                <TableHead>Validité</TableHead>
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
                serialNumbers.map((serialNumber) => (
                  <TableRow key={serialNumber.id}>
                    <TableCell className="font-medium">{serialNumber.serial_number}</TableCell>
                    <TableCell>{serialNumber.product?.name || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          serialNumber.is_valid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {serialNumber.is_valid ? 'Valide' : 'Invalide'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(serialNumber.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => toggleValidity(serialNumber.id, serialNumber.is_valid)}
                          title={serialNumber.is_valid ? "Invalider" : "Valider"}
                        >
                          {serialNumber.is_valid ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleOpenDialog(serialNumber)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier le numéro de série</DialogTitle>
                              <DialogDescription>
                                Modifiez les informations du numéro de série.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-serial-number">Numéro de série</Label>
                                <Input
                                  id="edit-serial-number"
                                  name="serial_number"
                                  value={currentSerialNumber.serial_number}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="edit-product">Produit</Label>
                                <Select
                                  value={currentSerialNumber.product_id || ''}
                                  onValueChange={handleProductChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un produit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-4">
                              <DialogClose asChild>
                                <Button variant="outline">Annuler</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={() => handleSave(() => {})}>
                                  Mettre à jour
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDelete(serialNumber.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
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
