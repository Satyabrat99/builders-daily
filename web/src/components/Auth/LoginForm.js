"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggleSwitch from '@/components/ui/ThemeToggleSwitch';
import { theme } from '@/theme';

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [oauthLoading, setOauthLoading] = useState(null); // 'github' | 'google' | null

  const { login, signUp, loginWithOAuth, loading: authLoading } = useAuth();
  const isSubmitting = authLoading || !!oauthLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      if (isSignUp) {
        if (signUp) {
          const res = await signUp(email, password);
          if (res?.user && !res?.session) {
            setSuccessMsg('Account created! Please check your email to confirm your account.');
          } else {
            setSuccessMsg('Account created successfully! Signing you in...');
          }
        } else {
          setError('Sign up is not enabled.');
        }
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleOAuth = async (provider) => {
    setError(null);
    setSuccessMsg(null);
    setOauthLoading(provider);
    try {
      if (loginWithOAuth) {
        await loginWithOAuth(provider);
      } else {
        throw new Error('OAuth login is not configured.');
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(err.message || `Failed to sign in with ${provider}.`);
      setOauthLoading(null);
    }
  };

  return (
    <div style={styles.outerWrapper}>
      {/* Ambient background decorative glow */}
      <div style={styles.ambientGlow} />

      {/* Main Glass Card */}
      <div style={styles.card}>
        {/* Card Header & Theme Switcher */}
        <div style={styles.headerRow}>
          <div style={styles.badge}>
            <Sparkles size={12} style={{ color: 'var(--primary)' }} />
            <span>AI DEVELOPER DIGEST</span>
          </div>
          <div style={styles.themeSwitchWrapper}>
            <ThemeToggleSwitch />
          </div>
        </div>

        {/* Branding */}
        <div style={styles.brandingSection}>
          <div style={styles.logoWrapper}>
            <img
              src="/builders daily-webp.webp"
              alt="Builders Daily"
              style={styles.logoImg}
            />
          </div>
          <h1 style={styles.heading}>
            {isSignUp ? 'Join the Community' : 'Welcome, Builder'}
          </h1>
          <p style={styles.subheading}>
            {isSignUp
              ? 'Create an account to track AI models, trending repos, and papers.'
              : 'Sign in to access your curated daily digest, bookmarks, and stories.'}
          </p>
        </div>

        {/* OAuth Buttons */}
        <div style={styles.oauthContainer}>
          <button
            type="button"
            onClick={() => handleOAuth('github')}
            disabled={isSubmitting}
            style={styles.oauthBtn}
            className="oauth-btn click-effect"
          >
            {oauthLoading === 'github' ? (
              <Loader2 size={18} className="spinner-icon" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            <span style={styles.oauthText}>
              {oauthLoading === 'github' ? 'Connecting to GitHub...' : 'Continue with GitHub'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={isSubmitting}
            style={styles.oauthBtn}
            className="oauth-btn click-effect"
          >
            {oauthLoading === 'google' ? (
              <Loader2 size={18} className="spinner-icon" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span style={styles.oauthText}>
              {oauthLoading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div style={styles.dividerRow}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or continue with email</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div style={styles.alertError}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={styles.alertSuccess}>
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="auth-email" style={styles.label}>
              Email Address
            </label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="auth-input"
                style={styles.input}
                placeholder="developer@builders.daily"
                autoComplete="email"
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label htmlFor="auth-password" style={styles.label}>
                Password
              </label>
              {isSignUp && (
                <span style={styles.hintText}>Min 6 chars</span>
              )}
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="auth-input"
                style={{ ...styles.input, paddingRight: '42px' }}
                placeholder={isSignUp ? 'Choose a secure password' : 'Enter your password'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={styles.submitBtn}
            className="submit-btn click-effect"
          >
            {authLoading && !oauthLoading ? (
              <span style={styles.btnInner}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>{isSignUp ? 'Creating account...' : 'Authenticating...'}</span>
              </span>
            ) : (
              <span style={styles.btnInner}>
                <span>{isSignUp ? 'Create Builder Account' : 'Sign In to Daily'}</span>
                <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div style={styles.footer}>
          <span style={styles.footerText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccessMsg(null);
            }}
            style={styles.toggleModeBtn}
          >
            {isSignUp ? 'Sign In' : 'Create an account'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .oauth-btn:hover {
          background-color: var(--bgCardHover) !important;
          border-color: var(--borderDark) !important;
          transform: translateY(-1px);
        }
        .auth-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.18) !important;
        }
        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45) !important;
        }
      `}} />
    </div>
  );
}

const styles = {
  outerWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '650px',
    height: '650px',
    background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.03) 40%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
    filter: 'blur(30px)',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'var(--bgCard)',
    borderRadius: '24px',
    border: '1px solid var(--borderDark)',
    padding: '36px 32px',
    boxShadow: 'var(--shadow-soft)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '20px',
    backgroundColor: 'var(--primaryTint)',
    border: '1px solid rgba(249, 115, 22, 0.25)',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: 'var(--primary)',
    fontFamily: theme.typography.fontSans,
  },
  themeSwitchWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  brandingSection: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoWrapper: {
    width: '56px',
    height: '56px',
    margin: '0 auto 16px auto',
    borderRadius: '16px',
    backgroundColor: 'var(--bgApp)',
    border: '1px solid var(--borderDark)',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transform: 'scale(1.2)',
  },
  heading: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--textMain)',
    marginBottom: '8px',
    fontFamily: theme.typography.fontSerif,
    letterSpacing: '-0.5px',
  },
  subheading: {
    fontSize: '13px',
    color: 'var(--textMuted)',
    lineHeight: '1.5',
    margin: '0 auto',
    maxWidth: '340px',
    fontFamily: theme.typography.fontSans,
  },
  oauthContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '22px',
  },
  oauthBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--bgApp)',
    color: 'var(--textMain)',
    border: '1px solid var(--borderDark)',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: theme.typography.fontSans,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s ease',
  },
  oauthText: {
    lineHeight: 1,
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
    gap: '12px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--border)',
  },
  dividerText: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--textMuted)',
    fontWeight: '500',
    fontFamily: theme.typography.fontSans,
  },
  alertError: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '12px',
    backgroundColor: 'var(--statusDangerBg)',
    border: '1px solid var(--statusDangerBorder)',
    color: 'var(--statusDanger)',
    fontSize: '13px',
    lineHeight: '1.4',
    marginBottom: '18px',
    fontFamily: theme.typography.fontSans,
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '12px',
    backgroundColor: 'var(--statusSuccessBg)',
    border: '1px solid var(--statusSuccessBorder)',
    color: 'var(--statusSuccess)',
    fontSize: '13px',
    lineHeight: '1.4',
    marginBottom: '18px',
    fontFamily: theme.typography.fontSans,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--textMain)',
    fontFamily: theme.typography.fontSans,
  },
  hintText: {
    fontSize: '11px',
    color: 'var(--textMuted)',
    fontFamily: theme.typography.fontSans,
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--textMuted)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    fontSize: '14px',
    color: 'var(--textMain)',
    backgroundColor: 'var(--bgApp)',
    border: '1px solid var(--borderDark)',
    borderRadius: '12px',
    outline: 'none',
    fontFamily: theme.typography.fontSans,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--textMuted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    marginTop: '6px',
    width: '100%',
    padding: '13px 20px',
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: theme.typography.fontSans,
    letterSpacing: '0.02em',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(249, 115, 22, 0.35)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
  },
  btnInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '18px',
    borderTop: '1px solid var(--border)',
    textAlign: 'center',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    fontFamily: theme.typography.fontSans,
  },
  footerText: {
    color: 'var(--textMuted)',
  },
  toggleModeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    fontSize: '13px',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  }
};
