import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Helper: parse a raw hash string (without leading #) into key-value pairs
const parseHashParams = (hash: string): Record<string, string> => {
  return hash
    .replace(/^#/, '')
    .split('&')
    .reduce((acc, pair) => {
      const [key, value] = pair.split('=');
      if (key) acc[decodeURIComponent(key)] = decodeURIComponent(value || '');
      return acc;
    }, {} as Record<string, string>);
};

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  verificationMessage: string | null;
  clearVerificationMessage: () => void;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  // Track if the current sign-in came from an email verification link
  const isVerificationSignIn = React.useRef(false);

  const clearVerificationMessage = () => setVerificationMessage(null);

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      if (data) {
        setProfile(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // --- Handle Supabase email verification tokens in the URL hash ---
    // When HashRouter is used, Supabase's verification redirect lands as:
    //   https://yoursite.com/#access_token=...&type=signup
    // HashRouter would try to route '#access_token=...' as a path.
    // We intercept it here, exchange the tokens, then clean up the URL.
    const rawHash = window.location.hash;
    const hashParams = parseHashParams(rawHash);
    const accessToken = hashParams['access_token'];
    const refreshToken = hashParams['refresh_token'];
    const tokenType = hashParams['type'];

    if (accessToken && refreshToken && (tokenType === 'signup' || tokenType === 'email_change' || tokenType === 'recovery')) {
      // Mark that this sign-in is from an email verification
      if (tokenType === 'signup' || tokenType === 'email_change') {
        isVerificationSignIn.current = true;
      }
      // Clean up the URL immediately so HashRouter doesn't try to route the token
      window.location.hash = '#/';
      // Exchange the tokens for a valid session
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      // setLoading stays true until onAuthStateChange fires below
    } else {
      // Normal startup: get existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
        setLoading(false);
      });
    }

    // Listen for auth state changes (handles all sign-in paths)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).then((profileData) => {
          const role = profileData?.role;
          const currentHash = window.location.hash;
          const alreadyOnDashboard = currentHash.startsWith('#/dashboard') || currentHash.startsWith('#/admin');

          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (isVerificationSignIn.current) {
              // Email verification: show success message and redirect to dashboard
              isVerificationSignIn.current = false;
              setVerificationMessage('🎉 Email verified successfully! Welcome to VHL Abroad.');
              setTimeout(() => {
                window.location.hash = role === 'admin' ? '#/admin' : '#/dashboard';
              }, 300);
            } else if (!alreadyOnDashboard) {
              // Regular sign-in redirect
              setTimeout(() => {
                window.location.hash = role === 'admin' ? '#/admin' : '#/dashboard';
              }, 100);
            }
          }
        });
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    profile,
    loading,
    verificationMessage,
    clearVerificationMessage,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
