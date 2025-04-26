
import { useState, useEffect, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pencil, Trash2, Plus, Image, CheckCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  description?: string;
  main_image_url?: string;
  additional_images?: string[];
  category_id?: string;
  category_name?: string;
  slug: string;
  featured?: boolean;
}

const productSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  slug: z.string().min(3, 'Le slug doit contenir au moins 3 caractères'),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Le prix doit être positif')
  ),
  stock_quantity: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'La quantité doit être positive')
  ),
  category_id: z.string().optional(),
  description: z.string().optional(),
  featured: z.boolean().optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      price: 0,
      stock_quantity: 0,
      description: '',
      category_id: undefined,
      featured: false
    }
  });

  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      price: 0,
      stock_quantity: 0,
      description: '',
      category_id: undefined,
      featured: false
    }
  });

  useEffect(() => {
    if (user === null || !isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: user === null 
          ? "Vous devez être connecté pour accéder à cette page." 
          : "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
    } else {
      fetchProducts();
      fetchCategories();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('name');

      if (error) throw error;

      const formattedProducts = data.map((product) => ({
        ...product,
        category_name: product.categories?.name,
        additional_images: Array.isArray(product.additional_images) 
          ? product.additional_images 
          : []
      }));

      setProducts(formattedProducts);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les produits: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les catégories: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async (formData: ProductFormValues) => {
    try {
      // Upload main image if provided
      let mainImageUrl = null;
      if (mainImageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`${Date.now()}-${mainImageFile.name}`, mainImageFile);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);
          
        mainImageUrl = urlData.publicUrl;
      }

      // Upload additional images if provided
      const additionalImagesUrls = [];
      for (const file of additionalImageFiles) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`${Date.now()}-${file.name}`, file);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);
          
        additionalImagesUrls.push(urlData.publicUrl);
      }

      // Add product to database
      const { error } = await supabase.from('products').insert([
        {
          name: formData.name,
          slug: formData.slug,
          price: formData.price,
          stock_quantity: formData.stock_quantity,
          description: formData.description || '',
          category_id: formData.category_id || null,
          main_image_url: mainImageUrl,
          additional_images: additionalImagesUrls,
          featured: formData.featured || false
        }
      ]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le produit a été ajouté avec succès",
      });

      // Reset form and state
      form.reset();
      setMainImageFile(null);
      setAdditionalImageFiles([]);
      setMainImagePreview(null);
      setAdditionalImagePreviews([]);
      setIsAddDialogOpen(false);
      
      // Refresh products list
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter le produit: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (formData: ProductFormValues) => {
    if (!currentProduct) return;

    try {
      // Upload main image if a new one is provided
      let mainImageUrl = currentProduct.main_image_url;
      if (mainImageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`${Date.now()}-${mainImageFile.name}`, mainImageFile);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);
          
        mainImageUrl = urlData.publicUrl;
      }

      // Process additional images
      let additionalImagesUrls = currentProduct.additional_images || [];
      
      // Upload new additional images if provided
      if (additionalImageFiles.length > 0) {
        const newUrls = [];
        for (const file of additionalImageFiles) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(`${Date.now()}-${file.name}`, file);

          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(uploadData.path);
            
          newUrls.push(urlData.publicUrl);
        }
        // Add new URLs to existing ones (up to a maximum of 3)
        additionalImagesUrls = [...additionalImagesUrls, ...newUrls].slice(0, 3);
      }

      // Update product in database
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          slug: formData.slug,
          price: formData.price,
          stock_quantity: formData.stock_quantity,
          description: formData.description || '',
          category_id: formData.category_id || null,
          main_image_url: mainImageUrl,
          additional_images: additionalImagesUrls,
          featured: formData.featured || false
        })
        .eq('id', currentProduct.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le produit a été mis à jour avec succès",
      });

      // Reset state
      setCurrentProduct(null);
      setMainImageFile(null);
      setAdditionalImageFiles([]);
      setMainImagePreview(null);
      setAdditionalImagePreviews([]);
      setIsEditDialogOpen(false);
      
      // Refresh products list
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le produit: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', currentProduct.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le produit a été supprimé avec succès",
      });

      setCurrentProduct(null);
      setIsDeleteDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le produit: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Limit to 3 additional images
      const files = Array.from(e.target.files).slice(0, 3);
      setAdditionalImageFiles(files);
      
      // Previews
      const previews: string[] = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === files.length) {
            setAdditionalImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    editForm.reset({
      name: product.name,
      slug: product.slug,
      price: product.price,
      stock_quantity: product.stock_quantity,
      description: product.description || '',
      category_id: product.category_id || undefined,
      featured: product.featured || false
    });
    setMainImagePreview(product.main_image_url || null);
    setAdditionalImagePreviews(product.additional_images || []);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} TND`;
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des Produits</h1>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  Retour au dashboard
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Retourner au tableau de bord d'administration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mb-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-sonoff-blue hover:bg-sonoff-teal">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Créer un nouveau produit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>Liste des produits</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>En avant</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Aucun produit trouvé</TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.main_image_url ? (
                        <div className="h-14 w-14 rounded overflow-hidden">
                          <img 
                            src={product.main_image_url} 
                            alt={product.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 bg-gray-200 rounded flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>{product.category_name || '-'}</TableCell>
                    <TableCell>{product.featured ? <CheckCircle className="h-5 w-5 text-green-500" /> : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openEditDialog(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Modifier ce produit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="border-red-300 hover:bg-red-50"
                                onClick={() => openDeleteDialog(product)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Supprimer ce produit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog pour ajouter un produit */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Ajouter un produit</DialogTitle>
              <DialogDescription>
                Remplissez le formulaire pour ajouter un nouveau produit
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddProduct)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du produit *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du produit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input placeholder="slug-du-produit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stock_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité en stock *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 p-4 rounded-md border">
                        <div>
                          <FormLabel>En avant</FormLabel>
                          <p className="text-sm text-gray-500">
                            Mettre ce produit en avant sur la page d'accueil
                          </p>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description du produit"
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <div>
                    <FormLabel>Image principale</FormLabel>
                    <div className="mt-2 flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => mainImageInputRef.current?.click()}
                      >
                        <Image className="mr-2 h-4 w-4" />
                        Parcourir
                      </Button>
                      <input
                        ref={mainImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleMainImageChange}
                      />
                      {mainImagePreview && (
                        <div className="h-20 w-20 rounded overflow-hidden">
                          <img
                            src={mainImagePreview}
                            alt="Aperçu"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <FormLabel>Images additionnelles (max 3)</FormLabel>
                    <div className="mt-2 flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => additionalImagesInputRef.current?.click()}
                      >
                        <Image className="mr-2 h-4 w-4" />
                        Parcourir
                      </Button>
                      <input
                        ref={additionalImagesInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAdditionalImagesChange}
                      />
                      <div className="flex gap-2">
                        {additionalImagePreviews.map((src, index) => (
                          <div key={index} className="h-20 w-20 rounded overflow-hidden">
                            <img
                              src={src}
                              alt={`Aperçu ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-sonoff-blue hover:bg-sonoff-teal">
                    Ajouter
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog pour éditer un produit */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Modifier le produit</DialogTitle>
              <DialogDescription>
                Modifiez les informations du produit
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditProduct)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du produit *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du produit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input placeholder="slug-du-produit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="stock_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité en stock *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 p-4 rounded-md border">
                        <div>
                          <FormLabel>En avant</FormLabel>
                          <p className="text-sm text-gray-500">
                            Mettre ce produit en avant sur la page d'accueil
                          </p>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description du produit"
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <div>
                    <FormLabel>Image principale</FormLabel>
                    <div className="mt-2 flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => mainImageInputRef.current?.click()}
                      >
                        <Image className="mr-2 h-4 w-4" />
                        Changer d'image
                      </Button>
                      <input
                        ref={mainImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleMainImageChange}
                      />
                      {mainImagePreview && (
                        <div className="h-20 w-20 rounded overflow-hidden">
                          <img
                            src={mainImagePreview}
                            alt="Aperçu"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <FormLabel>Images additionnelles (max 3)</FormLabel>
                    <div className="mt-2 flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => additionalImagesInputRef.current?.click()}
                      >
                        <Image className="mr-2 h-4 w-4" />
                        Parcourir
                      </Button>
                      <input
                        ref={additionalImagesInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAdditionalImagesChange}
                      />
                      <div className="flex gap-2">
                        {additionalImagePreviews.map((src, index) => (
                          <div key={index} className="h-20 w-20 rounded overflow-hidden">
                            <img
                              src={src}
                              alt={`Aperçu ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-sonoff-blue hover:bg-sonoff-teal">
                    Sauvegarder
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog pour confirmer la suppression */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment supprimer ce produit? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProduct}
              >
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ProductManagement;
