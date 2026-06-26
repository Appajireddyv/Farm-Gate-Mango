export default function AuthLoading({ active, message = 'Please wait...' }) {
  if (!active) return null;

  return (
    <div className="auth-loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="auth-loading-spinner" />
      <p className="auth-loading-text">{message}</p>
    </div>
  );
}
