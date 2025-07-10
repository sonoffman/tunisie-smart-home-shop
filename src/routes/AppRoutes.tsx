import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Categories from '@/pages/Categories';
import CategoryDetail from '@/pages/CategoryDetail';
import Contact from '@/pages/Contact';
import TrainingRequestPage from '@/pages/TrainingRequestPage';
import Verification from '@/pages/Verification';
import Profile from '@/pages/Profile';
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
import TestComponents from '@/pages/TestComponents';
import BannerManagement from '@/pages/admin/BannerManagement';
import DebugPage from '@/pages/admin/DebugPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/categories/:slug" element={<CategoryDetail />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/training" element={<TrainingRequestPage />} />
      <Route path="/verification" element={<Verification />} />
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

      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
