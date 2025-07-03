import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/Index';
import AllProducts from '@/pages/AllProducts';
import ProductDetail from '@/pages/ProductDetail';
import CategoryPage from '@/pages/CategoryPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import Profile from '@/pages/Profile';
import VerifyProduct from '@/pages/VerifyProduct';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import TrainingPage from '@/pages/TrainingPage';
import SearchResults from '@/pages/SearchResults';
import CMSPage from '@/pages/CMSPage';
import NotFound from '@/pages/NotFound';

// Admin routes
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ProductManagement from '@/pages/admin/ProductManagement';
import CategoryManagement from '@/pages/admin/CategoryManagement';
import OrderManagement from '@/pages/admin/OrderManagement';
import UserManagement from '@/pages/admin/UserManagement';
import BlogManagement from '@/pages/admin/BlogManagement';
import CMSManagement from '@/pages/admin/CMSManagement';
import SerialNumberManagement from '@/pages/admin/SerialNumberManagement';
import TrainingManagement from '@/pages/admin/TrainingManagement';
import SalesManagement from '@/pages/admin/SalesManagement';
import InvoiceGenerator from '@/pages/admin/InvoiceGenerator';
import InvoiceManagement from '@/pages/admin/InvoiceManagement';
import InvoiceDetail from '@/pages/admin/InvoiceDetail';
import ContactSubmissions from '@/pages/admin/ContactSubmissions';
import BannerManagement from '@/pages/admin/BannerManagement';
import RouteAudit from '@/components/admin/RouteAudit';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<AllProducts />} />
      <Route path="/produits" element={<AllProducts />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/produit/:slug" element={<ProductDetail />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/categorie/:slug" element={<CategoryPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/panier" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/verify-product" element={<VerifyProduct />} />
      <Route path="/verifier-produit" element={<VerifyProduct />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/training" element={<TrainingPage />} />
      <Route path="/formation" element={<TrainingPage />} />
      <Route path="/search" element={<SearchResults />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<ProductManagement />} />
      <Route path="/admin/categories" element={<CategoryManagement />} />
      <Route path="/admin/orders" element={<OrderManagement />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/blog" element={<BlogManagement />} />
      <Route path="/admin/cms" element={<CMSManagement />} />
      <Route path="/admin/serial-numbers" element={<SerialNumberManagement />} />
      <Route path="/admin/training" element={<TrainingManagement />} />
      <Route path="/admin/sales" element={<SalesManagement />} />
      <Route path="/admin/invoices/new" element={<InvoiceGenerator />} />
      <Route path="/admin/invoices" element={<InvoiceManagement />} />
      <Route path="/admin/invoices/:id" element={<InvoiceDetail />} />
      <Route path="/admin/contact-submissions" element={<ContactSubmissions />} />
      <Route path="/admin/banners" element={<BannerManagement />} />
      <Route path="/admin/route-audit" element={<RouteAudit />} />
      
      {/* CMS Pages */}
      <Route path="/about" element={<CMSPage />} />
      <Route path="/a-propos" element={<CMSPage />} />
      <Route path="/terms" element={<CMSPage />} />
      <Route path="/conditions" element={<CMSPage />} />
      <Route path="/privacy" element={<CMSPage />} />
      <Route path="/confidentialite" element={<CMSPage />} />
      <Route path="/shipping" element={<CMSPage />} />
      <Route path="/livraison" element={<CMSPage />} />
      
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
