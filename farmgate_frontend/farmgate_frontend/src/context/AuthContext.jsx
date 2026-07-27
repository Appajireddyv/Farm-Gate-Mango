import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuthSession = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getProfile()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleSessionEnd = () => {
      clearAuthSession();
    };

    window.addEventListener('beforeunload', handleSessionEnd);
    window.addEventListener('pagehide', handleSessionEnd);

    return () => {
      window.removeEventListener('beforeunload', handleSessionEnd);
      window.removeEventListener('pagehide', handleSessionEnd);
    };
  }, []);

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    localStorage.setItem('token', res.data.access);
    setUser(res.data.user);
    return res.data.user;
  };

  const loginWithGoogle = async (credential) => {
    const res = await authAPI.loginWithGoogle(credential);
    localStorage.setItem('token', res.data.access);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('token', res.data.access);
    setUser(res.data.user);
    return res.data.user;
  };

  const sendFarmerOTP = (data) => authAPI.sendFarmerOTP(data);

  const verifyFarmerOTP = async (phone, otp) => {
    const res = await authAPI.verifyFarmerOTP({ phone, otp });
    localStorage.setItem('token', res.data.access);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    clearAuthSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, sendFarmerOTP, verifyFarmerOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
