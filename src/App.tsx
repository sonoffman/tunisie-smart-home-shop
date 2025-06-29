
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CategoryPage from "./pages/CategoryPage";
import SearchResults from "./pages/SearchResults";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import TrainingPage from "./pages/TrainingPage";
import VerifyProduct from "./pages/VerifyProduct";
import Profile from "./pages/Profile";
import CMSPage from "./pages/CMSPage";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
import BlogManagement from "./pages/admin/BlogManagement";
import CMSManagement from "./pages/admin/CMSManagement";
import BannerManagement from "./pages/admin/BannerManagement";
import ContactSubmissions from "./pages/admin/ContactSubmissions";
import InvoiceGenerator from "./pages/admin/InvoiceGenerator";
import InvoiceManagement from "./pages/admin/InvoiceManagement";
import InvoiceDetail from "./pages/admin/InvoiceDetail";
import SalesManagement from "./pages/admin/SalesManagement";
import SerialNumberManagement from "./pages/admin/SerialNumberManagement";
import TrainingManagement from "./pages/admin/TrainingManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/produit/:slug" element={<ProductDetail />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/panier" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/categorie/:slug" element={<CategoryPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/formation" element={<TrainingPage />} />
              <Route path="/verifier-produit" element={<VerifyProduct />} />
              <Route path="/verify-product" element={<VerifyProduct />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/page/:slug" element={<CMSPage />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/blog" element={<BlogManagement />} />
              <Route path="/admin/cms" element={<CMSManagement />} />
              <Route path="/admin/banners" element={<BannerManagement />} />
              <Route path="/admin/contact-submissions" element={<ContactSubmissions />} />
              <Route path="/admin/invoices" element={<InvoiceManagement />} />
              <Route path="/admin/invoices/new" element={<InvoiceGenerator />} />
              <Route path="/admin/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/admin/sales" element={<SalesManagement />} />
              <Route path="/admin/serial-numbers" element={<SerialNumberManagement />} />
              <Route path="/admin/training" element={<TrainingManagement />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
