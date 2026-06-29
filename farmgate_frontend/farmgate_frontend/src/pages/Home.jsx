import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FarmerHome from './FarmerHome';
import { productsAPI } from '../api';
import ProductCard from '../components/ProductCard';
import { Truck, ShieldCheck, Leaf, IndianRupee, Search, Gift, MapPin } from 'lucide-react';
import { carouselImages } from '../assets/carouselImages';

const HERO_CAROUSEL_IMAGES = carouselImages;

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState('Enter your pincode to see which farmers deliver to you.');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const navigate = useNavigate();

  // If the logged in user is a farmer, render the dedicated FarmerHome component
  if (!authLoading && user && user.role === 'farmer') return <FarmerHome />;

  useEffect(() => {
    productsAPI.list().then(res => setFeatured(res.data.slice(0, 3))).catch(() => {});
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    if (!stored.length) return;
    Promise.all(stored.slice(0, 4).map(id => productsAPI.detail(id).then(res => res.data).catch(() => null)))
      .then(items => setRecentlyViewed(items.filter(Boolean)));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCarouselIndex(prevIndex => (prevIndex + 1) % HERO_CAROUSEL_IMAGES.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [HERO_CAROUSEL_IMAGES.length]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchText.trim();
    navigate(`/products${trimmed ? `?search=${encodeURIComponent(trimmed)}` : ''}`);
  };

  const handlePincodeSubmit = (event) => {
    event.preventDefault();
    if (/^[1-9][0-9]{5}$/.test(pincode)) {
      setPincodeMessage(`Great news! Farmers near ${pincode} deliver fresh mangoes to your doorstep.`);
    } else {
      setPincodeMessage('Enter a valid 6-digit pincode to check delivery.');
    }
  };

  return (
    <div>
      {/* Hero */}
      <section
        className="hero"
        style={{
          backgroundImage: `url(${HERO_CAROUSEL_IMAGES[carouselIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="hero-badge">· No Middlemen · Direct from Farm</div>
        <h1 className="hero-title display-font">
          Fresh Mangoes,<br />Straight from the<br />Farmer's Hand
        </h1>
        <p className="hero-subtitle">
          Buy directly from farmers across India. No brokers, no commissions — just pure, fresh mangoes at honest prices.
        </p>

        <div className="hero-actions">
          <Link to="/products" className="btn btn-amber" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
            Shop Fresh Mangoes 🥭
          </Link>
          <Link to="/register?role=farmer" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.8rem 2rem', borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
            Sell Your Mangoes
          </Link>
        </div>

        <form className="hero-search" onSubmit={handleSearchSubmit}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              className="form-control"
              type="search"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search mango varieties or farmers..."
              style={{ paddingLeft: '3rem', minHeight: '54px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary hero-action-full" style={{ minWidth: '170px' }}>
            Search
          </button>
        </form>
      </section>

      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 className="page-title">How it works</h2>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>Browse, order, and receive mangoes fresh from the farm.</p>
          </div>
          <div className="grid grid-3" style={{ gap: '1.5rem' }}>
            {[
              {
                title: 'Browse the best mangoes',
                desc: 'Explore premium varieties from local growers and choose the freshest harvest.',
                icon: <Truck size={28} color="#2d6a4f" />,
              },
              {
                title: 'Order directly',
                desc: 'Place your order in a few taps and support farmers with fair prices.',
                icon: <IndianRupee size={28} color="#2d6a4f" />,
              },
              {
                title: 'Delivered fresh',
                desc: 'Your mangoes arrive quickly, carefully packed, and ready to enjoy.',
                icon: <Leaf size={28} color="#2d6a4f" />,
              },
            ].map(step => (
              <div key={step.title} className="card" style={{ padding: '2rem', textAlign: 'left', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.3rem' }}>
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '16px', background: '#d8f3dc', display: 'grid', placeItems: 'center' }}>{step.icon}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{step.title}</div>
                </div>
                <p style={{ color: '#4b5563', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section style={{ background: 'white', padding: '2rem 0', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: <IndianRupee size={28} color="#2d6a4f" />, title: 'Fair Prices', desc: 'No broker commissions' },
              { icon: <Leaf size={28} color="#2d6a4f" />, title: 'Farm Fresh', desc: 'Directly from orchards' },
              { icon: <Truck size={28} color="#2d6a4f" />, title: 'Fast Delivery', desc: 'Delivered to your door' },
              { icon: <ShieldCheck size={28} color="#2d6a4f" />, title: 'Verified Farmers', desc: 'Trusted and certified' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#d8f3dc', padding: '0.8rem', borderRadius: '12px' }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <h2 className="page-title">Featured Mangoes</h2>
              <p className="page-subtitle" style={{ marginBottom: 0 }}>Handpicked, freshest stock this season</p>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="grid grid-3">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="section recently-viewed">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div>
                <h2 className="page-title">Recently Viewed</h2>
                <p className="page-subtitle" style={{ marginBottom: 0 }}>Keep exploring the mangoes you checked out last.</p>
              </div>
              <Link to="/products" className="btn btn-secondary btn-sm">Browse more</Link>
            </div>
            <div className="grid grid-3">
              {recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section promo-block" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="hero-banner" style={{ gap: '1.5rem' }}>
            <div className="banner-card">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <Gift size={24} />
                <div>
                  <strong>First order discount</strong>
                  <div>Get ₹50 off your first order with code <strong>FRESH50</strong>.</div>
                </div>
              </div>
              <p style={{ margin: 0, color: '#334155' }}>
                Fresh mangoes at a sweeter price — just for your first purchase.
              </p>
            </div>

            <div className="banner-card">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <MapPin size={24} />
                <div>
                  <strong>Delivery pincode checker</strong>
                  <div>Enter your pincode to see which farmers deliver to you.</div>
                </div>
              </div>
              <form onSubmit={handlePincodeSubmit} className="promo-form">
                <input
                  className="form-control"
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-digit pincode"
                  style={{ minHeight: '48px' }}
                />
                <button type="submit" className="btn btn-secondary promo-form-button">
                  Check
                </button>
              </form>
              <p className="pincode-note" style={{ color: '#334155' }}>{pincodeMessage}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Farmer CTA */}
      <section style={{ background: 'linear-gradient(135deg, #2d6a4f, #1b4332)', padding: '4rem 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 className="display-font" style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Are you a Mango Farmer?</h2>
          <p style={{ opacity: 0.85, maxWidth: 500, margin: '0 auto 2rem', fontSize: '1.05rem' }}>
            Stop losing money to middlemen. List your mangoes on Farm 2 Door and sell directly to customers across India at your own price.
          </p>
          <Link to="/register?role=farmer" className="btn btn-amber" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem' }}>
            Start Selling Free →
          </Link>
        </div>
      </section>
    </div>
  );
}
