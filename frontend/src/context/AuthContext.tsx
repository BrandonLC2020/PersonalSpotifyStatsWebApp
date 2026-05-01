import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to load auth token', e);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = (newToken: string) => {
    try {
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
    } catch (e) {
      console.error('Failed to save auth token', e);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('auth_token');
      setToken(null);
    } catch (e) {
      console.error('Failed to remove auth token', e);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, loading }}>
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