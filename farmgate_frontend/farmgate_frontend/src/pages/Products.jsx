import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { productsAPI } from '../api';
import ProductCard from '../components/ProductCard';
import { Search, Filter } from 'lucide-react';

export default function Products() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(query.get('search') || '');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setSearch(query.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    productsAPI.list({ category: category || undefined })
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.farmer_name.toLowerCase().includes(search.toLowerCase()));

  const categories = [
    { value: '', label: 'All Varieties' },
    { value: 'alphonso', label: '🥭 Alphonso' },
    { value: 'kesar', label: '🍊 Kesar' },
    { value: 'dasheri', label: '🥭 Dasheri' },
    { value: 'langra', label: '🥭 Langra' },
    { value: 'totapuri', label: '🍋 Totapuri' },
    { value: 'other', label: '🥭 Other' },
  ];

  return (
    <div className="container section">
      <h1 className="page-title">Fresh Mangoes</h1>
      <p className="page-subtitle">Directly from farms across India · No middlemen</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input className="form-control" style={{ paddingLeft: '2.2rem' }} placeholder="Search mangoes or farmers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '50px', border: '2px solid', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                background: category === c.value ? '#2d6a4f' : 'white', borderColor: category === c.value ? '#2d6a4f' : '#e5e7eb',
                color: category === c.value ? 'white' : '#374151' }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="spinner" /> :
        filtered.length === 0 ?
        <div className="empty-state"><div className="empty-state-icon">🔍</div><p>No mangoes found. Try different filters.</p></div> :
        <>
          <div style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>{filtered.length} varieties available</div>
          <div className="grid grid-3">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      }
    </div>
  );
}
