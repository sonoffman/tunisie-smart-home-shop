
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  ShoppingCart,
  Users,
  Image,
  FileText,
  BarChart,
  Layers,
  BookOpen,
  QrCode,
  GraduationCap,
  MessageSquare,
  Tags,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (user === null) {
    navigate('/');
    return null;
  }

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const menuItems = [
    {
      title: 'Produits',
      description: 'Gérer les produits du magasin',
      icon: <Package className="h-6 w-6" />,
      href: '/admin/products',
    },
    {
      title: 'Catégories',
      description: 'Organiser les produits par catégories',
      icon: <Tags className="h-6 w-6" />,
      href: '/admin/categories',
    },
    {
      title: 'Commandes',
      description: 'Suivre et gérer les commandes',
      icon: <ShoppingCart className="h-6 w-6" />,
      href: '/admin/orders',
    },
    {
      title: 'Ventes',
      description: 'Analyser et gérer les ventes',
      icon: <BarChart className="h-6 w-6" />,
      href: '/admin/sales',
    },
    {
      title: 'Utilisateurs',
      description: 'Gérer les comptes utilisateur',
      icon: <Users className="h-6 w-6" />,
      href: '/admin/users',
    },
    {
      title: 'Bannières',
      description: 'Personnaliser les bannières du site',
      icon: <Image className="h-6 w-6" />,
      href: '/admin/banners',
    },
    {
      title: 'Blog',
      description: 'Gérer les articles du blog',
      icon: <BookOpen className="h-6 w-6" />,
      href: '/admin/blog',
    },
    {
      title: 'Pages CMS',
      description: 'Gérer les pages de contenu',
      icon: <Layers className="h-6 w-6" />,
      href: '/admin/cms',
    },
    {
      title: 'Numéros de série',
      description: 'Gérer les numéros de série des produits',
      icon: <QrCode className="h-6 w-6" />,
      href: '/admin/serial-numbers',
    },
    {
      title: 'Formation',
      description: 'Gérer les demandes de formation',
      icon: <GraduationCap className="h-6 w-6" />,
      href: '/admin/training',
    },
    {
      title: 'Factures',
      description: 'Générer et gérer les factures',
      icon: <FileText className="h-6 w-6" />,
      href: '/admin/invoices',
    },
    {
      title: 'Formulaires de contact',
      description: 'Gérer les demandes de contact',
      icon: <MessageSquare className="h-6 w-6" />,
      href: '/admin/contact-submissions',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-sonoff-blue">Panneau d'administration</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="bg-sonoff-blue p-2 rounded-md text-white">
                    {item.icon}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={item.href}>Accéder</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
