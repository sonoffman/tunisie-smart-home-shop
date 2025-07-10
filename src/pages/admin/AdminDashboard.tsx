import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, FileText, Users, ShoppingCart, Package, ListChecks, ImageIcon, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
            <p>Vous devez être connecté en tant qu'administrateur pour accéder à cette page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-sonoff-blue mb-6">Tableau de Bord Admin</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-sonoff-blue" />
                Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les comptes utilisateurs</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5 text-sonoff-blue" />
                Commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Suivre et gérer les commandes</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-sonoff-blue" />
                Produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Ajouter, modifier et supprimer des produits</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-sonoff-blue" />
                Factures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Générer et gérer les factures</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/products')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-sonoff-blue" />
                Gestion des Produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les produits, les prix et le stock</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/categories')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="h-5 w-5 text-sonoff-blue" />
                Gestion des Catégories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les catégories de produits</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/orders')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5 text-sonoff-blue" />
                Gestion des Commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Suivre et gérer les commandes des clients</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/sales')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart className="h-5 w-5 text-sonoff-blue" />
                Analyse des Ventes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Visualiser les données de vente et les tendances</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/invoices')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-sonoff-blue" />
                Gestion des Factures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les factures et les paiements</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/blog')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-sonoff-blue" />
                Gestion du Blog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les articles de blog</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/cms')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-sonoff-blue" />
                Gestion du CMS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les pages CMS</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/users')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-sonoff-blue" />
                Gestion des Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les utilisateurs</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/training')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-sonoff-blue" />
                Gestion des Demandes de Formation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les demandes de formation</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/contact')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-sonoff-blue" />
                Gestion des Soumissions de Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les soumissions de contact</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/serial-numbers')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-sonoff-blue" />
                Gestion des Numéros de Série
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les numéros de série</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/banners')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-sonoff-blue" />
                Gestion des Bannières
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gérer les bannières du site</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/debug')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-sonoff-blue" />
                Debug & Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Tests de diagnostic et debug</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
