import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login, { Register } from './pages/Auth';
import Cart from './pages/Cart';
import Orders, { OrderDetail } from './pages/Orders';
import FarmerDashboard from './pages/FarmerDashboard';
import AddProduct from './pages/AddProduct';
import Profile from './pages/Profile';
import FarmGateAI from './components/FarmGateAI';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
          <div className="app-layout">
          <Navbar />
          <main className="app-main">
          <ScrollToTop />
          <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', borderRadius: '12px', fontSize: '0.9rem' } }} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<ProtectedRoute role="customer"><Cart /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute role="customer"><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/farmer/dashboard" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/farmer/products" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/farmer/products/add" element={<ProtectedRoute role="farmer"><AddProduct /></ProtectedRoute>} />
            <Route path="/farmer/products/edit/:id" element={<ProtectedRoute role="farmer"><AddProduct /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
          </main>
          <Footer />
          {showBackToTop && (
            <button
              type="button"
              className="back-to-top"
              aria-label="Scroll to top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              ↑ Top
            </button>
          )}
          <FarmGateAI showBackToTop={showBackToTop} />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}
