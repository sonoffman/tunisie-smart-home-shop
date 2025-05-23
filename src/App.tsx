
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import TrainingPage from "./pages/TrainingPage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import VerifyProduct from "./pages/VerifyProduct";
import SearchResults from "./pages/SearchResults";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CMSPage from "./pages/CMSPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import UserManagement from "./pages/admin/UserManagement";
import CMSManagement from "./pages/admin/CMSManagement";
import BlogManagement from "./pages/admin/BlogManagement";
import TrainingManagement from "./pages/admin/TrainingManagement";
import ContactSubmissions from "./pages/admin/ContactSubmissions";
import BannerManagement from "./pages/admin/BannerManagement";
import SerialNumberManagement from "./pages/admin/SerialNumberManagement";
import SalesManagement from "./pages/admin/SalesManagement";
import InvoiceManagement from "./pages/admin/InvoiceManagement";
import InvoiceGenerator from "./pages/admin/InvoiceGenerator";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/verify-product" element={<VerifyProduct />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cms/:slug" element={<CMSPage />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<ProductManagement />} />
                <Route path="/admin/orders" element={<OrderManagement />} />
                <Route path="/admin/categories" element={<CategoryManagement />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/cms" element={<CMSManagement />} />
                <Route path="/admin/blog" element={<BlogManagement />} />
                <Route path="/admin/training" element={<TrainingManagement />} />
                <Route path="/admin/contact" element={<ContactSubmissions />} />
                <Route path="/admin/banners" element={<BannerManagement />} />
                <Route path="/admin/serial-numbers" element={<SerialNumberManagement />} />
                <Route path="/admin/sales" element={<SalesManagement />} />
                <Route path="/admin/invoices" element={<InvoiceManagement />} />
                <Route path="/admin/invoice-generator" element={<InvoiceGenerator />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
