import { useEffect, useState } from 'react';
import { ordersAPI, productsAPI } from '../api';
import { Link } from 'react-router-dom';

export default function FarmerHome() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([ordersAPI.farmerOrders(), productsAPI.myProducts()])
      .then(([ordersRes, productsRes]) => {
        setOrders(ordersRes.data || []);
        setProducts(productsRes.data || []);
      })
      .catch(err => console.error('FarmerHome load error', err))
      .finally(() => setLoading(false));
  }, []);

  const pending = orders.filter(o => o.status === 'pending').length;
  const preparing = orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length;
  const shipped = orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length;

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Farmer Dashboard</h1>
      <p style={{ marginBottom: '1.5rem' }}>Quick overview of your store</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem', minWidth: 180 }}>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Products</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{products.length}</div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/farmer/products" className="btn btn-secondary btn-sm">Manage</Link>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', minWidth: 180 }}>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Pending Orders</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{pending}</div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/farmer/dashboard" className="btn btn-secondary btn-sm">View Orders</Link>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', minWidth: 180 }}>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Preparing / Accepted</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{preparing}</div>
        </div>

        <div className="card" style={{ padding: '1rem', minWidth: 180 }}>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Shipped / Delivered</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{shipped}</div>
        </div>
      </div>

      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Recent Orders</h2>
        {orders.length === 0 ? (
          <div>No orders yet — share your products to start selling.</div>
        ) : (
          <div className="grid" style={{ gap: '0.75rem' }}>
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Order #{order.id}</div>
                  <div style={{ color: '#6b7280' }}>{order.customer_name || order.customer || order.customer_email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>₹{order.total || order.amount || '—'}</div>
                  <div style={{ color: '#6b7280' }}>{order.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
