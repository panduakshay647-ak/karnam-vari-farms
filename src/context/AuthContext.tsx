import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginCustomer: (email: string, name?: string) => void;
  logout: () => Promise<void>;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kvf_auth_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kvf_wishlist');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Sync Supabase Auth listener if configured
  useEffect(() => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Check if admin
          client
            .from('admin_users')
            .select('role')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data }) => {
              const isAdminUser = Boolean(data);
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: isAdminUser ? 'admin' : 'customer',
              });
            });
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: 'customer',
          });
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const loginAdmin = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const defaultEmail = (import.meta.env.VITE_ADMIN_DEFAULT_EMAIL || 'admin@karnamvarifarms.com').toLowerCase();
    const defaultPass = import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD || 'KarnamAdmin2026!';

    // If Supabase is configured, try Supabase Auth first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });
        if (!error && data.user) {
          const adminUser: User = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            role: 'admin',
            fullName: 'Farm Administrator',
          };
          setUser(adminUser);
          localStorage.setItem('kvf_auth_user', JSON.stringify(adminUser));
          return { success: true };
        }
      } catch (err) {
        // Fall back to standard admin check
      }
    }

    // Built-in credential check
    if (cleanEmail === defaultEmail && pass === defaultPass) {
      const adminUser: User = {
        id: 'adm-001',
        email: cleanEmail,
        role: 'admin',
        fullName: 'Karnam Vari Farms Admin',
      };
      setUser(adminUser);
      localStorage.setItem('kvf_auth_user', JSON.stringify(adminUser));
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid administrator credentials. Please check your email and password.',
    };
  };

  const loginCustomer = (email: string, name?: string) => {
    const customerUser: User = {
      id: 'cust-' + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      role: 'customer',
      fullName: name || email.split('@')[0],
    };
    setUser(customerUser);
    localStorage.setItem('kvf_auth_user', JSON.stringify(customerUser));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    setUser(null);
    localStorage.removeItem('kvf_auth_user');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('kvf_wishlist', JSON.stringify(next));
      return next;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        loginAdmin,
        loginCustomer,
        logout,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
