"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({
  user: null,
  loading: true,
  isAdmin: false,
  isWriter: false,
  login: async (email, password) => {},
  logout: async () => {},
  signUp: async (email, password) => {},
  loginWithOAuth: async (provider) => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWriter, setIsWriter] = useState(false);

  const checkUserRole = async (currentUser) => {
    if (!currentUser) {
      setIsAdmin(false);
      setIsWriter(false);
      return;
    }

    const isUserAdmin = currentUser.email === 'admin@test.com';
    setIsAdmin(isUserAdmin);

    if (isUserAdmin) {
      setIsWriter(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'allowed_blog_writers')
        .single();

      if (!error && data) {
        const allowedList = JSON.parse(data.value || '[]');
        if (Array.isArray(allowedList) && allowedList.includes(currentUser.id)) {
          setIsWriter(true);
          return;
        }
      }
    } catch (err) {
      console.error("Error checking allowed_blog_writers:", err);
    }

    setIsWriter(false);
  };

  useEffect(() => {
    // 1. Check for current session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error);
        }
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await checkUserRole(currentUser);
      } catch (err) {
        console.error("Auth getSession failed:", err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await checkUserRole(currentUser);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
    return data;
  };

  const loginWithOAuth = async (provider) => {
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw error;
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isWriter, login, logout, signUp, loginWithOAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
