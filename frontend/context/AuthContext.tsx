import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { login as apiLogin, signup as apiSignup, getMe } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  signup: (name: string, email: string, pass: string) => Promise<User>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, pass: string) => {
    const { user: userData, token } = await apiLogin(email, pass);
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const signup = async (name: string, email: string, pass: string) => {
    const { user: userData, token } = await apiSignup(name, email, pass);
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const reloadUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
