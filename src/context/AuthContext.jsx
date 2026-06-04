import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5001/api' });

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
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data.user);
      const userStr = JSON.stringify(data.user);
      localStorage.setItem('user', userStr);
      sessionStorage.setItem('user', userStr);
    } catch {
      logout();
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
      setAuthError(err.response?.data?.message || 'Login failed');
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
      setAuthError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const forgotPassword = async (email) => {
    setAuthError('');
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      return data;
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Failed to process request');
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
      setAuthError(err.response?.data?.message || 'Update failed');
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await API.put('/user/password', { currentPassword, newPassword });
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Password change failed');
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
      setAuthError(err.response?.data?.message || 'Upload failed');
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
      login, register, logout, forgotPassword, updateProfile, changePassword, uploadAvatar,
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
