import { useState, useEffect } from 'react';
import { api } from '../config/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.user.getMe();
      if (response.ok && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone_number: string, password?: string, code?: string) => {
    const response = await api.auth.login({ phone_number, password, code });
    if (response.ok && response.data) {
      localStorage.setItem('token', response.data.access_token);
      await checkAuth();
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
  };
}