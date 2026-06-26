import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI, productsAPI, resolveMediaUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingBag, IndianRupee, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending','confirmed','packed','shipped','delivered','cancelled'];

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ordersAPI.farmerOrders(), productsAPI.myProducts()])
      .then(([oRes, pRes]) => { setOrders(oRes.data); setProducts(pRes.data); })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success(`Order marked as ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;

  return (
    <div className="container section">
      <div className="dashboard-header">
        <h1 className="display-font" style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>
          🌾 Welcome, {user?.first_name || user?.username}!
        </h1>
        <p style={{ opacity: 0.85 }}>Manage your farm store from here</p>
      </div>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '2rem', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-number">{orders.length}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-number" style={{ color: '#f59e0b' }}>{pendingOrders}</div>
          <div className="stat-label">Pending Orders</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
          <div className="stat-number" style={{ color: '#8b5cf6' }}>{products.length}</div>
          <div className="stat-label">Listed Products</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-number" style={{ color: '#10b981', fontSize: '1.5rem' }}>₹{totalRevenue.toFixed(0)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          📦 Orders {pendingOrders > 0 && <span className="cart-badge">{pendingOrders}</span>}
        </button>
        <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>🥭 My Products</button>
      </div>

      {/* Orders tab */}
      {activeTab === 'orders' && (
        orders.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">📦</div><p>No orders yet. Share your store link!</p></div>
          : <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead><tr>
                  <th>Order #</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Update</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>{o.customer_name}</td>
                      <td style={{ fontSize: '0.82rem' }}>{o.items.map(i => `${i.product_name}×${i.quantity}`).join(', ')}</td>
                      <td><strong style={{ color: '#2d6a4f' }}>₹{parseFloat(o.total_amount).toFixed(0)}</strong></td>
                      <td><span className={`badge ${o.payment_status === 'paid' ? 'badge-green' : 'badge-amber'}`}>{o.payment_status}</span></td>
                      <td><span className={`badge status-${o.status}`}>{o.status}</span></td>
                      <td>
                        {o.status !== 'delivered' && o.status !== 'cancelled' && (
                          <select className="form-select" style={{ fontSize: '0.82rem', padding: '0.3rem 0.5rem', width: 'auto' }} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#6b7280' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}

      {/* Products tab */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <Link to="/farmer/products/add" className="btn btn-primary">+ Add Product</Link>
          </div>
          {products.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">🥭</div><p>No products listed yet.</p><Link to="/farmer/products/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>List Your First Mango</Link></div>
            : <div className="grid grid-3">
                {products.map(p => {
                  const imageUrl = resolveMediaUrl(p.image);
                  return (
                  <div key={p.id} className="card">
                    <div className="product-card-img" style={{ height: 140 }}>
                      {imageUrl
                        ? <img src={imageUrl} alt={p.name} loading="lazy" />
                        : <span style={{ fontSize: '3.5rem' }}>🥭</span>
                      }
                    </div>
                    <div className="card-body">
                      <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{p.name}</div>
                      <div style={{ color: '#2d6a4f', fontWeight: 700 }}>₹{p.price_per_unit}/{p.unit}</div>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.8rem' }}>Stock: {p.stock} {p.unit}</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/farmer/products/edit/${p.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Edit</Link>
                        <Link to={`/products/${p.id}`} className="btn btn-sm" style={{ flex: 1, justifyContent: 'center', background: '#f3f4f6' }}>View</Link>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
          }
        </div>
      )}
    </div>
  );
}
