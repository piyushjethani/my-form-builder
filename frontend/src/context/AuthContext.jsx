import { createContext, useContext, useMemo, useState } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('form_builder_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('form_builder_user');
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (payload) => {
    localStorage.setItem('form_builder_token', payload.token);
    localStorage.setItem('form_builder_user', JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (values) => {
    const response = await api.post('/auth/login', values);
    persist(response.data);
    return response.data.user;
  };

  const register = async (values) => {
    const response = await api.post('/auth/register', values);
    persist(response.data);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem('form_builder_token');
    localStorage.removeItem('form_builder_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, login, register, logout, isAuthenticated: Boolean(token) }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
