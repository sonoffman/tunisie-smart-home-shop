
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import VerifyProduct from "./pages/VerifyProduct";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CMSPage from "./pages/CMSPage";
import Profile from "./pages/Profile";
import CheckoutPage from "./pages/CheckoutPage";
import CartPage from "./pages/CartPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import BlogManagement from "./pages/admin/BlogManagement";
import CMSManagement from "./pages/admin/CMSManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import SerialNumberManagement from "./pages/admin/SerialNumberManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import InvoiceManagement from "./pages/admin/InvoiceManagement"; 
import InvoiceGenerator from "./pages/admin/InvoiceGenerator";
import SalesManagement from "./pages/admin/SalesManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/verify-product" element={<VerifyProduct />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<CartPage />} />
              
              {/* CMS Pages */}
              <Route path="/:slug" element={<CMSPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/blog" element={<BlogManagement />} />
              <Route path="/admin/cms" element={<CMSManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/serial-numbers" element={<SerialNumberManagement />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/invoices" element={<InvoiceManagement />} />
              <Route path="/admin/invoices/:orderId" element={<InvoiceGenerator />} />
              <Route path="/admin/sales" element={<SalesManagement />} />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
