
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RouteAudit = () => {
  const publicRoutes = [
    { path: '/', label: 'Accueil' },
    { path: '/products', label: 'Tous les produits' },
    { path: '/cart', label: 'Panier' },
    { path: '/checkout', label: 'Commande' },
    { path: '/blog', label: 'Blog' },
    { path: '/verify-product', label: 'Vérifier produit' },
    { path: '/training', label: 'Formation' },
    { path: '/search', label: 'Recherche' },
    { path: '/about', label: 'À propos' },
    { path: '/terms', label: 'Conditions' },
    { path: '/privacy', label: 'Confidentialité' },
    { path: '/shipping', label: 'Livraison' },
  ];

  const adminRoutes = [
    { path: '/admin', label: 'Dashboard Admin' },
    { path: '/admin/products', label: 'Produits' },
    { path: '/admin/categories', label: 'Catégories' },
    { path: '/admin/orders', label: 'Commandes' },
    { path: '/admin/users', label: 'Utilisateurs' },
    { path: '/admin/blog', label: 'Blog' },
    { path: '/admin/cms', label: 'CMS' },
    { path: '/admin/banners', label: 'Bannières' },
    { path: '/admin/invoices', label: 'Factures' },
    { path: '/admin/invoices/new', label: 'Nouvelle facture' },
    { path: '/admin/sales', label: 'Ventes' },
    { path: '/admin/serial-numbers', label: 'Numéros série' },
    { path: '/admin/training', label: 'Formation' },
    { path: '/admin/contact-submissions', label: 'Contacts' },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Audit des Routes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Routes Publiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {publicRoutes.map((route) => (
                <div key={route.path} className="flex items-center justify-between">
                  <span>{route.label}</span>
                  <Link 
                    to={route.path} 
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tester
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Routes Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adminRoutes.map((route) => (
                <div key={route.path} className="flex items-center justify-between">
                  <span>{route.label}</span>
                  <Link 
                    to={route.path} 
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tester
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RouteAudit;
