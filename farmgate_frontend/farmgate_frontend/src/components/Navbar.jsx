import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const toggleMenu = () => setMenuOpen(open => !open);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand display-font">
        🥭 Farm<span>Gate Mangoes</span>
      </Link>
      <button type="button" className="menu-toggle" onClick={toggleMenu} aria-expanded={menuOpen} aria-label="Toggle navigation">
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className={`nav-links${menuOpen ? ' open' : ''}`}>
        {(!user || user.role === 'customer') && (
          <Link to="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
        )}
        {!user && <>
          <Link to="/login" className="hide-mobile" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Join Free</Link>
        </>}
        {user && user.role === 'customer' && <>
          <Link to="/cart" className="nav-icon-link" onClick={() => setMenuOpen(false)}>
            <ShoppingCart size={20} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
          <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)}><User size={18} /></Link>
          <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="btn btn-sm btn-secondary"><LogOut size={14} /> Logout</button>
        </>}
        {user && user.role === 'farmer' && <>
          <Link to="/farmer/dashboard" onClick={() => setMenuOpen(false)}><LayoutDashboard size={18} /></Link>
          <Link to="/farmer/products" onClick={() => setMenuOpen(false)}><Package size={18} /></Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)}><User size={18} /></Link>
          <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="btn btn-sm btn-secondary"><LogOut size={14} /> Logout</button>
        </>}
      </div>
    </nav>
  );
}
