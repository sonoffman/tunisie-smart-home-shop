
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Index';
import NotFound from './pages/NotFound';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import ProfilePage from './pages/Profile';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import VerifyProduct from './pages/VerifyProduct';
import TrainingPage from './pages/TrainingPage';
import BlogPage from './pages/Blog';
import BlogPost from './pages/BlogPost';
import CMSPage from './pages/CMSPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import BannerManagement from './pages/admin/BannerManagement';
import BlogManagement from './pages/admin/BlogManagement';
import CMSManagement from './pages/admin/CMSManagement';
import SerialNumberManagement from './pages/admin/SerialNumberManagement';
import TrainingManagement from './pages/admin/TrainingManagement';
import InvoiceGenerator from './pages/admin/InvoiceGenerator';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import SalesManagement from './pages/admin/SalesManagement';
import ContactSubmissions from './pages/admin/ContactSubmissions';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from './components/ui/toaster';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/verify" element={<VerifyProduct />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/page/:slug" element={<CMSPage />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/banners" element={<BannerManagement />} />
              <Route path="/admin/blog" element={<BlogManagement />} />
              <Route path="/admin/cms" element={<CMSManagement />} />
              <Route path="/admin/serial-numbers" element={<SerialNumberManagement />} />
              <Route path="/admin/training" element={<TrainingManagement />} />
              <Route path="/admin/invoices" element={<InvoiceGenerator />} />
              <Route path="/admin/invoice/:orderId" element={<InvoiceManagement />} />
              <Route path="/admin/sales" element={<SalesManagement />} />
              <Route path="/admin/contact-submissions" element={<ContactSubmissions />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
