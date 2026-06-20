import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsAPI } from '../api';
import ProductCard from '../components/ProductCard';
import { Truck, ShieldCheck, Leaf, IndianRupee } from 'lucide-react';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    productsAPI.list().then(res => setFeatured(res.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">🌟 No Middlemen · Direct from Farm</div>
        <h1 className="hero-title display-font">
          Fresh Mangoes,<br />Straight from the<br />Farmer's Hand
        </h1>
        <p className="hero-subtitle">
          Buy directly from farmers across India. No brokers, no commissions — just pure, fresh mangoes at honest prices.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-amber" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
            Shop Fresh Mangoes 🥭
          </Link>
          <Link to="/register?role=farmer" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.8rem 2rem', borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
            Sell Your Mangoes
          </Link>
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

      {/* Farmer CTA */}
      <section style={{ background: 'linear-gradient(135deg, #2d6a4f, #1b4332)', padding: '4rem 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 className="display-font" style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Are you a Mango Farmer?</h2>
          <p style={{ opacity: 0.85, maxWidth: 500, margin: '0 auto 2rem', fontSize: '1.05rem' }}>
            Stop losing money to middlemen. List your mangoes on FarmGate and sell directly to customers across India at your own price.
          </p>
          <Link to="/register?role=farmer" className="btn btn-amber" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem' }}>
            Start Selling Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1a1a2e', color: '#9ca3af', padding: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>🥭 <strong style={{ color: 'white' }}>FarmGate</strong> — Farm to Table, No Middlemen</div>
        <div>Made with ❤️ for Indian Farmers · {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
