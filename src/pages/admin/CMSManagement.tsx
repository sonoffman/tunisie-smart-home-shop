
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Pencil, Plus, Trash2, FileEdit, FileText, AlignLeft, Image } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Rich text editor imports if included
// ...

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  active: boolean;
  created_at: string;
}

interface InvoiceSettings {
  headerText: string;
  footerText: string;
  signature?: string;
  termsAndConditions?: string;
  companyName?: string;
  companyAddress?: string;
  companyTaxNumber?: string;
}

const pageSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  slug: z.string()
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets'),
  content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
});

const contactInfoSchema = z.object({
  phone: z.string().min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères'),
  email: z.string().email('Adresse email invalide'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
});

const invoiceSettingsSchema = z.object({
  headerText: z.string().min(3, 'Le texte d\'en-tête doit contenir au moins 3 caractères'),
  footerText: z.string().min(3, 'Le texte de bas de page doit contenir au moins 3 caractères'),
  signature: z.string().optional(),
  termsAndConditions: z.string().optional(),
  companyName: z.string().min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères'),
  companyAddress: z.string().min(5, 'L\'adresse de l\'entreprise doit contenir au moins 5 caractères'),
  companyTaxNumber: z.string().optional(),
});

const bannerSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  subtitle: z.string().optional(),
  link: z.string().optional(),
  active: z.boolean().default(true),
  image_url: z.string().min(5, 'L\'image est requise'),
});

type PageFormValues = z.infer<typeof pageSchema>;
type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;
type InvoiceSettingsFormValues = z.infer<typeof invoiceSettingsSchema>;
type BannerFormValues = z.infer<typeof bannerSchema>;

const CMSManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pages");
  
  // Pages state
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [currentPage, setCurrentPage] = useState<CMSPage | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Banners state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [isBannerAddDialogOpen, setIsBannerAddDialogOpen] = useState(false);
  const [isBannerEditDialogOpen, setIsBannerEditDialogOpen] = useState(false);
  const [isBannerDeleteDialogOpen, setIsBannerDeleteDialogOpen] = useState(false);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const bannerImageInputRef = useRef<HTMLInputElement>(null);
  
  // Contact info state
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: "50330000",
    email: "contact@sonoff-tunisie.com",
    address: "Tunis, Tunisie"
  });
  const [isContactInfoDialogOpen, setIsContactInfoDialogOpen] = useState(false);
  
  // Invoice settings state
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    headerText: "FACTURE",
    footerText: "Merci pour votre confiance",
    signature: "",
    termsAndConditions: "Tous les prix sont exprimés en Dinar Tunisien (TND).",
    companyName: "SONOFF Tunisie",
    companyAddress: "Tunis, Tunisie",
    companyTaxNumber: ""
  });
  const [isInvoiceSettingsDialogOpen, setIsInvoiceSettingsDialogOpen] = useState(false);
  
  // Forms
  const pageForm = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
    }
  });

  const editPageForm = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
    }
  });
  
  const contactInfoForm = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      phone: contactInfo.phone,
      email: contactInfo.email,
      address: contactInfo.address,
    }
  });
  
  const invoiceSettingsForm = useForm<InvoiceSettingsFormValues>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: {
      headerText: invoiceSettings.headerText,
      footerText: invoiceSettings.footerText,
      signature: invoiceSettings.signature,
      termsAndConditions: invoiceSettings.termsAndConditions,
      companyName: invoiceSettings.companyName,
      companyAddress: invoiceSettings.companyAddress,
      companyTaxNumber: invoiceSettings.companyTaxNumber,
    }
  });
  
  const bannerForm = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      link: '',
      active: true,
      image_url: '',
    }
  });
  
  const editBannerForm = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      link: '',
      active: true,
      image_url: '',
    }
  });

  // Fetch data on component mount
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
      if (activeTab === 'pages') {
        fetchPages();
      } else if (activeTab === 'banners') {
        fetchBanners();
      } else if (activeTab === 'contactInfo') {
        fetchContactInfo();
      } else if (activeTab === 'invoiceSettings') {
        fetchInvoiceSettings();
      }
    }
  }, [user, isAdmin, navigate, activeTab]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('title');

      if (error) throw error;
      
      setPages(data);
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
  
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setBanners(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les bannières: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('content')
        .eq('slug', 'contact-info')
        .maybeSingle();

      if (error) throw error;
      
      if (data?.content) {
        try {
          const parsedInfo = JSON.parse(data.content);
          setContactInfo({
            phone: parsedInfo.phone || contactInfo.phone,
            email: parsedInfo.email || contactInfo.email,
            address: parsedInfo.address || contactInfo.address
          });
          
          contactInfoForm.reset({
            phone: parsedInfo.phone || contactInfo.phone,
            email: parsedInfo.email || contactInfo.email,
            address: parsedInfo.address || contactInfo.address
          });
        } catch (parseError) {
          console.error("Error parsing contact info JSON:", parseError);
        }
      } else {
        // Create the contact info page if it doesn't exist
        const defaultContactInfo = {
          phone: contactInfo.phone,
          email: contactInfo.email,
          address: contactInfo.address
        };
        
        const { error: createError } = await supabase
          .from('cms_pages')
          .insert({
            title: "Coordonnées de Contact",
            slug: "contact-info",
            content: JSON.stringify(defaultContactInfo)
          });
          
        if (createError) throw createError;
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les coordonnées de contact: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const fetchInvoiceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('content')
        .eq('slug', 'invoice-settings')
        .maybeSingle();

      if (error) throw error;
      
      if (data?.content) {
        try {
          const parsedSettings = JSON.parse(data.content);
          setInvoiceSettings({
            headerText: parsedSettings.headerText || invoiceSettings.headerText,
            footerText: parsedSettings.footerText || invoiceSettings.footerText,
            signature: parsedSettings.signature || invoiceSettings.signature,
            termsAndConditions: parsedSettings.termsAndConditions || invoiceSettings.termsAndConditions,
            companyName: parsedSettings.companyName || invoiceSettings.companyName,
            companyAddress: parsedSettings.companyAddress || invoiceSettings.companyAddress,
            companyTaxNumber: parsedSettings.companyTaxNumber || invoiceSettings.companyTaxNumber
          });
          
          invoiceSettingsForm.reset({
            headerText: parsedSettings.headerText || invoiceSettings.headerText,
            footerText: parsedSettings.footerText || invoiceSettings.footerText,
            signature: parsedSettings.signature || "",
            termsAndConditions: parsedSettings.termsAndConditions || "",
            companyName: parsedSettings.companyName || invoiceSettings.companyName,
            companyAddress: parsedSettings.companyAddress || invoiceSettings.companyAddress,
            companyTaxNumber: parsedSettings.companyTaxNumber || ""
          });
        } catch (parseError) {
          console.error("Error parsing invoice settings JSON:", parseError);
        }
      } else {
        // Create the invoice settings page if it doesn't exist
        const { error: createError } = await supabase
          .from('cms_pages')
          .insert({
            title: "Paramètres de Facture",
            slug: "invoice-settings",
            content: JSON.stringify(invoiceSettings)
          });
          
        if (createError) throw createError;
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les paramètres de facture: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Page CRUD operations
  const handleAddPage = async (formData: PageFormValues) => {
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .insert({
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La page a été créée avec succès",
      });

      pageForm.reset();
      setIsAddDialogOpen(false);
      fetchPages();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de créer la page: ${error.message}`,
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
          content: formData.content,
        })
        .eq('id', currentPage.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La page a été mise à jour avec succès",
      });

      setCurrentPage(null);
      setIsEditDialogOpen(false);
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
      setIsDeleteDialogOpen(false);
      fetchPages();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la page: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (page: CMSPage) => {
    setCurrentPage(page);
    editPageForm.reset({
      title: page.title,
      slug: page.slug,
      content: page.content,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (page: CMSPage) => {
    // Don't allow deleting system pages
    if (page.slug === 'contact-info' || page.slug === 'invoice-settings') {
      toast({
        title: "Action interdite",
        description: "Vous ne pouvez pas supprimer cette page système",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentPage(page);
    setIsDeleteDialogOpen(true);
  };
  
  // Contact Info operations
  const handleSaveContactInfo = async (formData: ContactInfoFormValues) => {
    try {
      // Check if the contact info page exists
      const { data, error } = await supabase
        .from('cms_pages')
        .select('id')
        .eq('slug', 'contact-info')
        .maybeSingle();
        
      if (error) throw error;
      
      const contactInfoContent = JSON.stringify({
        phone: formData.phone,
        email: formData.email,
        address: formData.address
      });
      
      if (data?.id) {
        // Update existing page
        const { error: updateError } = await supabase
          .from('cms_pages')
          .update({
            content: contactInfoContent
          })
          .eq('id', data.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new page
        const { error: insertError } = await supabase
          .from('cms_pages')
          .insert({
            title: "Coordonnées de Contact",
            slug: "contact-info",
            content: contactInfoContent
          });
          
        if (insertError) throw insertError;
      }
      
      setContactInfo({
        phone: formData.phone,
        email: formData.email,
        address: formData.address
      });
      
      toast({
        title: "Succès",
        description: "Les coordonnées de contact ont été mises à jour avec succès",
      });
      
      setIsContactInfoDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour les coordonnées de contact: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  // Invoice settings operations
  const handleSaveInvoiceSettings = async (formData: InvoiceSettingsFormValues) => {
    try {
      // Check if the invoice settings page exists
      const { data, error } = await supabase
        .from('cms_pages')
        .select('id')
        .eq('slug', 'invoice-settings')
        .maybeSingle();
        
      if (error) throw error;
      
      const invoiceSettingsContent = JSON.stringify({
        headerText: formData.headerText,
        footerText: formData.footerText,
        signature: formData.signature || "",
        termsAndConditions: formData.termsAndConditions || "",
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        companyTaxNumber: formData.companyTaxNumber || ""
      });
      
      if (data?.id) {
        // Update existing page
        const { error: updateError } = await supabase
          .from('cms_pages')
          .update({
            content: invoiceSettingsContent
          })
          .eq('id', data.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new page
        const { error: insertError } = await supabase
          .from('cms_pages')
          .insert({
            title: "Paramètres de Facture",
            slug: "invoice-settings",
            content: invoiceSettingsContent
          });
          
        if (insertError) throw insertError;
      }
      
      setInvoiceSettings({
        headerText: formData.headerText,
        footerText: formData.footerText,
        signature: formData.signature,
        termsAndConditions: formData.termsAndConditions,
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        companyTaxNumber: formData.companyTaxNumber
      });
      
      toast({
        title: "Succès",
        description: "Les paramètres de facture ont été mis à jour avec succès",
      });
      
      setIsInvoiceSettingsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour les paramètres de facture: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  // Ensure buckets exist before upload
  const ensureBucketsExist = async () => {
    try {
      // Get list of existing buckets
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) throw listError;
      
      // Check if banners bucket exists
      const bannersBucketExists = buckets?.some(bucket => bucket.name === 'banners');
      
      if (!bannersBucketExists) {
        console.log("Creating banners bucket...");
        const { error } = await supabase.storage.createBucket('banners', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (error) throw error;
        console.log("Bucket 'banners' created successfully");
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring buckets exist:", error);
      throw error;
    }
  };
  
  // Banner image handlers
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
  
  // Banner CRUD operations
  const handleAddBanner = async (formData: BannerFormValues) => {
    try {
      // Ensure banners bucket exists
      await ensureBucketsExist();
      
      // Upload image if provided
      let imageUrl = formData.image_url;
      
      if (bannerImageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(`${Date.now()}-${bannerImageFile.name}`, bannerImageFile);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(uploadData.path);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Add banner to database
      const { data, error } = await supabase
        .from('banners')
        .insert({
          title: formData.title,
          subtitle: formData.subtitle || null,
          image_url: imageUrl,
          link: formData.link || null,
          active: formData.active
        })
        .select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La bannière a été créée avec succès",
      });

      bannerForm.reset();
      setBannerImageFile(null);
      setBannerImagePreview(null);
      setIsBannerAddDialogOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de créer la bannière: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const handleEditBanner = async (formData: BannerFormValues) => {
    if (!currentBanner) return;

    try {
      // Ensure banners bucket exists
      await ensureBucketsExist();
      
      // Upload image if changed
      let imageUrl = currentBanner.image_url;
      
      if (bannerImageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(`${Date.now()}-${bannerImageFile.name}`, bannerImageFile);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(uploadData.path);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Update banner in database
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
      setIsBannerEditDialogOpen(false);
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
      setIsBannerDeleteDialogOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la bannière: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const openBannerEditDialog = (banner: Banner) => {
    setCurrentBanner(banner);
    editBannerForm.reset({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link: banner.link || '',
      active: banner.active
    });
    setBannerImagePreview(banner.image_url);
    setIsBannerEditDialogOpen(true);
  };
  
  const openBannerDeleteDialog = (banner: Banner) => {
    setCurrentBanner(banner);
    setIsBannerDeleteDialogOpen(true);
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion de Contenu</h1>
          
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText size={16} /> Pages
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Image size={16} /> Bannières
            </TabsTrigger>
            <TabsTrigger value="contactInfo" className="flex items-center gap-2">
              <Phone size={16} /> Coordonnées
            </TabsTrigger>
            <TabsTrigger value="invoiceSettings" className="flex items-center gap-2">
              <FileEdit size={16} /> Facture
            </TabsTrigger>
          </TabsList>
          
          {/* Pages Tab */}
          <TabsContent value="pages">
            <div className="mb-6">
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-sonoff-blue hover:bg-sonoff-teal">
                <Plus className="mr-2 h-4 w-4" /> Ajouter une page
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableCaption>Liste des pages CMS</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Date de modification</TableHead>
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
                        <TableCell>{format(new Date(page.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>{format(new Date(page.updated_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
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
          
          {/* Banners Tab */}
          <TabsContent value="banners">
            <div className="mb-6">
              <Button onClick={() => setIsBannerAddDialogOpen(true)} className="bg-sonoff-blue hover:bg-sonoff-teal">
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
                  ) : banners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Aucune bannière trouvée</TableCell>
                    </TableRow>
                  ) : (
                    banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <div className="h-14 w-24 rounded overflow-hidden">
                            <img 
                              src={banner.image_url} 
                              alt={banner.title} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{banner.title}</TableCell>
                        <TableCell>
                          {banner.active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(banner.created_at), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openBannerEditDialog(banner)}
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
                                    onClick={() => openBannerDeleteDialog(banner)}
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
          
          {/* Contact Info Tab */}
          <TabsContent value="contactInfo">
            <div className="bg-white rounded-lg shadow p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Coordonnées de Contact</h2>
                <p className="text-gray-600 mb-4">
                  Ces coordonnées sont affichées dans l'en-tête et le pied de page du site.
                </p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div>
                  <span className="font-medium text-gray-700">Téléphone:</span>
                  <p className="text-gray-800">{contactInfo.phone}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-800">{contactInfo.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Adresse:</span>
                  <p className="text-gray-800">{contactInfo.address}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  contactInfoForm.reset({
                    phone: contactInfo.phone,
                    email: contactInfo.email,
                    address: contactInfo.address
                  });
                  setIsContactInfoDialogOpen(true);
                }}
                className="bg-sonoff-blue hover:bg-sonoff-teal"
              >
                <Pencil className="mr-2 h-4 w-4" /> Modifier les coordonnées
              </Button>
            </div>
          </TabsContent>
          
          {/* Invoice Settings Tab */}
          <TabsContent value="invoiceSettings">
            <div className="bg-white rounded-lg shadow p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Paramètres de Facture</h2>
                <p className="text-gray-600 mb-4">
                  Ces paramètres sont utilisés pour la génération des factures.
                </p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div>
                  <span className="font-medium text-gray-700">Nom de l'entreprise:</span>
                  <p className="text-gray-800">{invoiceSettings.companyName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Adresse:</span>
                  <p className="text-gray-800">{invoiceSettings.companyAddress}</p>
                </div>
                {invoiceSettings.companyTaxNumber && (
                  <div>
                    <span className="font-medium text-gray-700">Numéro fiscal:</span>
                    <p className="text-gray-800">{invoiceSettings.companyTaxNumber}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Texte d'en-tête:</span>
                  <p className="text-gray-800">{invoiceSettings.headerText}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Texte de bas de page:</span>
                  <p className="text-gray-800">{invoiceSettings.footerText}</p>
                </div>
                {invoiceSettings.termsAndConditions && (
                  <div>
                    <span className="font-medium text-gray-700">Conditions générales:</span>
                    <p className="text-gray-800">{invoiceSettings.termsAndConditions}</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => {
                  invoiceSettingsForm.reset({
                    headerText: invoiceSettings.headerText,
                    footerText: invoiceSettings.footerText,
                    signature: invoiceSettings.signature || "",
                    termsAndConditions: invoiceSettings.termsAndConditions || "",
                    companyName: invoiceSettings.companyName,
                    companyAddress: invoiceSettings.companyAddress,
                    companyTaxNumber: invoiceSettings.companyTaxNumber || ""
                  });
                  setIsInvoiceSettingsDialogOpen(true);
                }}
                className="bg-sonoff-blue hover:bg-sonoff-teal"
              >
                <Pencil className="mr-2 h-4 w-4" /> Modifier les paramètres
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Page Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Ajouter une page</DialogTitle>
              <DialogDescription>
                Remplissez le formulaire pour créer une nouvelle page CMS
              </DialogDescription>
            </DialogHeader>
            <Form {...pageForm}>
              <form onSubmit={pageForm.handleSubmit(handleAddPage)} className="space-y-6">
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
                      <FormDescription>
                        L'identifiant unique de la page dans l'URL (ex: about pour /about)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={pageForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu *</FormLabel>
                      <FormControl>
                        <textarea 
                          className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Contenu HTML de la page"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Vous pouvez utiliser du HTML pour mettre en forme le contenu
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
        
        {/* Page Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Modifier la page</DialogTitle>
              <DialogDescription>
                Modifiez les informations de la page CMS
              </DialogDescription>
            </DialogHeader>
            <Form {...editPageForm}>
              <form onSubmit={editPageForm.handleSubmit(handleEditPage)} className="space-y-6">
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
                        <Input 
                          placeholder="slug-de-la-page" 
                          {...field} 
                          disabled={currentPage?.slug === 'contact-info' || currentPage?.slug === 'invoice-settings'}
                        />
                      </FormControl>
                      <FormDescription>
                        L'identifiant unique de la page dans l'URL (ex: about pour /about)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editPageForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu *</FormLabel>
                      <FormControl>
                        <textarea 
                          className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Contenu HTML de la page"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Vous pouvez utiliser du HTML pour mettre en forme le contenu
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
        
        {/* Page Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment supprimer cette page ? Cette action est irréversible.
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
                onClick={handleDeletePage}
              >
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Contact Info Edit Dialog */}
        <Dialog open={isContactInfoDialogOpen} onOpenChange={setIsContactInfoDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier les coordonnées de contact</DialogTitle>
              <DialogDescription>
                Mettez à jour les coordonnées affichées sur le site
              </DialogDescription>
            </DialogHeader>
            <Form {...contactInfoForm}>
              <form onSubmit={contactInfoForm.handleSubmit(handleSaveContactInfo)} className="space-y-6">
                <FormField
                  control={contactInfoForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone *</FormLabel>
                      <FormControl>
                        <Input placeholder="Numéro de téléphone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactInfoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="Adresse email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactInfoForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse *</FormLabel>
                      <FormControl>
                        <Input placeholder="Adresse" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsContactInfoDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-sonoff-blue hover:bg-sonoff-teal">
                    Sauvegarder
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Invoice Settings Edit Dialog */}
        <Dialog open={isInvoiceSettingsDialogOpen} onOpenChange={setIsInvoiceSettingsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier les paramètres de facture</DialogTitle>
              <DialogDescription>
                Mettez à jour les informations qui apparaissent sur les factures
              </DialogDescription>
            </DialogHeader>
            <Form {...invoiceSettingsForm}>
              <form onSubmit={invoiceSettingsForm.handleSubmit(handleSaveInvoiceSettings)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={invoiceSettingsForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'entreprise *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'entreprise" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={invoiceSettingsForm.control}
                    name="companyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse de l'entreprise *</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse de l'entreprise" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={invoiceSettingsForm.control}
                    name="companyTaxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro fiscal</FormLabel>
                        <FormControl>
                          <Input placeholder="Numéro fiscal (optionnel)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={invoiceSettingsForm.control}
                  name="headerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texte d'en-tête *</FormLabel>
                      <FormControl>
                        <Input placeholder="Texte d'en-tête de la facture" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={invoiceSettingsForm.control}
                  name="footerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texte de bas de page *</FormLabel>
                      <FormControl>
                        <Input placeholder="Texte de bas de page de la facture" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={invoiceSettingsForm.control}
                  name="signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature</FormLabel>
                      <FormControl>
                        <Input placeholder="URL de l'image de signature (optionnel)" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL d'une image de signature à afficher sur les factures
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={invoiceSettingsForm.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conditions générales</FormLabel>
                      <FormControl>
                        <textarea 
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Conditions générales (optionnel)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInvoiceSettingsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-sonoff-blue hover:bg-sonoff-teal">
                    Sauvegarder
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Banner Add Dialog */}
        <Dialog open={isBannerAddDialogOpen} onOpenChange={setIsBannerAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter une bannière</DialogTitle>
              <DialogDescription>
                Remplissez le formulaire pour créer une nouvelle bannière
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
                        <Input placeholder="URL de destination (optionnel)" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL vers laquelle l'utilisateur sera redirigé en cliquant sur la bannière
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bannerForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-sonoff-blue focus:ring-sonoff-blue"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Activer la bannière</FormLabel>
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Image *</FormLabel>
                  <div className="mt-2 flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => bannerImageInputRef.current?.click()}
                    >
                      <Image className="mr-2 h-4 w-4" />
                      Parcourir
                    </Button>
                    <input
                      ref={bannerImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerImageChange}
                    />
                    {bannerImagePreview && (
                      <div className="h-20 w-32 rounded overflow-hidden">
                        <img
                          src={bannerImagePreview}
                          alt="Aperçu"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <FormMessage>
                    {!bannerImageFile && !bannerForm.getValues('image_url') && bannerForm.formState.isSubmitted && (
                      <p className="text-sm font-medium text-destructive mt-1">L'image est requise</p>
                    )}
                  </FormMessage>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setBannerImageFile(null);
                      setBannerImagePreview(null);
                      setIsBannerAddDialogOpen(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-sonoff-blue hover:bg-sonoff-teal">
                    Ajouter
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Banner Edit Dialog */}
        <Dialog open={isBannerEditDialogOpen} onOpenChange={setIsBannerEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la bannière</DialogTitle>
              <DialogDescription>
                Modifiez les informations de la bannière
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
                        <Input placeholder="Sous-titre (optionnel)" {...field} value={field.value || ''} />
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
                        <Input placeholder="URL de destination (optionnel)" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        URL vers laquelle l'utilisateur sera redirigé en cliquant sur la bannière
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editBannerForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-sonoff-blue focus:ring-sonoff-blue"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Activer la bannière</FormLabel>
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Image</FormLabel>
                  <div className="mt-2 flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => bannerImageInputRef.current?.click()}
                    >
                      <Image className="mr-2 h-4 w-4" />
                      Changer d'image
                    </Button>
                    <input
                      ref={bannerImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerImageChange}
                    />
                    {bannerImagePreview && (
                      <div className="h-20 w-32 rounded overflow-hidden">
                        <img
                          src={bannerImagePreview}
                          alt="Aperçu"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setBannerImageFile(null);
                      setBannerImagePreview(null);
                      setIsBannerEditDialogOpen(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-sonoff-blue hover:bg-sonoff-teal">
                    Sauvegarder
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Banner Delete Dialog */}
        <Dialog open={isBannerDeleteDialogOpen} onOpenChange={setIsBannerDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment supprimer cette bannière ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsBannerDeleteDialogOpen(false)}
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
