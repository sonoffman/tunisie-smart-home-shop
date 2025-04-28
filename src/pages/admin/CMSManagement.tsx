
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Pencil, 
  Eye,
  FileText
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

interface InvoiceSettings {
  id: string;
  header_text: string;
  footer_text: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  tax_id: string;
  logo_url?: string;
  signature_url?: string;
}

const CMSManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Partial<CMSPage>>({
    title: '',
    slug: '',
    content: ''
  });
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    id: '',
    header_text: '',
    footer_text: '',
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    tax_id: '',
    logo_url: '',
    signature_url: '',
  });
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("pages");

  useEffect(() => {
    // Redirect non-admin users
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
    
    fetchCMSPages();
    fetchInvoiceSettings();
  }, [user, isAdmin, navigate, toast]);

  const fetchCMSPages = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setPages(data as CMSPage[]);
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

  const fetchInvoiceSettings = async () => {
    try {
      // Vérifier si une page CMS "invoice_settings" existe déjà
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('slug', 'invoice_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 est le code d'erreur pour "No rows found"
        throw error;
      }

      if (data) {
        try {
          const settingsData = JSON.parse(data.content);
          setInvoiceSettings({
            id: data.id,
            header_text: settingsData.header_text || '',
            footer_text: settingsData.footer_text || '',
            company_name: settingsData.company_name || '',
            company_address: settingsData.company_address || '',
            company_phone: settingsData.company_phone || '',
            company_email: settingsData.company_email || '',
            tax_id: settingsData.tax_id || '',
            logo_url: settingsData.logo_url || '',
            signature_url: settingsData.signature_url || ''
          });
        } catch (parseError) {
          console.error("Erreur de parsing des paramètres de facture:", parseError);
          // Initialiser avec des valeurs par défaut
        }
      } else {
        // Créer un nouvel enregistrement de paramètres de facture
        const defaultSettings = {
          header_text: 'Facture',
          footer_text: 'Merci pour votre achat',
          company_name: 'SONOFF Tunisie',
          company_address: 'Tunis, Tunisie',
          company_phone: '+216 XX XXX XXX',
          company_email: 'contact@sonoff-tunisie.com',
          tax_id: '',
          logo_url: '',
          signature_url: ''
        };

        const { data: newData, error: insertError } = await supabase
          .from('cms_pages')
          .insert({
            title: 'Paramètres de facture',
            slug: 'invoice_settings',
            content: JSON.stringify(defaultSettings)
          })
          .select()
          .single();

        if (insertError) throw insertError;

        if (newData) {
          setInvoiceSettings({
            id: newData.id,
            ...defaultSettings
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les paramètres de facture: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentPage(prev => ({ ...prev, [name]: value }));
  };

  const handleInvoiceSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (page: CMSPage) => {
    setCurrentPage(page);
  };

  const handleSave = async (closeDialog: () => void) => {
    try {
      if (!currentPage.title || !currentPage.slug || !currentPage.content) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('cms_pages')
        .update({
          title: currentPage.title,
          content: currentPage.content
        })
        .eq('id', currentPage.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La page a été mise à jour avec succès",
      });

      fetchCMSPages();
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder la page: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const saveInvoiceSettings = async () => {
    try {
      const { error } = await supabase
        .from('cms_pages')
        .update({
          content: JSON.stringify({
            header_text: invoiceSettings.header_text,
            footer_text: invoiceSettings.footer_text,
            company_name: invoiceSettings.company_name,
            company_address: invoiceSettings.company_address,
            company_phone: invoiceSettings.company_phone,
            company_email: invoiceSettings.company_email,
            tax_id: invoiceSettings.tax_id,
            logo_url: invoiceSettings.logo_url,
            signature_url: invoiceSettings.signature_url
          })
        })
        .eq('id', invoiceSettings.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Les paramètres de facture ont été mis à jour avec succès",
      });

      setIsInvoiceDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder les paramètres: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (type === 'logo') {
        setInvoiceSettings(prev => ({ ...prev, logo_url: data.publicUrl }));
      } else {
        setInvoiceSettings(prev => ({ ...prev, signature_url: data.publicUrl }));
      }

      toast({
        title: "Fichier téléchargé",
        description: "L'image a été téléchargée avec succès",
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Échec du téléchargement: ${error.message}`,
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
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion du contenu</h1>
          
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Retour au dashboard
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pages">Pages CMS</TabsTrigger>
            <TabsTrigger value="invoice">Paramètres de facture</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pages">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableCaption>Pages CMS du site</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Chargement...</TableCell>
                    </TableRow>
                  ) : pages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Aucune page trouvée</TableCell>
                    </TableRow>
                  ) : (
                    pages.filter(page => page.slug !== 'invoice_settings').map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.title}</TableCell>
                        <TableCell>{page.slug}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleOpenDialog(page)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Modifier la page</DialogTitle>
                                  <DialogDescription>
                                    Modifiez le contenu de la page {currentPage.title}.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="title">Titre</Label>
                                    <Input
                                      id="title"
                                      name="title"
                                      value={currentPage.title}
                                      onChange={handleInputChange}
                                    />
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug URL (non modifiable)</Label>
                                    <Input
                                      id="slug"
                                      name="slug"
                                      value={currentPage.slug}
                                      readOnly
                                      disabled
                                    />
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor="content">Contenu (supporte le HTML)</Label>
                                    <Textarea
                                      id="content"
                                      name="content"
                                      value={currentPage.content}
                                      onChange={handleInputChange}
                                      className="min-h-[300px]"
                                    />
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
                              onClick={() => window.open(`/${page.slug}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="invoice">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Paramètres de facture</h2>
                <Button 
                  className="bg-sonoff-blue hover:bg-sonoff-teal"
                  onClick={() => setIsInvoiceDialogOpen(true)}
                >
                  <FileText className="mr-2 h-4 w-4" /> 
                  Modifier les paramètres
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Informations société</h3>
                    <p><span className="font-medium">Nom:</span> {invoiceSettings.company_name}</p>
                    <p><span className="font-medium">Adresse:</span> {invoiceSettings.company_address}</p>
                    <p><span className="font-medium">Téléphone:</span> {invoiceSettings.company_phone}</p>
                    <p><span className="font-medium">Email:</span> {invoiceSettings.company_email}</p>
                    <p><span className="font-medium">Identifiant fiscal:</span> {invoiceSettings.tax_id || 'Non spécifié'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Entête et pied de page</h3>
                    <p><span className="font-medium">Texte d'entête:</span> {invoiceSettings.header_text}</p>
                    <p><span className="font-medium">Texte de pied de page:</span> {invoiceSettings.footer_text}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Images</h3>
                    <div className="flex space-x-4">
                      {invoiceSettings.logo_url && (
                        <div>
                          <p className="font-medium mb-1">Logo:</p>
                          <img 
                            src={invoiceSettings.logo_url} 
                            alt="Logo" 
                            className="h-16 object-contain border rounded p-1"
                          />
                        </div>
                      )}
                      
                      {invoiceSettings.signature_url && (
                        <div>
                          <p className="font-medium mb-1">Signature:</p>
                          <img 
                            src={invoiceSettings.signature_url} 
                            alt="Signature" 
                            className="h-16 object-contain border rounded p-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog pour modifier les paramètres de facture */}
        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Modifier les paramètres de facture</DialogTitle>
              <DialogDescription>
                Personnalisez l'apparence et les informations de vos factures
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="info">Informations société</TabsTrigger>
                  <TabsTrigger value="text">Textes</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="company_name">Nom de la société</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={invoiceSettings.company_name}
                      onChange={handleInvoiceSettingChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company_address">Adresse</Label>
                    <Textarea
                      id="company_address"
                      name="company_address"
                      value={invoiceSettings.company_address}
                      onChange={handleInvoiceSettingChange}
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_phone">Téléphone</Label>
                      <Input
                        id="company_phone"
                        name="company_phone"
                        value={invoiceSettings.company_phone}
                        onChange={handleInvoiceSettingChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company_email">Email</Label>
                      <Input
                        id="company_email"
                        name="company_email"
                        value={invoiceSettings.company_email}
                        onChange={handleInvoiceSettingChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="tax_id">Identifiant fiscal / Matricule fiscal</Label>
                    <Input
                      id="tax_id"
                      name="tax_id"
                      value={invoiceSettings.tax_id}
                      onChange={handleInvoiceSettingChange}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="header_text">Texte d'entête</Label>
                    <Input
                      id="header_text"
                      name="header_text"
                      value={invoiceSettings.header_text}
                      onChange={handleInvoiceSettingChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="footer_text">Texte de pied de page</Label>
                    <Textarea
                      id="footer_text"
                      name="footer_text"
                      value={invoiceSettings.footer_text}
                      onChange={handleInvoiceSettingChange}
                      rows={3}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="images" className="space-y-6 mt-4">
                  <div>
                    <Label htmlFor="logo_upload">Logo de la société</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      {invoiceSettings.logo_url && (
                        <img 
                          src={invoiceSettings.logo_url} 
                          alt="Logo" 
                          className="h-16 object-contain border rounded p-1"
                        />
                      )}
                      <Input
                        id="logo_upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="signature_upload">Image de signature</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      {invoiceSettings.signature_url && (
                        <img 
                          src={invoiceSettings.signature_url} 
                          alt="Signature" 
                          className="h-16 object-contain border rounded p-1"
                        />
                      )}
                      <Input
                        id="signature_upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'signature')}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                Annuler
              </Button>
              <Button className="bg-sonoff-blue hover:bg-sonoff-teal" onClick={saveInvoiceSettings}>
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CMSManagement;
