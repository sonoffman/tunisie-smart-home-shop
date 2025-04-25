import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  FileText, 
  BookText, 
  Shield, 
  Tag 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    }
  }, [user, isAdmin, navigate, toast]);

  if (!user || !isAdmin) {
    return null;
  }

  const adminFeatures = [
    {
      title: "Gestion des commandes",
      description: "Voir et gérer les commandes des clients",
      icon: ShoppingCart,
      route: "/admin/orders"
    },
    {
      title: "Gestion des catégories",
      description: "Gérer les catégories de produits",
      icon: Tag,
      route: "/admin/categories"
    },
    {
      title: "Gestion des utilisateurs",
      description: "Gérer les comptes utilisateurs et leurs rôles",
      icon: Users,
      route: "/admin/users"
    },
    {
      title: "Blog",
      description: "Gérer les articles du blog",
      icon: BookText,
      route: "/admin/blog"
    },
    {
      title: "Pages CMS",
      description: "Gérer les pages de contenu du site",
      icon: FileText,
      route: "/admin/cms"
    },
    {
      title: "Numéros de série",
      description: "Gérer les numéros de série des produits",
      icon: Shield,
      route: "/admin/serial-numbers"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-sonoff-blue">Administration</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <feature.icon className="h-6 w-6 text-sonoff-blue" />
              </CardHeader>
              <CardDescription className="px-6">
                {feature.description}
              </CardDescription>
              <CardContent className="pt-4">
                <Button 
                  className="w-full" 
                  onClick={() => navigate(feature.route)}
                >
                  Accéder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
