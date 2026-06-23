import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;
  if (!user) return <div style={{ marginTop: '4rem' }}>No user data available.</div>;

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2>Profile</h2>
      <div className="profile-card" style={{ maxWidth: 600, padding: '1rem', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Full name:</strong> {user.full_name || user.first_name || '-'}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
    </div>
  );
}
