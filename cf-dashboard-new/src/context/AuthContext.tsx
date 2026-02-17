import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'enterprise';
}

interface AuthContextType {
  user: User | null;
  apiKey: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (key: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('api_key') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateKey = useCallback(async (key: string) => {
    if (!key) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      api.setApiKey(key);
      const stats = await api.getStats();
      setUser({
        id: stats.user_id,
        email: stats.email || `${stats.tier}@llm-fw.io`,
        tier: stats.tier || 'free',
      });
      setApiKey(key);
      localStorage.setItem('api_key', key);
    } catch {
      setUser(null);
      setApiKey('');
      localStorage.removeItem('api_key');
      setError('Invalid API key or server unreachable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('api_key');
    if (stored) {
      validateKey(stored);
    } else {
      setIsLoading(false);
    }
  }, [validateKey]);

  const login = async (key: string) => {
    await validateKey(key);
  };

  const logout = () => {
    setUser(null);
    setApiKey('');
    localStorage.removeItem('api_key');
    api.setApiKey('');
  };

  return (
    <AuthContext.Provider value={{
      user,
      apiKey,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
