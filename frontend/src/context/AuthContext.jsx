import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vse_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details on load if token exists
  const refreshUser = async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: loggedInUser, token: authToken } = res.data.data;
      localStorage.setItem('vse_token', authToken);
      setToken(authToken);
      setUser(loggedInUser);
      return loggedInUser;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      const { user: registeredUser, token: authToken } = res.data.data;
      localStorage.setItem('vse_token', authToken);
      setToken(authToken);
      setUser(registeredUser);
      return registeredUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('vse_token');
    localStorage.removeItem('vse_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
