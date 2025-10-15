import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { api } from '../config/api';
import { Charity } from '../types/api';

interface CharitiesContextType {
  charities: Charity[];
  isLoadingCharities: boolean;
  charitiesError: string | null;
  fetchCharities: () => Promise<void>;
}

const CharitiesContext = createContext<CharitiesContextType | undefined>(undefined);

export const CharitiesProvider = ({ children }: { children: ReactNode }) => {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [isLoadingCharities, setIsLoadingCharities] = useState(true);
  const [charitiesError, setCharitiesError] = useState<string | null>(null);
  const hasFetchedCharities = useRef(false);

  const fetchCharities = async () => {
    if (hasFetchedCharities.current) {
      return; // Prevent multiple concurrent calls or re-fetching if already done
    }
    hasFetchedCharities.current = true;
    setIsLoadingCharities(true);
    setCharitiesError(null); // Clear previous errors

    try {
      const response = await api.charities.getAll();
      if (response.ok && response.data?.charities) {
        setCharities(response.data.charities);
      } else {
        setCharitiesError(response.error || 'خطا در دریافت لیست خیریه‌ها');
      }
    } catch (error) {
      console.error('Charities fetch failed:', error);
      setCharitiesError('خطا در ارتباط با سرور');
    } finally {
      setIsLoadingCharities(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []); // Fetch charities only once when the provider mounts

  return (
    <CharitiesContext.Provider
      value={{
        charities,
        isLoadingCharities,
        charitiesError,
        fetchCharities,
      }}
    >
      {children}
    </CharitiesContext.Provider>
  );
};

export const useCharities = () => {
  const context = useContext(CharitiesContext);
  if (context === undefined) {
    throw new Error('useCharities must be used within a CharitiesProvider');
  }
  return context;
};
