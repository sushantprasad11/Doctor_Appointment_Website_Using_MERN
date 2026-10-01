import { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await authApi.getCurrentUser();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authApi.register(userData);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    isAuthenticated: !!user,
    isDoctor: user?.role === 'doctor',
    isPatient: user?.role === 'patient',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
