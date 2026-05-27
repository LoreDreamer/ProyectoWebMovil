import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  nombre_completo: string;
  rut: string;
  region: string;
  comuna: string;
  estado: 'ACTIVO' | 'INACTIVO';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRut');
    localStorage.removeItem('userRegion');
    localStorage.removeItem('userComuna');
    localStorage.removeItem('isAdmin');

    setToken(null);
    setUser(null);
  };

  const saveUserInLocalStorage = (userData: User) => {
    localStorage.setItem('userEmail', userData.email || '');
    localStorage.setItem('userName', userData.nombre_completo || '');
    localStorage.setItem('userRut', userData.rut || '');
    localStorage.setItem('userRegion', userData.region || '');
    localStorage.setItem('userComuna', userData.comuna || '');
    localStorage.setItem('isAdmin', userData.role === 'admin' ? 'true' : 'false');
  };

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        clearSession();
        return;
      }

      const userData: User = await response.json();

      setUser(userData);
      saveUserInLocalStorage(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      clearSession();
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    fetchCurrentUser(storedToken).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);

    await fetchCurrentUser(newToken);
  };

  const logout = () => {
    clearSession();
  };

  const refreshUser = async () => {
    if (!token) return;

    await fetchCurrentUser(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};