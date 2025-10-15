import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef, // Import useRef
  ReactNode,
} from 'react';
import { api } from '../config/api';
import { GetMeResponse, AuthRequest } from '../types/api';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<GetMeResponse | null>(null);
  const isCheckingAuth = useRef(false); // Add a ref to track if checkAuth is in progress

  const checkAuth = async () => {
    if (isCheckingAuth.current) {
      return; // Prevent multiple concurrent calls
    }

    isCheckingAuth.current = true;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await api.user.getMe();

      if (response.ok && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        // Only remove token if the status is 401 (Unauthorized)
        if (response.status === 401) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        } else{
          setIsAuthenticated(!!token);
          setUser(null); // Clear user data as it couldn't be fetched
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(!!localStorage.getItem('token'));
      setUser(null);
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false; // Reset the ref after the check is complete
    }
  };

  const login = async (phone_number: string, password?: string, code?: string) => {
    const response = await api.auth.login({ phone_number, password, code } as AuthRequest);
    if (response.ok && response.data) {
      localStorage.setItem('token', response.data.access_token || '');
      // No need to await checkAuth here, as it will be called by useEffect or handle subsequent calls
      // We can just trigger it and let the ref handle concurrency
      checkAuth();
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/'); // Navigate to the main page after logout
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
