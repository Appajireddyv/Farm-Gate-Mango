import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Leaf, MapPin, Star, Minus, Plus, ShoppingCart, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.detail(id).then(res => { setProduct(res.data); setQty(res.data.min_order_qty || 1); }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    addToCart(product, qty);
    toast.success(`${qty} ${product.unit} of ${product.name} added to cart! 🥭`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      await productsAPI.addReview(id, reviewForm);
      toast.success('Review submitted!');
      const res = await productsAPI.detail(id);
      setProduct(res.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;
  if (!product) return <div className="container section"><p>Product not found.</p></div>;

  return (
    <div className="container section">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Shop</Link> / {product.name}
      </div>

      <div className="product-detail-grid">
        {/* Image */}
        <div>
          <div className="product-image-card" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem', overflow: 'hidden' }}>
            {product.image
              ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '🥭'
            }
          </div>
        </div>

        {/* Details */}
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
            {product.is_organic && <span className="badge badge-green"><Leaf size={10} /> Organic</span>}
            <span className="badge badge-amber">{product.category}</span>
            {product.stock > 0 ? <span className="badge" style={{ background: '#d1fae5', color: '#065f46' }}>In Stock</span> : <span className="badge badge-red">Out of Stock</span>}
          </div>
          <h1 className="display-font" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
            <MapPin size={14} />
            <span>by <strong style={{ color: '#2d6a4f' }}>{product.farmer_name}</strong> · {product.farmer_village}</span>
          </div>

          {product.avg_rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="stars" style={{ fontSize: '1.1rem' }}>{'★'.repeat(Math.round(product.avg_rating))}</span>
              <span style={{ fontWeight: 600 }}>{product.avg_rating}</span>
              <span style={{ color: '#6b7280' }}>({product.reviews.length} reviews)</span>
            </div>
          )}

          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2d6a4f', marginBottom: '0.3rem' }}>₹{product.price_per_unit}</div>
          <div style={{ color: '#6b7280', marginBottom: '1.5rem' }}>per {product.unit} · Min order: {product.min_order_qty} {product.unit}</div>

          <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: '1.5rem' }}>{product.description}</p>

          {product.harvest_date && (
            <div style={{ background: '#f0fdf4', padding: '0.8rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#166534' }}>
              <Package size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
              Harvested: {new Date(product.harvest_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}

          {/* Qty picker */}
          {product.stock > 0 && (
            <div className="product-detail-actions" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e5e7eb', borderRadius: '50px', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(product.min_order_qty, q - 1))} style={{ padding: '0.6rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}><Minus size={16} /></button>
                <span style={{ padding: '0 1rem', fontWeight: 700, fontSize: '1.1rem' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ padding: '0.6rem 1rem', border: 'none', background: 'none', cursor: 'pointer' }}><Plus size={16} /></button>
              </div>
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{product.unit} · ₹{(qty * parseFloat(product.price_per_unit)).toFixed(0)} total</span>
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} onClick={handleAddToCart} disabled={product.stock === 0}>
            <ShoppingCart size={18} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div style={{ marginTop: '3rem' }}>
        <h3 className="display-font" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Customer Reviews</h3>
        {user && user.role === 'customer' && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-body">
              <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
              <form onSubmit={handleReview}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewForm({...reviewForm, rating: s})}
                        style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', opacity: s <= reviewForm.rating ? 1 : 0.3 }}>★</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea className="form-control" rows={3} value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="Share your experience..." required />
                </div>
                <button className="btn btn-primary btn-sm" disabled={submittingReview}>Submit Review</button>
              </form>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {product.reviews.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">⭐</div><p>No reviews yet. Be the first!</p></div>
          ) : product.reviews.map(r => (
            <div key={r.id} style={{ background: 'white', padding: '1.2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>{r.customer_name}</strong>
                <span className="stars">{'★'.repeat(r.rating)}</span>
              </div>
              <p style={{ color: '#374151', fontSize: '0.95rem' }}>{r.comment}</p>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
