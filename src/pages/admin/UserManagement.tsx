
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Shield, ShieldOff } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  role: 'admin' | 'customer';
  created_at: string;
}

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

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
      fetchProfiles();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfiles(data as Profile[]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les utilisateurs: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (profile: Profile, newRole: 'admin' | 'customer') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Le rôle de ${profile.email} a été modifié en ${newRole === 'admin' ? 'Administrateur' : 'Client'}.`,
      });

      // Refresh profiles
      fetchProfiles();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de modifier le rôle: ${error.message}`,
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
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des utilisateurs</h1>
          <Button onClick={() => navigate('/admin')}>
            Retour au dashboard
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>Liste des utilisateurs enregistrés</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Aucun utilisateur trouvé</TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{profile.full_name || '-'}</TableCell>
                    <TableCell>{profile.phone_number || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${profile.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {profile.role === 'admin' ? 'Administrateur' : 'Client'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(profile.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedUser(profile)}
                          >
                            {profile.role === 'admin' ? (
                              <ShieldOff className="mr-2 h-4 w-4" />
                            ) : (
                              <Shield className="mr-2 h-4 w-4" />
                            )}
                            {profile.role === 'admin' ? 'Retirer admin' : 'Faire admin'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmer le changement de rôle</DialogTitle>
                            <DialogDescription>
                              {selectedUser && selectedUser.role === 'admin'
                                ? `Êtes-vous sûr de vouloir retirer les droits d'administrateur à ${selectedUser.email}?`
                                : `Êtes-vous sûr de vouloir attribuer les droits d'administrateur à ${selectedUser?.email}?`}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-4 mt-4">
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button 
                                onClick={() => selectedUser && handleRoleChange(
                                  selectedUser, 
                                  selectedUser.role === 'admin' ? 'customer' : 'admin'
                                )}
                              >
                                Confirmer
                              </Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
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

export default UserManagement;
