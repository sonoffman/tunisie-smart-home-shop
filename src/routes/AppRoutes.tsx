import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import AllProducts from '@/pages/AllProducts';
import CategoryPage from '@/pages/CategoryPage';
import ProductDetail from '@/pages/ProductDetail';
import SearchResults from '@/pages/SearchResults';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import Profile from '@/pages/Profile';
import TrainingPage from '@/pages/TrainingPage';
import VerifyProduct from '@/pages/VerifyProduct';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import CMSPage from '@/pages/CMSPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ProductManagement from '@/pages/admin/ProductManagement';
import CategoryManagement from '@/pages/admin/CategoryManagement';
import OrderManagement from '@/pages/admin/OrderManagement';
import UserManagement from '@/pages/admin/UserManagement';
import BlogManagement from '@/pages/admin/BlogManagement';
import CMSManagement from '@/pages/admin/CMSManagement';
import ContactSubmissions from '@/pages/admin/ContactSubmissions';
import TrainingManagement from '@/pages/admin/TrainingManagement';
import SalesManagement from '@/pages/admin/SalesManagement';
import InvoiceManagement from '@/pages/admin/InvoiceManagement';
import InvoiceGenerator from '@/pages/admin/InvoiceGenerator';
import InvoiceDetail from '@/pages/admin/InvoiceDetail';
import SerialNumberManagement from '@/pages/admin/SerialNumberManagement';
import BannerManagement from '@/pages/admin/BannerManagement';
import NotFound from '@/pages/NotFound';
import TestComponents from '@/pages/admin/TestComponents';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/products" element={<AllProducts />} />
      <Route path="/category/:categorySlug" element={<CategoryPage />} />
      <Route path="/product/:productSlug" element={<ProductDetail />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/training" element={<TrainingPage />} />
      <Route path="/verify" element={<VerifyProduct />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/pages/:slug" element={<CMSPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<ProductManagement />} />
      <Route path="/admin/categories" element={<CategoryManagement />} />
      <Route path="/admin/orders" element={<OrderManagement />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/blog" element={<BlogManagement />} />
      <Route path="/admin/cms" element={<CMSManagement />} />
      <Route path="/admin/contact" element={<ContactSubmissions />} />
      <Route path="/admin/training" element={<TrainingManagement />} />
      <Route path="/admin/sales" element={<SalesManagement />} />
      <Route path="/admin/invoices" element={<InvoiceManagement />} />
      <Route path="/admin/invoices/new" element={<InvoiceGenerator />} />
      <Route path="/admin/invoices/:id" element={<InvoiceDetail />} />
      <Route path="/admin/serial-numbers" element={<SerialNumberManagement />} />
      <Route path="/admin/banners" element={<BannerManagement />} />
      <Route path="/admin/test" element={<TestComponents />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
