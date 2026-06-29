import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Truck, ShieldCheck, Leaf, Instagram, Facebook } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const isFarmer = user?.role === 'farmer';

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo-link display-font">
              <img src={logo} alt="" className="footer-logo" aria-hidden="true" />
              Farm <span className="brand-highlight">2</span> Door
            </Link>
            <p className="footer-tagline">
              Fresh mangoes straight from Indian farms to your doorstep — no middlemen, honest prices.
            </p>
            <div className="footer-social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Shop</h3>
            <ul className="footer-links">
              <li><Link to="/products">All Mangoes</Link></li>
              <li><Link to="/products?category=alphonso">Alphonso</Link></li>
              <li><Link to="/products?category=kesar">Kesar</Link></li>
              <li><Link to="/products?category=dasheri">Dasheri</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Account</h3>
            <ul className="footer-links">
              {!user && (
                <>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Create Account</Link></li>
                </>
              )}
              {user && user.role === 'customer' && (
                <>
                  <li><Link to="/cart">My Cart</Link></li>
                  <li><Link to="/orders">My Orders</Link></li>
                  <li><Link to="/profile">Profile</Link></li>
                </>
              )}
              {user && user.role === 'farmer' && (
                <>
                  <li><Link to="/farmer/dashboard">Dashboard</Link></li>
                  <li><Link to="/farmer/products">My Products</Link></li>
                  <li><Link to="/profile">Profile</Link></li>
                </>
              )}
              {!isFarmer && <li><Link to="/register?role=farmer">Sell as Farmer</Link></li>}
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-links footer-contact-list">
              <li>
                <Mail size={16} aria-hidden="true" />
                <a href="mailto:support@farm2door.in">support@farm2door.in</a>
              </li>
              <li>
                <Phone size={16} aria-hidden="true" />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li>
                <MapPin size={16} aria-hidden="true" />
                <span>Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-trust">
        <div className="container footer-trust-grid">
          <div className="footer-trust-item">
            <Truck size={22} aria-hidden="true" />
            <div>
              <strong>Farm-to-door delivery</strong>
              <span>Direct from growers near you</span>
            </div>
          </div>
          <div className="footer-trust-item">
            <ShieldCheck size={22} aria-hidden="true" />
            <div>
              <strong>Secure checkout</strong>
              <span>UPI, COD &amp; card payments</span>
            </div>
          </div>
          <div className="footer-trust-item">
            <Leaf size={22} aria-hidden="true" />
            <div>
              <strong>100% farm fresh</strong>
              <span>No brokers, no commissions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; {year} Farm 2 Door. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy</a>
            <span className="footer-dot" aria-hidden="true">·</span>
            <a href="#terms">Terms</a>
            <span className="footer-dot" aria-hidden="true">·</span>
            <span>Made with care for Indian farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
