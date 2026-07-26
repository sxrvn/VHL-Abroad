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

  // Ref to track if the current sign-in came from an email verification link
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
    // ─── Detect email verification redirects ────────────────────────────────
    //
    // Supabase v2 supports two auth flows:
    //
    // 1. PKCE flow (default in v2): Verification link has ?code=xxx in the
    //    query string → e.g., http://yoursite.com/?code=abc123
    //    Supabase JS client auto-detects and exchanges the code for a session.
    //
    // 2. Implicit flow (legacy): Verification link has #access_token=xxx in
    //    the hash → e.g., http://yoursite.com/#access_token=xxx&type=signup
    //    Conflicts with HashRouter so we must intercept and exchange manually.
    //
    // ────────────────────────────────────────────────────────────────────────

    // Check for PKCE flow (?code= in query params)
    const searchParams = new URLSearchParams(window.location.search);
    const pkceCode = searchParams.get('code');

    // Check for implicit flow (#access_token= in hash)
    const rawHash = window.location.hash;
    const hashParams = parseHashParams(rawHash);
    const implicitToken = hashParams['access_token'];
    const implicitRefresh = hashParams['refresh_token'];
    const implicitType = hashParams['type'];
    const isImplicitVerification =
      !!(implicitToken && implicitRefresh && (implicitType === 'signup' || implicitType === 'email_change'));

    if (pkceCode) {
      // PKCE flow: supabase-js auto-detects ?code= on client init and exchanges
      // it for a session. We just need to mark this as a verification sign-in
      // so we can show the success message when onAuthStateChange fires.
      isVerificationSignIn.current = true;

      // Clean up the ?code= from the URL so it doesn't persist after the exchange.
      // Use history.replaceState so we don't add a history entry.
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Keep loading=true — onAuthStateChange will set it to false when session arrives

    } else if (isImplicitVerification) {
      // Implicit flow: clear the hash tokens so HashRouter doesn't try to
      // match "access_token=..." as a route path.
      isVerificationSignIn.current = true;
      window.location.hash = '#/';

      // Manually exchange the tokens for a valid Supabase session
      supabase.auth.setSession({
        access_token: implicitToken,
        refresh_token: implicitRefresh,
      });

      // Keep loading=true — onAuthStateChange will set it to false

    } else {
      // Normal app load — fetch the existing session from storage
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
        setLoading(false);
      });
    }

    // ─── Listen for all auth state changes ─────────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        const role = profileData?.role;
        const currentHash = window.location.hash;
        const alreadyOnDashboard =
          currentHash.startsWith('#/dashboard') || currentHash.startsWith('#/admin');

        if (event === 'SIGNED_IN') {
          if (isVerificationSignIn.current) {
            // ✅ Email verification complete — show success banner + redirect
            isVerificationSignIn.current = false;
            setVerificationMessage('🎉 Email verified successfully! Welcome to VHL Abroad.');
            setTimeout(() => {
              window.location.hash = role === 'admin' ? '#/admin' : '#/dashboard';
            }, 300);
          } else if (!alreadyOnDashboard) {
            // Regular manual sign-in redirect
            setTimeout(() => {
              window.location.hash = role === 'admin' ? '#/admin' : '#/dashboard';
            }, 100);
          }
        }
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
        // Redirect to the current origin so verification works on both
        // localhost (dev) and the production Netlify URL
        emailRedirectTo: window.location.origin,
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
