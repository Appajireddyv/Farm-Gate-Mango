import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../api';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

function StatusBadge({ status }) {
  return <span className={`badge status-${status}`} style={{ fontSize: '0.82rem', padding: '0.3rem 0.8rem' }}>{status}</span>;
}

function OrderCard({ order }) {
  return (
    <Link to={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ marginBottom: '1rem', transition: 'transform 0.15s' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform=''}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Order #{order.id}</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
              <StatusBadge status={order.status} />
              <span className={`badge ${order.payment_status === 'paid' ? 'badge-green' : 'badge-amber'}`}>{order.payment_status}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#374151' }}>
            {order.items.slice(0, 2).map(i => <div key={i.id}>• {i.product_name} × {i.quantity} {i.unit}</div>)}
            {order.items.length > 2 && <div style={{ color: '#6b7280' }}>+{order.items.length - 2} more items</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, color: '#2d6a4f', fontSize: '1.1rem' }}>₹{parseFloat(order.total_amount).toFixed(0)}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>via {order.payment_method?.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.myOrders().then(res => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;

  return (
    <div className="container section">
      <h1 className="page-title">My Orders</h1>
      <p className="page-subtitle">Track your mango deliveries</p>
      {orders.length === 0
        ? <div className="empty-state"><div className="empty-state-icon">📦</div><h3>No orders yet</h3><p style={{ marginBottom: '1.5rem' }}>Start shopping fresh mangoes!</p><Link to="/products" className="btn btn-primary">Shop Now 🥭</Link></div>
        : orders.map(o => <OrderCard key={o.id} order={o} />)
      }
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.detail(id).then(res => setOrder(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;
  if (!order) return <div className="container section">Order not found</div>;

  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="container section">
      <div className="breadcrumb"><Link to="/orders">My Orders</Link> / Order #{order.id}</div>

      <div className="order-detail-layout">
        <div>
          {/* Status tracker */}
          {order.status !== 'cancelled' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-body">
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Order Status</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '3px', background: '#e5e7eb', zIndex: 0 }}>
                    <div style={{ width: `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%`, height: '100%', background: '#2d6a4f', transition: 'width 0.5s' }} />
                  </div>
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= stepIdx ? '#2d6a4f' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, transition: 'background 0.3s' }}>
                        {i < stepIdx ? '✓' : i + 1}
                      </div>
                      <div style={{ fontSize: '0.72rem', textAlign: 'center', fontWeight: i === stepIdx ? 700 : 400, color: i <= stepIdx ? '#2d6a4f' : '#9ca3af', textTransform: 'capitalize' }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Order Items</h3>
              {order.items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.quantity} {item.unit} × ₹{item.price_per_unit}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#2d6a4f' }}>₹{parseFloat(item.subtotal).toFixed(0)}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 800, fontSize: '1.1rem' }}>
                <span>Total</span><span style={{ color: '#2d6a4f' }}>₹{parseFloat(order.total_amount).toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-body">
              <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Order Info</h4>
              <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div><span style={{ color: '#6b7280' }}>Order #</span> <strong>{order.id}</strong></div>
                <div><span style={{ color: '#6b7280' }}>Status</span> <StatusBadge status={order.status} /></div>
                <div><span style={{ color: '#6b7280' }}>Payment</span> <span className={`badge ${order.payment_status === 'paid' ? 'badge-green' : 'badge-amber'}`}>{order.payment_status}</span></div>
                <div><span style={{ color: '#6b7280' }}>Method</span> {order.payment_method?.toUpperCase()}</div>
                <div><span style={{ color: '#6b7280' }}>Farmer</span> {order.farmer_name}</div>
                <div><span style={{ color: '#6b7280' }}>Date</span> {new Date(order.created_at).toLocaleDateString('en-IN')}</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h4 style={{ marginBottom: '0.8rem', fontWeight: 700 }}>Delivery Address</h4>
              <p style={{ fontSize: '0.9rem', color: '#374151' }}>{order.delivery_address}</p>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.3rem' }}>PIN: {order.delivery_pincode}</p>
              {order.notes && <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>Note: {order.notes}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
