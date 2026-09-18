"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';

export default function AuthCallback() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      try {
        // Exchange code for session or retrieve current session from hash/cookies
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          if (isMounted) router.replace('/');
          return;
        }

        // Also listen for auth state change in case session is being processed asynchronously
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session && isMounted) {
            router.replace('/');
          }
        });

        // Timeout fallback after 4 seconds if still not authenticated
        const timer = setTimeout(() => {
          if (isMounted) {
            router.replace('/');
          }
        }, 4000);

        return () => {
          subscription?.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err) {
        console.error("OAuth callback error:", err);
        if (isMounted) {
          setErrorMsg(err.message || "Failed to complete authentication.");
          setTimeout(() => router.replace('/'), 3000);
        }
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinner} />
        </div>
        <h2 style={styles.title}>
          {errorMsg ? "Authentication Notice" : "Connecting to Builders Daily"}
        </h2>
        <p style={styles.subtitle}>
          {errorMsg ? `${errorMsg} Redirecting you back...` : "Securing your session and loading your builder feed..."}
        </p>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes callbackSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: 'var(--bgApp)',
    color: 'var(--textMain)',
    fontFamily: theme.typography.fontSans,
  },
  card: {
    maxWidth: '420px',
    width: '100%',
    padding: '40px 32px',
    backgroundColor: 'var(--bgCard)',
    borderRadius: '24px',
    border: '1px solid var(--borderDark)',
    textAlign: 'center',
    boxShadow: 'var(--shadow-card)',
    backdropFilter: 'blur(16px)',
  },
  spinnerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  spinner: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    border: '3px solid rgba(249, 115, 22, 0.2)',
    borderTopColor: '#f97316',
    animation: 'callbackSpin 0.9s linear infinite',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--textMain)',
    marginBottom: '8px',
    fontFamily: theme.typography.fontSerif,
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--textMuted)',
    lineHeight: '1.5',
  }
};
