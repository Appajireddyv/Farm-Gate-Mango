import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand display-font">
        🥭 Farm<span>Gate</span>
      </Link>
      <div className="nav-links">
        <Link to="/products">Shop</Link>
        {!user && <>
          <Link to="/login" className="hide-mobile">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
        </>}
        {user && user.role === 'customer' && <>
          <Link to="/cart" style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            {itemCount > 0 && <span className="cart-badge" style={{ position: 'absolute', top: -8, right: -10 }}>{itemCount}</span>}
          </Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/profile"><User size={18} /></Link>
          <button onClick={handleLogout} className="btn btn-sm btn-secondary"><LogOut size={14} /> Logout</button>
        </>}
        {user && user.role === 'farmer' && <>
          <Link to="/farmer/dashboard"><LayoutDashboard size={18} /></Link>
          <Link to="/farmer/products"><Package size={18} /></Link>
          <Link to="/profile"><User size={18} /></Link>
          <button onClick={handleLogout} className="btn btn-sm btn-secondary"><LogOut size={14} /> Logout</button>
        </>}
      </div>
    </nav>
  );
}
