import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignIn from '../components/GoogleSignIn';
import AuthLoading from '../components/AuthLoading';

function AuthDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      <span style={{ color: '#9ca3af', fontSize: '0.82rem', fontWeight: 500 }}>or</span>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const redirectAfterAuth = (user) => {
    navigate(user.role === 'farmer' ? '/farmer/dashboard' : '/products');
  };

  const handleGoogleSuccess = async (response) => {
    setOauthLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle(response.credential);
      redirectAfterAuth(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-in failed.');
    } finally {
      setOauthLoading(false);
    }
  };

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form.username, form.password);
      redirectAfterAuth(user);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  const isAuthLoading = loading || oauthLoading;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthLoading
          active={isAuthLoading}
          message={oauthLoading ? 'Signing in with Google...' : 'Signing in...'}
        />
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🥭</div>
          <h2 className="display-font" style={{ fontSize: '1.8rem' }}>Welcome Back</h2>
          <p style={{ color: '#6b7280', marginTop: '0.3rem' }}>Sign in to your Farm 2 Door account</p>
        </div>
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        <GoogleSignIn
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google sign-in was cancelled or failed.')}
          text="signin_with"
        />
        <AuthDivider />
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
          Farmers: sign in with your username and password
        </p>
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Enter username" required disabled={isAuthLoading} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Enter password" required disabled={isAuthLoading} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }} disabled={isAuthLoading}>
            {loading ? 'Signing in...' : 'Sign In with Password'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2d6a4f', fontWeight: 600 }}>Register free</Link>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'customer';
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', role: defaultRole, phone: '', village: '', district: '', state: '' });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const { register, sendFarmerOTP, verifyFarmerOTP, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const redirectAfterAuth = (user) => {
    navigate(user.role === 'farmer' ? '/farmer/dashboard' : '/products');
  };

  const handleGoogleSuccess = async (response) => {
    if (form.role !== 'customer') return;
    setOauthLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle(response.credential);
      redirectAfterAuth(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-up failed.');
    } finally {
      setOauthLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const resetFarmerFlow = () => {
    setStep(1);
    setOtp('');
    setInfo('');
    setError('');
  };

  const handleRoleChange = (role) => {
    setForm({ ...form, role });
    resetFarmerFlow();
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!form.phone || form.phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await sendFarmerOTP(form);
      setStep(2);
      const debugHint = res.data.debug_otp ? ` (Dev OTP: ${res.data.debug_otp})` : '';
      setInfo(`OTP sent to ${form.phone}.${debugHint}`);
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await verifyFarmerOTP(form.phone, otp);
      navigate(user.role === 'farmer' ? '/farmer/dashboard' : '/products');
    } catch (err) {
      const d = err.response?.data;
      setError(d?.error || (d ? Object.values(d).flat().join(' ') : 'OTP verification failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await register(form);
      navigate(user.role === 'farmer' ? '/farmer/dashboard' : '/products');
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const isFarmer = form.role === 'farmer';
  const isAuthLoading = loading || oauthLoading;
  const loadingMessage = oauthLoading
    ? 'Creating your account with Google...'
    : isFarmer
      ? (step === 2 ? 'Verifying OTP...' : 'Sending OTP...')
      : 'Creating your account...';

  return (
    <div className="auth-page" style={{ padding: '2rem', alignItems: 'flex-start', paddingTop: '3rem' }}>
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <AuthLoading active={isAuthLoading} message={loadingMessage} />
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🌱</div>
          <h2 className="display-font" style={{ fontSize: '1.8rem' }}>Join Farm 2 Door</h2>
          <p style={{ color: '#6b7280' }}>Connect directly, no middlemen</p>
        </div>
        <div className="button-group role-selector" style={{ marginBottom: '1.5rem', background: '#f3f4f6', borderRadius: '50px', padding: '4px' }}>
          {['customer', 'farmer'].map(r => (
            <button key={r} type="button" onClick={() => handleRoleChange(r)}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                background: form.role === r ? '#2d6a4f' : 'transparent', color: form.role === r ? 'white' : '#6b7280', transition: 'all 0.2s' }}>
              {r === 'customer' ? '🛒 I\'m a Buyer' : '🌾 I\'m a Farmer'}
            </button>
          ))}
        </div>
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>{error}</div>}
        {info && <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>{info}</div>}

        {!isFarmer && step === 1 && (
          <>
            <GoogleSignIn
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-up was cancelled or failed.')}
              text="signup_with"
            />
            <AuthDivider />
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
              Or register with email
            </p>
          </>
        )}

        {isFarmer && step === 2 ? (
          <form onSubmit={handleVerifyOTP}>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Enter the 6-digit code sent to <strong>{form.phone}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">OTP</label>
              <input
                className="form-control"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }} disabled={isAuthLoading}>
              {loading ? 'Verifying...' : 'Verify & Create Farmer Account →'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.88rem' }}>
              <button type="button" onClick={resetFarmerFlow} style={{ background: 'none', border: 'none', color: '#2d6a4f', fontWeight: 600, cursor: 'pointer' }}>
                ← Edit details
              </button>
              <button type="button" onClick={handleSendOTP} disabled={loading} style={{ background: 'none', border: 'none', color: '#2d6a4f', fontWeight: 600, cursor: 'pointer' }}>
                Resend OTP
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={isFarmer ? handleSendOTP : handleCustomerRegister}>
            <div className="form-grid-2">
              <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={form.first_name} onChange={set('first_name')} placeholder="First Name" required /></div>
              <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={form.last_name} onChange={set('last_name')} placeholder="Last Name" required /></div>
            </div>
            <div className="form-group"><label className="form-label">Username</label><input className="form-control" value={form.username} onChange={set('username')} placeholder="abc123" required /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={set('email')} placeholder="abc@farm.com" required /></div>
            <div className="form-group">
              <label className="form-label">Phone {isFarmer && <span style={{ color: '#dc2626' }}>*</span>}</label>
              <input type="tel" className="form-control" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value.replace(/\D/g,'').slice(0,10)})} placeholder="Enter Mobile Number" maxLength={10} required={isFarmer} />
            </div>
            {isFarmer && <>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Village</label><input className="form-control" value={form.village} onChange={set('village')} placeholder="Devgad" /></div>
                <div className="form-group"><label className="form-label">District</label><input className="form-control" value={form.district} onChange={set('district')} placeholder="Sindhudurg" /></div>
              </div>
              <div className="form-group"><label className="form-label">State</label><input className="form-control" value={form.state} onChange={set('state')} placeholder="Maharashtra" /></div>
            </>}
            <div className="form-group"><label className="form-label">Password</label><input className="form-control" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required /></div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }} disabled={isAuthLoading}>
              {loading
                ? (isFarmer ? 'Sending OTP...' : 'Creating account...')
                : (isFarmer ? 'Send OTP to Verify Phone →' : 'Create Buyer Account →')}
            </button>
          </form>
        )}
        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.9rem', color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#2d6a4f', fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}
