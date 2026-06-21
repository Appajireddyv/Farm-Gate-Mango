import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ delivery_address: '', delivery_pincode: '', payment_method: 'cod', notes: '' });
  const [placing, setPlacing] = useState(false);

  if (cart.length === 0) return (
    <div className="container section">
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <h3 style={{ marginBottom: '0.5rem' }}>Your cart is empty</h3>
        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Add fresh mangoes from our farm!</p>
        <Link to="/products" className="btn btn-primary">Browse Mangoes 🥭</Link>
      </div>
    </div>
  );

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setPlacing(true);
    try {
      const items = cart.map(i => ({ product_id: i.product.id, quantity: i.qty }));
      const res = await ordersAPI.place({ ...form, items });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  // Check if all from same farmer
  const farmerIds = [...new Set(cart.map(i => i.product.farmer))];
  const multifarmer = farmerIds.length > 1;

  return (
    <div className="container section">
      <h1 className="page-title">Your Cart</h1>
      <p className="page-subtitle">{cart.length} item(s)</p>

      {multifarmer && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '0.8rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#92400e' }}>
          ⚠️ Items from multiple farmers detected. Please order from one farmer at a time.
        </div>
      )}

      <div className="cart-layout">
        {/* Cart items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.map(({ product, qty }) => (
            <div key={product.id} className="card">
              <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '12px', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0 }}>🥭</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{product.name}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{product.farmer_name} · ₹{product.price_per_unit}/{product.unit}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '50px' }}>
                      <button onClick={() => updateQty(product.id, qty - 1)} style={{ padding: '0.3rem 0.7rem', border: 'none', background: 'none', cursor: 'pointer' }}><Minus size={14} /></button>
                      <span style={{ padding: '0 0.6rem', fontWeight: 700 }}>{qty}</span>
                      <button onClick={() => updateQty(product.id, qty + 1)} style={{ padding: '0.3rem 0.7rem', border: 'none', background: 'none', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    <span style={{ fontWeight: 700, color: '#2d6a4f' }}>₹{(qty * parseFloat(product.price_per_unit)).toFixed(0)}</span>
                  </div>
                </div>
                <button onClick={() => removeFromCart(product.id)} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card cart-summary">
          <div className="card-body">
            <h3 style={{ marginBottom: '1.2rem', fontWeight: 700 }}>Order Summary</h3>
            {cart.map(({ product, qty }) => (
              <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                <span>{product.name} × {qty}</span>
                <span>₹{(qty * parseFloat(product.price_per_unit)).toFixed(0)}</span>
              </div>
            ))}
            <hr className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
              <span>Delivery</span><span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              <span>Total</span><span style={{ color: '#2d6a4f' }}>₹{total.toFixed(0)}</span>
            </div>
            {!multifarmer && (
              <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} onClick={() => setShowCheckout(true)}>
                <ShoppingBag size={16} /> Proceed to Checkout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="display-font" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Complete Your Order</h3>
            <form onSubmit={handleOrder}>
              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <textarea className="form-control" rows={3} value={form.delivery_address} onChange={e => setForm({...form, delivery_address: e.target.value})} placeholder="Full address, landmark..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-control" value={form.delivery_pincode} onChange={e => setForm({...form, delivery_pincode: e.target.value})} placeholder="600001" required maxLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div style={{ display: 'flex', gap: '0.7rem' }}>
                  {[['cod', '💵 Cash on Delivery'], ['upi', '📱 UPI'], ['card', '💳 Card']].map(([val, label]) => (
                    <label key={val} style={{ flex: 1, cursor: 'pointer' }}>
                      <input type="radio" value={val} checked={form.payment_method === val} onChange={() => setForm({...form, payment_method: val})} style={{ display: 'none' }} />
                      <div style={{ padding: '0.6rem', textAlign: 'center', borderRadius: '10px', border: `2px solid`, borderColor: form.payment_method === val ? '#2d6a4f' : '#e5e7eb', background: form.payment_method === val ? '#f0fdf4' : 'white', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s' }}>
                        {label}
                      </div>
                    </label>
                  ))}
                </div>
                {form.payment_method !== 'cod' && <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.5rem' }}>💡 {form.payment_method === 'upi' ? 'UPI payment link will be shared by farmer.' : 'Card payment gateway integration available.'}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Delivery instructions..." />
              </div>
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <strong>Order Total: ₹{total.toFixed(0)}</strong> · Free delivery
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCheckout(false)}>Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} disabled={placing}>{placing ? 'Placing...' : '🎉 Place Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
