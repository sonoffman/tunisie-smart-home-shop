import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import AllProducts from '@/pages/AllProducts';
import ProductDetail from '@/pages/ProductDetail';
import CategoryPage from '@/pages/CategoryPage';
import TrainingPage from '@/pages/TrainingPage';
import VerifyProduct from '@/pages/VerifyProduct';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ProductManagement from '@/pages/admin/ProductManagement';
import CategoryManagement from '@/pages/admin/CategoryManagement';
import OrderManagement from '@/pages/admin/OrderManagement';
import SalesManagement from '@/pages/admin/SalesManagement';
import InvoiceManagement from '@/pages/admin/InvoiceManagement';
import InvoiceDetail from '@/pages/admin/InvoiceDetail';
import InvoiceGenerator from '@/pages/admin/InvoiceGenerator';
import BlogManagement from '@/pages/admin/BlogManagement';
import CMSManagement from '@/pages/admin/CMSManagement';
import UserManagement from '@/pages/admin/UserManagement';
import TrainingManagement from '@/pages/admin/TrainingManagement';
import ContactSubmissions from '@/pages/admin/ContactSubmissions';
import SerialNumberManagement from '@/pages/admin/SerialNumberManagement';
import TestComponents from '@/pages/admin/TestComponents';
import BannerManagement from '@/pages/admin/BannerManagement';
import DebugPage from '@/pages/admin/DebugPage';
import Blog from '@/pages/Blog';
import About from '@/pages/About';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Shipping from '@/pages/Shipping';
import CheckoutPage from '@/pages/CheckoutPage';
import CartPage from '@/pages/CartPage';
import SearchResults from '@/pages/SearchResults';
import CMSPage from '@/pages/CMSPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/products" element={<AllProducts />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/produit/:slug" element={<ProductDetail />} />
      <Route path="/training" element={<TrainingPage />} />
      <Route path="/verification" element={<VerifyProduct />} />
      <Route path="/verify-product" element={<VerifyProduct />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/shipping" element={<Shipping />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/cms/:slug" element={<CMSPage />} />
      <Route path="/profile" element={<Profile />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<ProductManagement />} />
      <Route path="/admin/categories" element={<CategoryManagement />} />
      <Route path="/admin/orders" element={<OrderManagement />} />
      <Route path="/admin/sales" element={<SalesManagement />} />
      <Route path="/admin/invoices" element={<InvoiceManagement />} />
      <Route path="/admin/invoices/:id" element={<InvoiceDetail />} />
      <Route path="/admin/invoice-generator" element={<InvoiceGenerator />} />
      <Route path="/admin/blog" element={<BlogManagement />} />
      <Route path="/admin/cms" element={<CMSManagement />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/training" element={<TrainingManagement />} />
      <Route path="/admin/contact" element={<ContactSubmissions />} />
      <Route path="/admin/serial-numbers" element={<SerialNumberManagement />} />
      <Route path="/admin/banners" element={<BannerManagement />} />
      <Route path="/admin/debug" element={<DebugPage />} />
      <Route path="/admin/test-components" element={<TestComponents />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
