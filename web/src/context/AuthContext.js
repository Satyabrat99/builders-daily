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

const USER_CACHE_KEY = 'builder_daily_cached_user';
const WRITER_CACHE_KEY = 'builder_daily_cached_writer';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(USER_CACHE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(USER_CACHE_KEY);
        if (stored) return false;
      } catch (e) {}
    }
    return true;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(USER_CACHE_KEY);
        if (stored) {
          const u = JSON.parse(stored);
          return u?.email === 'admin@test.com';
        }
      } catch (e) {}
    }
    return false;
  });

  const [isWriter, setIsWriter] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedWriter = localStorage.getItem(WRITER_CACHE_KEY);
        if (storedWriter !== null) return storedWriter === 'true';
        const stored = localStorage.getItem(USER_CACHE_KEY);
        if (stored) {
          const u = JSON.parse(stored);
          return u?.email === 'admin@test.com';
        }
      } catch (e) {}
    }
    return false;
  });

  const checkUserRole = async (currentUser) => {
    if (!currentUser) {
      setIsAdmin(false);
      setIsWriter(false);
      try { localStorage.removeItem(WRITER_CACHE_KEY); } catch (e) {}
      return;
    }

    const isUserAdmin = currentUser.email === 'admin@test.com';
    setIsAdmin(isUserAdmin);

    if (isUserAdmin) {
      setIsWriter(true);
      try { localStorage.setItem(WRITER_CACHE_KEY, 'true'); } catch (e) {}
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
          try { localStorage.setItem(WRITER_CACHE_KEY, 'true'); } catch (e) {}
          return;
        }
      }
    } catch (err) {
      console.error("Error checking allowed_blog_writers:", err);
    }

    setIsWriter(false);
    try { localStorage.setItem(WRITER_CACHE_KEY, 'false'); } catch (e) {}
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
        if (currentUser) {
          try { localStorage.setItem(USER_CACHE_KEY, JSON.stringify(currentUser)); } catch (e) {}
        } else {
          try {
            localStorage.removeItem(USER_CACHE_KEY);
            localStorage.removeItem(WRITER_CACHE_KEY);
          } catch (e) {}
        }
        // Resolve loading immediately without waiting for DB role check
        setLoading(false);
        checkUserRole(currentUser);
      } catch (err) {
        console.error("Auth getSession failed:", err);
        setLoading(false);
      }
    };

    getSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        try { localStorage.setItem(USER_CACHE_KEY, JSON.stringify(currentUser)); } catch (e) {}
      } else {
        try {
          localStorage.removeItem(USER_CACHE_KEY);
          localStorage.removeItem(WRITER_CACHE_KEY);
        } catch (e) {}
      }
      setLoading(false);
      checkUserRole(currentUser);
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
    try {
      localStorage.removeItem(USER_CACHE_KEY);
      localStorage.removeItem(WRITER_CACHE_KEY);
    } catch (e) {}
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
