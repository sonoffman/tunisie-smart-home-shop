import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Editor } from '@/components/ui/editor';
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
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pencil, Trash2, Plus, Eye, Mail, Phone as PhoneIcon } from 'lucide-react';

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ContactInfo {
  id: string;
  phone: string;
  email: string;
  address: string;
}

interface InvoiceSettings {
  id: string;
  header_text: string;
  footer_text: string;
  signature_image_url: string | null;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const pageSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  slug: z.string().min(3, 'Le slug doit contenir au moins 3 caractères'),
  content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères')
});

const contactSchema = z.object({
  phone: z.string().min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères'),
  email: z.string().email('Adresse email invalide'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères')
});

const invoiceSettingsSchema = z.object({
  header_text: z.string().min(5, 'Le texte d\'en-tête doit contenir au moins 5 caractères'),
  footer_text: z.string().min(5, 'Le texte de bas de page doit contenir au moins 5 caractères')
});

const bannerSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  subtitle: z.string().optional(),
  image_url: z.string().min(5, 'L\'URL de l\'image est requise'),
  link: z.string().optional(),
  active: z.boolean().default(true)
});

type PageFormValues = z.infer<typeof pageSchema>;
type ContactFormValues = z.infer<typeof contactSchema>;
type InvoiceSettingsFormValues = z.infer<typeof invoiceSettingsSchema>;
type BannerFormValues = z.infer<typeof bannerSchema>;

const CMSManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("pages");
  const [isAddPageDialogOpen, setIsAddPageDialogOpen] = useState(false);
  const [isEditPageDialogOpen, setIsEditPageDialogOpen] = useState(false);
  const [isDeletePageDialogOpen, setIsDeletePageDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<CmsPage | null>(null);
  const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false);
  const [isEditInvoiceSettingsDialogOpen, setIsEditInvoiceSettingsDialogOpen] = useState(false);
  const [signatureImageFile, setSignatureImageFile] = useState<File | null>(null);
  const [signatureImagePreview, setSignatureImagePreview] = useState<string | null>(null);
  const [isAddBannerDialogOpen, setIsAddBannerDialogOpen] = useState(false);
  const [isEditBannerDialogOpen, setIsEditBannerDialogOpen] = useState(false);
  const [isDeleteBannerDialogOpen, setIsDeleteBannerDialogOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);

  const pageForm = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: ''
    }
  });

  const editPageForm = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: ''
    }
  });

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: '',
      email: '',
      address: ''
    }
  });

  const invoiceSettingsForm = useForm<InvoiceSettingsFormValues>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: {
      header_text: '',
      footer_text: ''
    }
  });

  const bannerForm = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      image_url: '',
      link: '',
      active: true
    }
  });

  const editBannerForm = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      image_url: '',
      link: '',
      active: true
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
      fetchPages();
      fetchContactInfo();
      fetchInvoiceSettings();
      fetchBanners();
    }
  }, [user, isAdmin, navigate, toast]);

  const ensureBucketsExist = async () => {
    try {
      console.log("Checking if buckets exist...");
      
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error listing buckets:", listError);
        throw listError;
      }
      
      const bannersBucketExists = buckets?.some(bucket => bucket.name === 'banners');
      
      if (!bannersBucketExists) {
        console.log("Creating banners bucket...");
        const { error } = await supabase.storage.createBucket('banners', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (error) {
          console.error("Error creating banners bucket:", error);
          throw error;
        }
        
        console.log("Bucket 'banners' created successfully");
      }
      
      const invoiceAssetsBucketExists = buckets?.some(bucket => bucket.name === 'invoice-assets');
      
      if (!invoiceAssetsBucketExists) {
        console.log("Creating invoice-assets bucket...");
        const { error } = await supabase.storage.createBucket('invoice-assets', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
        if (error) {
          console.error("Error creating invoice-assets bucket:", error);
          throw error;
        }
        
        console.log("Bucket 'invoice-assets' created successfully");
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring buckets exist:", error);
      throw error;
    }
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('title');

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les pages: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPage = async (formData: PageFormValues) => {
    try {
      const { error } = await supabase.from('cms_pages').insert([
        {
          title: formData.title,
          slug: formData.slug,
          content: formData.content
        }
      ]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La page a été ajoutée avec succès",
      });

      pageForm.reset();
      setIsAddPageDialogOpen(false);
      fetchPages();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter la page: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEditPage = async (formData: PageFormValues) => {
    if (!currentPage) return;

    try {
      const { error } = await supabase
        .from('cms_pages')
        .update({
          title: formData.title,
          slug: formData.slug,
          content: formData.content
        })
        .eq('id', currentPage.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La page a été mise à jour avec succès",
      });

      setCurrentPage(null);
      setIsEditPageDialogOpen(false);
      fetchPages();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour la page: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeletePage = async () => {
    if (!currentPage) return;

    try {
      const { error } = await supabase
        .from('cms_pages')
        .delete()
        .eq('id', currentPage.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La page a été supprimée avec succès",
      });

      setCurrentPage(null);
      setIsDeletePageDialogOpen(false);
      fetchPages();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la page: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEditContact = async (formData: ContactFormValues) => {
    try {
      if (contactInfo) {
        const { error } = await supabase
          .from('contact_info')
          .update({
            phone: formData.phone,
            email: formData.email,
            address: formData.address
          })
          .eq('id', contactInfo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_info')
          .insert({
            phone: formData.phone,
            email: formData.email,
            address: formData.address
          });

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Les informations de contact ont été mises à jour",
      });

      setIsEditContactDialogOpen(false);
      fetchContactInfo();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour les informations de contact: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEditInvoiceSettings = async (formData: InvoiceSettingsFormValues) => {
    try {
      let imageUrl = invoiceSettings?.signature_image_url || null;
      
      if (signatureImageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('invoice-assets')
          .upload(`signature-${Date.now()}.png`, signatureImageFile);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('invoice-assets')
          .getPublicUrl(uploadData.path);
          
        imageUrl = urlData.publicUrl;
      }

      if (invoiceSettings) {
        const { error } = await supabase
          .from('invoice_settings')
          .update({
            header_text: formData.header_text,
            footer_text: formData.footer_text,
            signature_image_url: imageUrl
          })
          .eq('id', invoiceSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('invoice_settings')
          .insert({
            header_text: formData.header_text,
            footer_text: formData.footer_text,
            signature_image_url: imageUrl
          });

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Les paramètres de facture ont été mis à jour",
      });

      setSignatureImageFile(null);
      setSignatureImagePreview(null);
      setIsEditInvoiceSettingsDialogOpen(false);
      fetchInvoiceSettings();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour les paramètres de facture: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddBanner = async (formData: BannerFormValues) => {
    try {
      await ensureBucketsExist();
      
      let imageUrl = formData.image_url;
      
      if (bannerImageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(`banner-${Date.now()}.png`, bannerImageFile);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(uploadData.path);
          
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('banners')
        .insert([{
          title: formData.title,
          subtitle: formData.subtitle || null,
          image_url: imageUrl,
          link: formData.link || null,
          active: formData.active
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La bannière a été ajoutée avec succès",
      });

      setBannerImageFile(null);
      setBannerImagePreview(null);
      setIsAddBannerDialogOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter la bannière: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEditBanner = async (formData: BannerFormValues) => {
    if (!currentBanner) return;
    
    try {
      await ensureBucketsExist();
      
      let imageUrl = currentBanner.image_url;
      
      if (bannerImageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(`banner-${Date.now()}.png`, bannerImageFile);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(uploadData.path);
          
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('banners')
        .update({
          title: formData.title,
          subtitle: formData.subtitle || null,
          image_url: imageUrl,
          link: formData.link || null,
          active: formData.active
        })
        .eq('id', currentBanner.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La bannière a été mise à jour avec succès",
      });

      setCurrentBanner(null);
      setBannerImageFile(null);
      setBannerImagePreview(null);
      setIsEditBannerDialogOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour la bannière: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteBanner = async () => {
    if (!currentBanner) return;
    
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', currentBanner.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La bannière a été supprimée avec succès",
      });

      setCurrentBanner(null);
      setIsDeleteBannerDialogOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la bannière: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setContactInfo(data || null);
      
      if (data) {
        contactForm.reset({
          phone: data.phone,
          email: data.email,
          address: data.address
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les informations de contact: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchInvoiceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setInvoiceSettings(data || null);
      setSignatureImagePreview(data?.signature_image_url || null);
      
      if (data) {
        invoiceSettingsForm.reset({
          header_text: data.header_text,
          footer_text: data.footer_text
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les paramètres de facture: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les bannières: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSignatureImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSignatureImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditDialog = (page: CmsPage) => {
    setCurrentPage(page);
    editPageForm.reset({
      title: page.title,
      slug: page.slug,
      content: page.content
    });
    setIsEditPageDialogOpen(true);
  };

  const openDeleteDialog = (page: CmsPage) => {
    setCurrentPage(page);
    setIsDeletePageDialogOpen(true);
  };

  const openEditBannerDialog = (banner: Banner) => {
    setCurrentBanner(banner);
    editBannerForm.reset({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link: banner.link || '',
      active: banner.active
    });
    setBannerImagePreview(banner.image_url);
    setIsEditBannerDialogOpen(true);
  };

  const openDeleteBannerDialog = (banner: Banner) => {
    setCurrentBanner(banner);
    setIsDeleteBannerDialogOpen(true);
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des Pages CMS</h1>
          
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

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="contact">Coordonnées de contact</TabsTrigger>
            <TabsTrigger value="invoice">Paramètres de facture</TabsTrigger>
            <TabsTrigger value="banners">Bannières</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pages">
            <div className="flex justify-end mb-6">
              <Button onClick={() => setIsAddPageDialogOpen(true)} className="bg-sonoff-blue hover:bg-sonoff-teal">
                <Plus className="mr-2 h-4 w-4" /> Ajouter une page
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableCaption>Liste des pages du site</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Dernière mise à jour</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Chargement...</TableCell>
                    </TableRow>
                  ) : pages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Aucune page trouvée</TableCell>
                    </TableRow>
                  ) : (
                    pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.title}</TableCell>
                        <TableCell>{page.slug}</TableCell>
                        <TableCell>{new Date(page.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(page.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => window.open(`/cms/${page.slug}`, '_blank')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Voir la page</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openEditDialog(page)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Modifier cette page</p>
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
                                    onClick={() => openDeleteDialog(page)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Supprimer cette page</p>
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
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="bg-white rounded-lg shadow overflow-hidden p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Coordonnées de contact</h2>
                  <p className="text-gray-500 mb-4">
                    Ces informations sont affichées dans le pied de page et sur la page de contact
                  </p>
                </div>
                <Button 
                  onClick={() => setIsEditContactDialogOpen(true)}
                  className="bg-sonoff-blue hover:bg-sonoff-teal"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-10">Chargement...</div>
              ) : contactInfo ? (
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="h-5 w-5 text-sonoff-blue mt-1" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-gray-600">{contactInfo.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-sonoff-blue mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">{contactInfo.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sonoff-blue mt-1">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-gray-600">{contactInfo.address}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">Aucune information de contact définie</p>
                  <Button 
                    onClick={() => setIsEditContactDialogOpen(true)}
                    className="bg-sonoff-blue hover:bg-sonoff-teal"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Ajouter des coordonnées
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="invoice">
            <div className="bg-white rounded-lg shadow overflow-hidden p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Paramètres de facture</h2>
                  <p className="text-gray-500 mb-4">
                    Personnalisez l'apparence de vos factures
                  </p>
                </div>
                <Button 
                  onClick={() => setIsEditInvoiceSettingsDialogOpen(true)}
                  className="bg-sonoff-blue hover:bg-sonoff-teal"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-10">Chargement...</div>
              ) : invoiceSettings ? (
                <div className="grid gap-6">
                  <div>
                    <h3 className="font-medium text-lg mb-2">En-tête de facture</h3>
                    <div className="p-4 bg-gray-50 rounded border">
                      <p className="whitespace-pre-wrap">{invoiceSettings.header_text}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">Pied de page de facture</h3>
                    <div className="p-4 bg-gray-50 rounded border">
                      <p className="whitespace-pre-wrap">{invoiceSettings.footer_text}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">Signature</h3>
                    {invoiceSettings.signature_image_url ? (
                      <div className="p-4 bg-gray-50 rounded border flex justify-center">
                        <img 
                          src={invoiceSettings.signature_image_url} 
                          alt="Signature" 
                          className="max-h-32" 
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded border text-center text-gray-500">
                        Aucune signature définie
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">Aucun paramètre de facture défini</p>
                  <Button 
                    onClick={() => setIsEditInvoiceSettingsDialogOpen(true)}
                    className="bg-sonoff-blue hover:bg-sonoff-teal"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Configurer les paramètres
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="banners">
            <div className="flex justify-end mb-6">
              <Button onClick={() => setIsAddBannerDialogOpen(true)} className="bg-sonoff-blue hover:bg-sonoff-teal">
                <Plus className="mr-2 h-4 w-4" /> Ajouter une bannière
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableCaption>Liste des bannières</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Sous-titre</TableHead>
                    <TableHead>Lien</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Chargement...</TableCell>
                    </TableRow>
                  ) : banners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Aucune bannière trouvée</TableCell>
                    </TableRow>
                  ) : (
                    banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <div className="h-14 w-20 rounded overflow-hidden">
                            <img 
                              src={banner.image_url} 
                              alt={banner.title} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{banner.title}</TableCell>
                        <TableCell>{banner.subtitle || '-'}</TableCell>
                        <TableCell>{banner.link ? (
                          <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-sonoff-blue hover:underline">
                            Voir le lien
                          </a>
                        ) : '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {banner.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openEditBannerDialog(banner)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Modifier cette bannière</p>
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
                                    onClick={() => openDeleteBannerDialog(banner)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Supprimer cette bannière</p>
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
          </TabsContent>
        </Tabs>

        <Dialog open={isAddPageDialogOpen} onOpenChange={setIsAddPageDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Ajouter une page</DialogTitle>
              <DialogDescription>
                Créez une nouvelle page pour votre site
              </DialogDescription>
            </DialogHeader>
            
            <Form {...pageForm}>
              <form onSubmit={pageForm.handleSubmit(handleAddPage)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={pageForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre de la page" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={pageForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input placeholder="slug-de-la-page" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={pageForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu *</FormLabel>
                      <FormControl>
                        <Editor 
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Contenu de la page..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddPageDialogOpen(false)}
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

        <Dialog open={isEditPageDialogOpen} onOpenChange={setIsEditPageDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Modifier la page</DialogTitle>
              <DialogDescription>
                Modifiez le contenu de la page
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editPageForm}>
              <form onSubmit={editPageForm.handleSubmit(handleEditPage)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editPageForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre de la page" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editPageForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input placeholder="slug-de-la-page" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editPageForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu *</FormLabel>
                      <FormControl>
                        <Editor 
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Contenu de la page..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditPageDialogOpen(false)}
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

        <Dialog open={isDeletePageDialogOpen} onOpenChange={setIsDeletePageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment supprimer cette page? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeletePageDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePage}
              >
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditContactDialogOpen} onOpenChange={setIsEditContactDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Coordonnées de contact</DialogTitle>
              <DialogDescription>
                Modifiez les informations de contact de votre entreprise
              </DialogDescription>
            </DialogHeader>
            
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(handleEditContact)} className="space-y-6">
                <FormField
                  control={contactForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone *</FormLabel>
                      <FormControl>
                        <Input placeholder="+216 XX XXX XXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Adresse complète"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditContactDialogOpen(false)}
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

        <Dialog open={isEditInvoiceSettingsDialogOpen} onOpenChange={setIsEditInvoiceSettingsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Paramètres de facture</DialogTitle>
              <DialogDescription>
                Personnalisez l'apparence de vos factures
              </DialogDescription>
            </DialogHeader>
            
            <Form {...invoiceSettingsForm}>
              <form onSubmit={invoiceSettingsForm.handleSubmit(handleEditInvoiceSettings)} className="space-y-6">
                <FormField
                  control={invoiceSettingsForm.control}
                  name="header_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texte d'en-tête *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Texte qui apparaîtra en haut de la facture"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={invoiceSettingsForm.control}
                  name="footer_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texte de pied de page *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Texte qui apparaîtra en bas de la facture"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Signature</FormLabel>
                  <div className="mt-2">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('signature-upload')?.click()}
                      >
                        Parcourir
                      </Button>
                      <input
                        id="signature-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSignatureImageChange}
                      />
                      {signatureImagePreview && (
                        <div className="h-20 rounded overflow-hidden">
                          <img
                            src={signatureImagePreview}
                            alt="Aperçu de la signature"
                            className="h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Image de signature qui apparaîtra sur les factures (PNG ou JPEG recommandé)
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditInvoiceSettingsDialogOpen(false)}
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

        <Dialog open={isAddBannerDialogOpen} onOpenChange={setIsAddBannerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une bannière</DialogTitle>
              <DialogDescription>
                Créez une nouvelle bannière pour votre site
              </DialogDescription>
            </DialogHeader>
            
            <Form {...bannerForm}>
              <form onSubmit={bannerForm.handleSubmit(handleAddBanner)} className="space-y-6">
                <FormField
                  control={bannerForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de la bannière" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bannerForm.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sous-titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Sous-titre (optionnel)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bannerForm.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lien</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bannerForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-sonoff-blue focus:ring-sonoff-blue"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Activer la bannière</FormLabel>
                        <p className="text-sm text-gray-500">
                          La bannière sera visible sur le site si cette option est activée
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Image de la bannière *</FormLabel>
                  <div className="mt-2">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('banner-upload')?.click()}
                      >
                        Parcourir
                      </Button>
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerImageChange}
                      />
                      {bannerImagePreview && (
                        <div className="h-20 rounded overflow-hidden">
                          <img
                            src={bannerImagePreview}
                            alt="Aperçu de la bannière"
                            className="h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Image de la bannière (format recommandé: 1920x600px)
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddBannerDialogOpen(false)}
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

        <Dialog open={isEditBannerDialogOpen} onOpenChange={setIsEditBannerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la bannière</DialogTitle>
              <DialogDescription>
                Modifiez les détails de la bannière
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editBannerForm}>
              <form onSubmit={editBannerForm.handleSubmit(handleEditBanner)} className="space-y-6">
                <FormField
                  control={editBannerForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de la bannière" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editBannerForm.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sous-titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Sous-titre (optionnel)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editBannerForm.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lien</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editBannerForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-sonoff-blue focus:ring-sonoff-blue"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Activer la bannière</FormLabel>
                        <p className="text-sm text-gray-500">
                          La bannière sera visible sur le site si cette option est activée
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Image de la bannière</FormLabel>
                  <div className="mt-2">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('banner-edit-upload')?.click()}
                      >
                        Changer l'image
                      </Button>
                      <input
                        id="banner-edit-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerImageChange}
                      />
                      {bannerImagePreview && (
                        <div className="h-20 rounded overflow-hidden">
                          <img
                            src={bannerImagePreview}
                            alt="Aperçu de la bannière"
                            className="h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Image de la bannière (format recommandé: 1920x600px)
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditBannerDialogOpen(false)}
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

        <Dialog open={isDeleteBannerDialogOpen} onOpenChange={setIsDeleteBannerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment supprimer cette bannière? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteBannerDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteBanner}
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

export default CMSManagement;
