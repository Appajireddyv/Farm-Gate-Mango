import { Link } from 'react-router-dom';
import { Leaf, Star, MapPin } from 'lucide-react';
import { resolveMediaUrl } from '../api';

export default function ProductCard({ product }) {
  const emoji = { alphonso: '🥭', kesar: '🍊', dasheri: '🥭', langra: '🥭', totapuri: '🍋', other: '🥭' };
  const imageUrl = resolveMediaUrl(product.image);
  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="product-card">
        <div className="product-card-img">
          {imageUrl
            ? <img src={imageUrl} alt={product.name} loading="lazy" />
            : <span>{emoji[product.category] || '🥭'}</span>
          }
        </div>
        <div className="product-card-body">
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {product.is_organic && <span className="badge badge-green"><Leaf size={10} /> Organic</span>}
            <span className="badge badge-amber">{product.category}</span>
          </div>
          <div className="product-card-title">{product.name}</div>
          <div className="product-card-farmer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={12} /> {product.farmer_name} · {product.farmer_village || 'Farm Fresh'}
          </div>
          {product.avg_rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <span className="stars">{'★'.repeat(Math.round(product.avg_rating))}</span>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>({product.avg_rating})</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <div>
              <span className="product-card-price">₹{product.price_per_unit}</span>
              <span className="product-card-unit"> / {product.unit}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: product.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
              {product.stock > 0 ? `${product.stock} ${product.unit} left` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
