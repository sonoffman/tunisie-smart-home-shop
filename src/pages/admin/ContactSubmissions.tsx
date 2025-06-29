import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Download, Eye } from 'lucide-react';
import { ContactFormSubmission } from '@/types/supabase';

const ContactSubmissions = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ContactFormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactFormSubmission | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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
      fetchSubmissions();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast the data to ContactFormSubmission[] type to fix TypeScript error
      setSubmissions(data as unknown as ContactFormSubmission[]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les soumissions: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP à HH:mm', { locale: fr });
  };

  const exportToCSV = () => {
    try {
      // Format submissions data for CSV
      const headers = ['Nom', 'Email', 'Téléphone', 'Message', 'Date'];
      const csvData = submissions.map(sub => [
        sub.full_name,
        sub.email,
        sub.phone,
        sub.message || '',
        format(new Date(sub.created_at), 'yyyy-MM-dd HH:mm:ss')
      ]);
      
      // Add headers
      csvData.unshift(headers);
      
      // Convert to CSV format
      const csvContent = csvData.map(row => 
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contact-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Succès",
        description: "Export CSV créé avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'exporter les données: ${error.message}`,
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
          <h1 className="text-3xl font-bold text-sonoff-blue">Formulaires de contact</h1>
          <div className="space-x-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={exportToCSV}
              disabled={submissions.length === 0 || loading}
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Retour au dashboard
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>Liste des demandes de contact</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Aucune demande de contact trouvée</TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{formatDate(submission.created_at)}</TableCell>
                    <TableCell className="font-medium">{submission.full_name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{submission.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Détail du message</DialogTitle>
              <DialogDescription>
                Soumis le {selectedSubmission && formatDate(selectedSubmission.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSubmission && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Nom</h4>
                  <p>{selectedSubmission.full_name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Email</h4>
                  <p>{selectedSubmission.email}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Téléphone</h4>
                  <p>{selectedSubmission.phone}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Message</h4>
                  <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <DialogClose asChild>
                    <Button variant="outline">Fermer</Button>
                  </DialogClose>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ContactSubmissions;
