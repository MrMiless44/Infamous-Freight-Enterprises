import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient, User, AuthError } from '@supabase/supabase-js';
import { trackFunnelEvent } from '@/lib/analytics';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or legacy VITE_SUPABASE_ANON_KEY). Do not use a database connection string here.');
  }

  if (SUPABASE_URL.startsWith('postgres://') || SUPABASE_URL.startsWith('postgresql://')) {
    throw new Error('Invalid Supabase client URL. VITE_SUPABASE_URL must be the project API URL, for example https://your-project-ref.supabase.co, not the Postgres database URL.');
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseInstance;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const supabase = getSupabase();

      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          setError(error);
        } else {
          setError(null);
        }
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const authSubscription = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      subscription = authSubscription.data.subscription;
    } catch {
      setUser(null);
      setLoading(false);
    }

    return () => subscription?.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error);
      throw error;
    }
    return data;
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
    setError(null);
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) {
      setError(error);
      throw error;
    }
    trackFunnelEvent('funnel_signup');
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error);
      throw error;
    }
    return data;
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}

export function useSupabaseStorage() {
  const uploadFile = useCallback(async (bucket: string, path: string, file: File) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) throw error;
    return data;
  }, []);

  const getPublicUrl = useCallback((bucket: string, path: string) => {
    const supabase = getSupabase();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const deleteFile = useCallback(async (bucket: string, path: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }, []);

  return { uploadFile, getPublicUrl, deleteFile };
}

export function useSupabaseRealtime(channel: string, event: string, callback: (payload: unknown) => void) {
  useEffect(() => {
    const supabase = getSupabase();
    const sub = supabase
      .channel(channel)
      .on('postgres_changes', { event: '*', schema: 'public', table: event }, callback)
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [channel, event, callback]);
}

export { getSupabase };
