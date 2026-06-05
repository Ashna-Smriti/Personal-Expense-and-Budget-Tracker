import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) {
  if (import.meta.env.PROD) {
    console.error('[Auth] CRITICAL: VITE_API_URL not set. Set it in Vercel dashboard → Environment Variables → VITE_API_URL');
  }
  console.warn('[Auth] No VITE_API_URL — falling back to localhost:5001');
}
const FALLBACK = 'http://localhost:5001/api';
const API = axios.create({ baseURL: API_BASE || FALLBACK });

console.log('[Auth] API base URL:', API_BASE || FALLBACK, API_BASE ? '(from env)' : '(fallback)');

const friendlyError = (err) => {
  if (!err.response) return 'Server unavailable — check your connection';
  const status = err.response.status;
  if (status === 400) return err.response.data?.message || 'Invalid request';
  if (status === 401) return err.response.data?.message || 'Invalid credentials';
  if (status === 404) return 'Service not found';
  if (status >= 500) return err.response.data?.message || 'Server error — please try again later';
  return err.response.data?.message || err.message || 'Something went wrong';
};

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || sessionStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data.user);
      const userStr = JSON.stringify(data.user);
      localStorage.setItem('user', userStr);
      sessionStorage.setItem('user', userStr);
    } catch {
      // Backend unreachable — keep localStorage data and proceed offline
      const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { logout(); }
      } else {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSession = (token, user, rememberMe) => {
    setAuthToken(token);
    setToken(token);
    setUser(user);
    const userStr = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userStr);
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', userStr);
    }
  };

  const login = async (email, password, rememberMe) => {
    setAuthError('');
    try {
      const { data } = await API.post('/auth/login', { email, password, rememberMe });
      saveSession(data.token, data.user, rememberMe);
      return true;
    } catch (err) {
      const msg = friendlyError(err);
      console.error('[Auth] Login error:', err.response?.status, msg, err.config?.url);
      setAuthError(msg);
      return false;
    }
  };

  const register = async (fullName, email, username, password) => {
    setAuthError('');
    try {
      const { data } = await API.post('/auth/register', { fullName, email, username, password });
      saveSession(data.token, data.user, true);
      return true;
    } catch (err) {
      const msg = friendlyError(err);
      console.error('[Auth] Register error:', err.response?.status, msg, err.config?.url);
      setAuthError(msg);
      return false;
    }
  };

  const googleLogin = async (credential) => {
    setAuthError('');
    try {
      const { data } = await API.post('/auth/google', { credential });
      saveSession(data.token, data.user, true);
      return true;
    } catch (err) {
      const msg = friendlyError(err);
      console.error('[Auth] Google login error:', err.response?.status, msg);
      setAuthError(msg);
      return false;
    }
  };

  const forgotPassword = async (email) => {
    setAuthError('');
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      return data;
    } catch (err) {
      setAuthError(friendlyError(err));
      return null;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/user/profile', profileData);
      setUser(data.user);
      const userStr = JSON.stringify(data.user);
      localStorage.setItem('user', userStr);
      sessionStorage.setItem('user', userStr);
      return true;
    } catch (err) {
      setAuthError(friendlyError(err));
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await API.put('/user/password', { currentPassword, newPassword });
      return true;
    } catch (err) {
      setAuthError(friendlyError(err));
      return false;
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await API.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser((prev) => ({ ...prev, avatar: data.avatar }));
      return true;
    } catch (err) {
      setAuthError(friendlyError(err));
      return false;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }, []);

  // Auto logout on token expiry — check every minute
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          logout();
        }
      } catch {}
    }, 60000);
    return () => clearInterval(interval);
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{
      user, token, loading, authError, setAuthError,
      login, register, googleLogin, logout, forgotPassword, updateProfile, changePassword, uploadAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
