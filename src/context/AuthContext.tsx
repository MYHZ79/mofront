import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { api } from '../config/api';
import { GetMeResponse, AuthRequest } from '../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: GetMeResponse | null;
  login: (phone_number: string, password?: string, code?: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<GetMeResponse | null>(null);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      const response = await api.user.getMe();
      if (response.ok && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        // If the status is 0, it indicates a network error (backend down/unreachable).
        // In this case, don't remove the token.
        if (response.status === 0) {
          // Keep current authentication state if a token exists, assume it's still valid
          // This prevents forcing re-login on temporary backend downtime
          setIsAuthenticated(!!token); // Keep authenticated if token exists
          setUser(null); // User data might be stale, clear it
        } else {
          // For other HTTP status codes (e.g., 401 Unauthorized, 500 Internal Server Error),
          // it means the backend responded with an error, so the token is likely invalid.
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // If an uncaught error occurs (e.g., network error before response),
      // treat it as a network issue and don't remove the token.
      // The `status` property from `api.ts` will be 0 in this case.
      setIsAuthenticated(!!localStorage.getItem('token')); // Keep authenticated if token exists
      setUser(null); // User data might be stale, clear it
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone_number: string, password?: string, code?: string) => {
    const response = await api.auth.login({ phone_number, password, code } as AuthRequest);
    if (response.ok && response.data) {
      localStorage.setItem('token', response.data.access_token || '');
      await checkAuth(); // Call checkAuth after successful login to get user data
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []); // Run checkAuth only once when the AuthProvider mounts

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
