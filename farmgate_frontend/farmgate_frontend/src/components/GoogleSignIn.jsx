import { GoogleLogin } from '@react-oauth/google';

export default function GoogleSignIn({ onSuccess, onError, text = 'signin_with' }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div style={{
        background: '#fef3c7',
        color: '#92400e',
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        textAlign: 'center',
      }}>
        Google sign-in is not configured. Set <code>VITE_GOOGLE_CLIENT_ID</code> in your env file.
      </div>
    );
  }

  return (
    <div className="google-signin-wrap">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        text={text}
        shape="rectangular"
        theme="outline"
        size="large"
        width="100%"
      />
    </div>
  );
}
