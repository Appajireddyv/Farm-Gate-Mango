import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form.username, form.password);
      navigate(user.role === 'farmer' ? '/farmer/dashboard' : '/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🥭</div>
          <h2 className="display-font" style={{ fontSize: '1.8rem' }}>Welcome Back</h2>
          <p style={{ color: '#6b7280', marginTop: '0.3rem' }}>Sign in to your FarmGate account</p>
        </div>
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Enter username" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Enter password" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2d6a4f', fontWeight: 600 }}>Register free</Link>
        </div>
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', fontSize: '0.82rem', color: '#166534' }}>
          <strong>Demo accounts:</strong><br/>
          Farmer: raju_farmer / mango123<br/>
          Customer: priya_customer / buy123
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'customer';
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', role: defaultRole, phone: '', village: '', district: '', state: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await register(form);
      navigate(user.role === 'farmer' ? '/farmer/dashboard' : '/products');
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ padding: '2rem', alignItems: 'flex-start', paddingTop: '3rem' }}>
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🌱</div>
          <h2 className="display-font" style={{ fontSize: '1.8rem' }}>Join FarmGate</h2>
          <p style={{ color: '#6b7280' }}>Connect directly, no middlemen</p>
        </div>
        <div className="button-group" style={{ marginBottom: '1.5rem', background: '#f3f4f6', borderRadius: '50px', padding: '4px' }}>
          {['customer', 'farmer'].map(r => (
            <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                background: form.role === r ? '#2d6a4f' : 'transparent', color: form.role === r ? 'white' : '#6b7280', transition: 'all 0.2s' }}>
              {r === 'customer' ? '🛒 I\'m a Buyer' : '🌾 I\'m a Farmer'}
            </button>
          ))}
        </div>
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>{error}</div>}
        <form onSubmit={handle}>
          <div className="form-grid-2">
            <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={form.first_name} onChange={set('first_name')} placeholder="Raju" required /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={form.last_name} onChange={set('last_name')} placeholder="Patil" required /></div>
          </div>
          <div className="form-group"><label className="form-label">Username</label><input className="form-control" value={form.username} onChange={set('username')} placeholder="raju123" required /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={set('email')} placeholder="raju@farm.com" required /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={set('phone')} placeholder="9876543210" /></div>
          {form.role === 'farmer' && <>
            <div className="form-grid-2">
              <div className="form-group"><label className="form-label">Village</label><input className="form-control" value={form.village} onChange={set('village')} placeholder="Devgad" /></div>
              <div className="form-group"><label className="form-label">District</label><input className="form-control" value={form.district} onChange={set('district')} placeholder="Sindhudurg" /></div>
            </div>
            <div className="form-group"><label className="form-label">State</label><input className="form-control" value={form.state} onChange={set('state')} placeholder="Maharashtra" /></div>
          </>}
          <div className="form-group"><label className="form-label">Password</label><input className="form-control" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required /></div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Creating account...' : `Create ${form.role === 'farmer' ? 'Farmer' : 'Buyer'} Account →`}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.9rem', color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#2d6a4f', fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}
