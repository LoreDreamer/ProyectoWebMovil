import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id?: string;
  rut?: string;
  nombre_completo?: string;
  name?: string;
  region?: string;
  comuna?: string;
  correo?: string;
  email: string;
  estatus?: string;
  estado?: string;
  tipo_usuario?: string;
  role: 'admin' | 'user';
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userFromLogin?: User) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000';

const normalizeFrontendUser = (raw: any): User | null => {
  if (!raw) return null;

  const realUser = raw.user || raw;

  const dbRole = String(realUser.role || realUser.tipo_usuario || '').toLowerCase();

  return {
    id: realUser.id,
    rut: realUser.rut || '',
    nombre_completo: realUser.nombre_completo || realUser.name || '',
    name: realUser.name || realUser.nombre_completo || '',
    region: realUser.region || '',
    comuna: realUser.comuna || '',
    correo: realUser.correo || realUser.email || '',
    email: realUser.email || realUser.correo || '',
    estatus: realUser.estatus || realUser.estado || '',
    estado: realUser.estado || realUser.estatus || '',
    tipo_usuario: realUser.tipo_usuario || realUser.role || '',
    role: dbRole === 'admin' ? 'admin' : 'user',
    created_at: realUser.created_at || '',
  };
};

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

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
        return;
      }

      const normalizedUser = normalizeFrontendUser(data);

      if (!normalizedUser) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
        return;
      }

      setUser(normalizedUser);
      localStorage.setItem('auth_user', JSON.stringify(normalizedUser));
    } catch (error) {
      console.error('Error fetching user:', error);

      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('auth_token');

    if (!storedToken) {
      setUser(null);
      setToken(null);
      return;
    }

    setToken(storedToken);
    await fetchCurrentUser(storedToken);
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('auth_user');
        }
      }

      if (storedToken) {
        setToken(storedToken);
        await fetchCurrentUser(storedToken);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (newToken: string, userFromLogin?: User) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);

    if (userFromLogin) {
      const normalizedUser = normalizeFrontendUser(userFromLogin);

      if (normalizedUser) {
        setUser(normalizedUser);
        localStorage.setItem('auth_user', JSON.stringify(normalizedUser));
      }
    }

    await fetchCurrentUser(newToken);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};