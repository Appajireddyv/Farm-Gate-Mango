import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleFooterAnchorClick(event) {
  event.preventDefault();
  scrollToTop();
}

function FooterLink({ to, children, ...props }) {
  return (
    <Link to={to} onClick={scrollToTop} {...props}>
      {children}
    </Link>
  );
}

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const isFarmer = user?.role === 'farmer';

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-brand">
            <FooterLink to="/" className="footer-logo-link display-font">
              <img src={logo} alt="" className="footer-logo" aria-hidden="true" />
              Farm <span className="brand-highlight">2</span> Door
            </FooterLink>
            <p className="footer-tagline">
              Fresh mangoes straight from Indian farms to your doorstep — no middlemen, honest prices.
            </p>
            <div className="footer-social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon size={18} />
              </a>
            </div>
          </div>

          {!isFarmer && (
            <div className="footer-col">
              <h3 className="footer-heading">Shop</h3>
              <ul className="footer-links">
                <li><FooterLink to="/products">All Mangoes</FooterLink></li>
                <li><FooterLink to="/products?category=alphonso">Alphonso</FooterLink></li>
                <li><FooterLink to="/products?category=kesar">Kesar</FooterLink></li>
                <li><FooterLink to="/products?category=dasheri">Dasheri</FooterLink></li>
              </ul>
            </div>
          )}

          <div className="footer-col">
            <h3 className="footer-heading">Account</h3>
            <ul className="footer-links">
              {!user && (
                <>
                  <li><FooterLink to="/login">Login</FooterLink></li>
                  <li><FooterLink to="/register">Create Account</FooterLink></li>
                </>
              )}
              {user && user.role === 'customer' && (
                <>
                  <li><FooterLink to="/cart">My Cart</FooterLink></li>
                  <li><FooterLink to="/orders">My Orders</FooterLink></li>
                  <li><FooterLink to="/profile">Profile</FooterLink></li>
                </>
              )}
              {user && user.role === 'farmer' && (
                <>
                  <li><FooterLink to="/farmer/dashboard">Dashboard</FooterLink></li>
                  <li><FooterLink to="/farmer/products">My Products</FooterLink></li>
                  <li><FooterLink to="/profile">Profile</FooterLink></li>
                </>
              )}
              {!isFarmer && <li><FooterLink to="/register?role=farmer">Sell as Farmer</FooterLink></li>}
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
                <a href="tel:+917483324384">+91 7483324384</a>
              </li>
              <li>
                <MapPin size={16} aria-hidden="true" />
                <span>Srinivaspur, Karnataka, India</span>
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
            <a href="#privacy" onClick={handleFooterAnchorClick}>Privacy</a>
            <span className="footer-dot" aria-hidden="true">·</span>
            <a href="#terms" onClick={handleFooterAnchorClick}>Terms</a>
            <span className="footer-dot" aria-hidden="true">·</span>
            <span>Made with care for Indian farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
