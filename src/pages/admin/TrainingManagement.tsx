
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

interface TrainingRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  position: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'confirmed' | 'cancelled';
  created_at: string;
}

const TrainingManagement = () => {
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrainingRequests();
  }, []);

  const fetchTrainingRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching training requests:', error);
      toast({
        title: "Erreur",
        description: `Impossible de charger les demandes: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: 'new' | 'contacted' | 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('training_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setRequests(requests.map(request => 
        request.id === id ? { ...request, status } : request
      ));
      
      toast({
        title: "Succès",
        description: `Statut de la demande mis à jour: ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le statut: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleViewRequest = (request: TrainingRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Formations</CardTitle>
          <CardDescription>
            Gérez les demandes d'inscription aux formations sur les produits Sonoff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Chargement des demandes...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <p>Aucune demande de formation trouvée.</p>
            </div>
          ) : (
            <Table>
              <TableCaption>Liste des demandes de formation</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.full_name}</TableCell>
                    <TableCell>{request.phone}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(request.status)}>
                        {request.status === 'new' && 'Nouveau'}
                        {request.status === 'contacted' && 'Contacté'}
                        {request.status === 'confirmed' && 'Confirmé'}
                        {request.status === 'cancelled' && 'Annulé'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                          onClick={() => updateRequestStatus(request.id, 'confirmed')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                          onClick={() => updateRequestStatus(request.id, 'cancelled')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* View Request Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Détails de la demande</DialogTitle>
                <DialogDescription>
                  Informations de contact et message.
                </DialogDescription>
              </DialogHeader>
              
              {selectedRequest && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm">Nom complet</h4>
                    <p>{selectedRequest.full_name}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">Email</h4>
                    <p>{selectedRequest.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">Téléphone</h4>
                    <p>{selectedRequest.phone}</p>
                  </div>
                  
                  {selectedRequest.company && (
                    <div>
                      <h4 className="font-medium text-sm">Entreprise</h4>
                      <p>{selectedRequest.company}</p>
                    </div>
                  )}
                  
                  {selectedRequest.position && (
                    <div>
                      <h4 className="font-medium text-sm">Fonction</h4>
                      <p>{selectedRequest.position}</p>
                    </div>
                  )}
                  
                  {selectedRequest.message && (
                    <div>
                      <h4 className="font-medium text-sm">Message</h4>
                      <p className="text-sm">{selectedRequest.message}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-sm">Date de demande</h4>
                    <p>{formatDate(selectedRequest.created_at)}</p>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="outline" 
                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border-yellow-200"
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, 'contacted');
                        setViewDialogOpen(false);
                      }}
                    >
                      Marquer comme contacté
                    </Button>
                    
                    <DialogClose asChild>
                      <Button variant="outline">Fermer</Button>
                    </DialogClose>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingManagement;
