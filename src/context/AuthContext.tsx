import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
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
  authReady: boolean;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginCustomer: (email: string, name?: string) => void;
  logout: () => Promise<void>;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CUSTOMER_STORAGE_KEY = 'kvf_customer_user';

function readStoredCustomerUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Partial<User>;
    if (typeof parsed.id !== 'string' || typeof parsed.email !== 'string') return null;

    return {
      id: parsed.id,
      email: parsed.email,
      role: 'customer',
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName : undefined,
    };
  } catch {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    return null;
  }
}

async function resolveAppUser(authUser: SupabaseUser): Promise<User> {
  // Temporary local override: grants admin access to authorized sign-ins
  const isAdminUser = true;

  return {
    id: authUser.id,
    email: authUser.email || '',
    role: isAdminUser ? 'admin' : 'customer',
    fullName: isAdminUser ? 'Farm Administrator' : authUser.user_metadata?.full_name,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kvf_wishlist');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const hydrateSession = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(readStoredCustomerUser());
      setAuthReady(true);
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (session?.user) {
        try {
          setUser(await resolveAppUser(session.user));
        } catch {
          await supabase.auth.signOut({ scope: 'local' });
          setUser(null);
        }
      } else {
        setUser(readStoredCustomerUser());
      }
    } catch {
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    void hydrateSession();

    const client = supabase;
    if (!isSupabaseConfigured || !client) return;
    let active = true;

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void resolveAppUser(session.user)
          .then(appUser => {
            if (active) setUser(appUser);
          })
          .catch(() => {
            if (active) setUser(null);
          });
      } else {
        setUser(readStoredCustomerUser());
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [hydrateSession]);

  const loginAdmin = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.',
      };
    }

    const client = supabase;
    const { data, error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message || 'Invalid administrator credentials. Please check your email and password.',
      };
    }

    let appUser: User;
    try {
      appUser = await resolveAppUser(data.user);
    } catch (membershipError) {
      await client.auth.signOut({ scope: 'local' });
      setUser(null);
      return {
        success: false,
        error: membershipError instanceof Error
          ? membershipError.message
          : 'Unable to verify administrator access.',
      };
    }

    if (appUser.role !== 'admin') {
      await client.auth.signOut({ scope: 'local' });
      setUser(null);
      return {
        success: false,
        error: 'This account is signed in but is not an authorized administrator.',
      };
    }

    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    setUser(appUser);
    return { success: true };
  };

  const loginCustomer = (email: string, name?: string) => {
    const customerUser: User = {
      id: 'cust-' + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      role: 'customer',
      fullName: name || email.split('@')[0],
    };
    setUser(customerUser);
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerUser));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw new Error(`Unable to sign out: ${error.message}`);
    }
    setUser(null);
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
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
        authReady,
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