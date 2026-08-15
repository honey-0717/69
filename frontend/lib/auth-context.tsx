'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from './api-client';

type User = {
  id: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, setupCode?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

let cachedUser: User | null = null;
let sessionChecked = false;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(!sessionChecked);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      if (sessionChecked) {
        setUser(cachedUser);
        setLoading(false);
        return;
      }

      const { data, error } = await apiRequest<{ authenticated: boolean; user: User }>('/api/auth/session');
      if (!mounted) return;
      if (!error && data?.authenticated && data.user) {
        cachedUser = data.user;
        setUser(data.user);
      } else {
        cachedUser = null;
        setUser(null);
      }
      sessionChecked = true;
      setLoading(false);
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await apiRequest<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!error && data?.user) {
      cachedUser = data.user;
      sessionChecked = true;
      setUser(data.user);
      return { error: null };
    }

    return { error: error ?? 'Invalid credentials' };
  };

  const signUp = async (email: string, password: string, setupCode?: string) => {
    const { data, error } = await apiRequest<{ user: User }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, setupCode }),
    });

    if (!error && data?.user) {
      cachedUser = data.user;
      sessionChecked = true;
      setUser(data.user);
      return { error: null };
    }

    return { error: error ?? 'Account creation failed' };
  };

  const signOut = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    cachedUser = null;
    sessionChecked = false;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
