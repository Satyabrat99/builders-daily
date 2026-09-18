"use client";

import { useState } from 'react';
import { Mail, Check, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import styles from './NewsletterForm.module.css';

/**
 * Reusable Newsletter & Waitlist Subscription Form Component
 *
 * @param {Object} props
 * @param {'card'|'inline'|'waitlist'} [props.variant='card'] - Visual layout style
 * @param {'newsletter'|'waitlist'} [props.type='newsletter'] - Subscription intent
 * @param {string} [props.source='website'] - Origin tag for analytics & source tracking
 * @param {string} [props.title] - Custom headline override
 * @param {string} [props.description] - Custom subcopy override
 * @param {string} [props.placeholder] - Custom input placeholder
 * @param {string} [props.buttonText] - Custom submit button label
 * @param {string} [props.className] - Additional wrapper class
 */
export default function NewsletterForm({
  variant = 'card',
  type = 'newsletter',
  source = 'blog',
  theme = 'sunset', // 'sunset' | 'anime'
  title,
  description,
  placeholder,
  buttonText,
  className = '',
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const isWaitlist = type === 'waitlist' || variant === 'waitlist';
  const effectiveType = isWaitlist ? 'waitlist' : 'newsletter';

  // Default Copy
  const defaultTitle = isWaitlist
    ? 'Get Early Access to Builder Daily'
    : 'Get the Daily Intelligence Dispatch';

  const defaultDesc = isWaitlist
    ? 'Join forward-thinking engineers & AI builders. Priority access to sandbox tools, reasoning models, and weekly drop digests.'
    : 'Curated daily teardowns of frontier AI models, research breakthroughs, and real-world experiments delivered straight to your inbox.';

  const defaultPlaceholder = isWaitlist
    ? 'Enter your work or personal email...'
    : 'Enter your email for the dispatch...';

  const defaultBtnText = isWaitlist ? 'Join Waitlist' : 'Subscribe';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setFeedbackMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setFeedbackMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          type: effectiveType,
          source,
          _gotcha: honeypot, // Spam honeypot
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setFeedbackMessage(data.message || 'Subscribed successfully!');
        if (data.referralCode) {
          setReferralCode(data.referralCode);
        }
      } else {
        setStatus('error');
        setFeedbackMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('[NEWSLETTER_SUBMIT_ERROR]', err);
      setStatus('error');
      setFeedbackMessage('Network error. Please try again.');
    }
  };

  const handleReset = () => {
    setEmail('');
    setName('');
    setStatus('idle');
    setFeedbackMessage('');
    setReferralCode('');
  };

  // ─── SUCCESS STATE ────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className={`${variant === 'card' || variant === 'waitlist' ? styles.cardWrapper : styles.inlineWrapper} ${className}`}>
        <div className={styles.successState} role="status" aria-live="polite">
          <div className={styles.successIconBadge}>
            <Check size={22} strokeWidth={2.5} />
          </div>
          <div className={styles.successContent}>
            <h4 className={styles.successTitle}>
              {isWaitlist ? "You're on the waitlist!" : "You're subscribed!"}
            </h4>
            <p className={styles.successDesc}>
              {feedbackMessage || "We've sent a confirmation dispatch to your inbox. Check your promotions/spam folder if it doesn't appear."}
            </p>
            {referralCode && (
              <div>
                <span className={styles.referralPill}>
                  Invite code: <strong>{referralCode}</strong>
                </span>
              </div>
            )}
            <button onClick={handleReset} className={styles.resetBtn} type="button">
              Subscribe another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── FOOTER VARIANT (SOLID & AESTHETIC) ───────────────────────────────────
  if (variant === 'footer') {
    return (
      <div className={`${styles.footerBox} ${className}`} aria-labelledby="footer-newsletter-title">
        <div className={styles.footerHeader}>
          <div className={styles.footerKicker}>NEWSLETTER</div>
          <h4 id="footer-newsletter-title" className={styles.footerTitle}>
            Stay in the <span className={styles.footerHighlight}>loop</span>
          </h4>
          <p className={styles.footerDesc}>
            {description || 'A short weekly update on projects, experiments, and tools.'}
          </p>
        </div>

        {status === 'success' ? (
          <div className={styles.footerSuccess} role="status" aria-live="polite">
            <div className={styles.footerSuccessBadge}>
              <Check size={16} strokeWidth={2.5} />
            </div>
            <div className={styles.footerSuccessText}>
              <p className={styles.footerSuccessHeading}>You&apos;re subscribed!</p>
              <p className={styles.footerSuccessSub}>
                {feedbackMessage || "Check your inbox for our latest dispatch."}
              </p>
              <button onClick={handleReset} className={styles.footerResetBtn} type="button">
                Subscribe another email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.footerForm} noValidate>
            <input
              type="text"
              name="_gotcha"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: 'none' }}
              tabIndex="-1"
              autoComplete="off"
            />

            <div className={styles.footerInputGroup}>
              <div className={styles.footerInputWrap}>
                <Mail size={15} className={styles.footerInputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder={placeholder || 'Enter your email...'}
                  disabled={status === 'loading'}
                  required
                  className={styles.footerInput}
                  aria-label="Email address"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={styles.footerSubmitBtn}
              >
                {status === 'loading' ? (
                  <Loader2 size={14} className={styles.spinner} />
                ) : (
                  <>
                    <span>{buttonText || 'Subscribe'}</span>
                    <ArrowRight size={14} className={styles.footerArrow} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {status === 'error' && (
          <div className={styles.footerError} role="alert">
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // ─── PANORAMIC VARIANT (PREMIUM AI STARTUP SCENIC - KEPT UNUSED) ────────
  if (variant === 'panoramic') {
    return (
      <aside
        className={`${styles.scenicCard} ${theme === 'anime' ? styles.scenicAnime : styles.scenicSunset} ${className}`}
        aria-labelledby="newsletter-scenic-heading"
      >
        <div className={styles.scenicBackdrop} aria-hidden="true" />
        <div className={styles.scenicOverlay} aria-hidden="true" />

        <div className={styles.scenicContent}>
          <h2 id="newsletter-scenic-heading" className={styles.scenicTitle}>
            Stay in the <span className={styles.scenicHighlight}>loop</span>
          </h2>

          <p className={styles.scenicDesc}>
            {description || 'Get the latest experiments, ideas and insights delivered directly to your inbox.'}
          </p>

          {status === 'success' ? (
            <div className={styles.scenicSuccess} role="status" aria-live="polite">
              <div className={styles.successIconBadge}>
                <Check size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className={styles.scenicSuccessTitle}>You&apos;re in the loop</h4>
                <p className={styles.scenicSuccessDesc}>
                  {feedbackMessage || "We've sent a welcome dispatch to your inbox."}
                </p>
                <button onClick={handleReset} className={styles.scenicResetBtn} type="button">
                  Subscribe another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.scenicForm} noValidate>
              <input
                type="text"
                name="_gotcha"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex="-1"
                autoComplete="off"
              />

              <div className={styles.scenicInputWrapper}>
                <Mail size={16} className={styles.scenicMailIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder={placeholder || 'Enter your email...'}
                  disabled={status === 'loading'}
                  required
                  className={styles.scenicInput}
                  aria-label="Email address"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={styles.scenicBtn}
              >
                {status === 'loading' ? (
                  <Loader2 size={15} className={styles.spinner} />
                ) : (
                  <>
                    <span>{buttonText || 'Subscribe'}</span>
                    <ArrowRight size={15} className={styles.scenicArrow} />
                  </>
                )}
              </button>
            </form>
          )}

          {status === 'error' && (
            <div className={styles.scenicError} role="alert">
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // ─── INLINE VARIANT ───────────────────────────────────────────────────────
  if (variant === 'inline') {
    return (
      <div className={`${styles.inlineWrapper} ${className}`}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Bot Honeypot */}
          <input
            type="text"
            name="_gotcha"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex="-1"
            autoComplete="off"
          />

          <div className={styles.inputWrapper}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder={placeholder || defaultPlaceholder}
              disabled={status === 'loading'}
              required
              className={styles.input}
              aria-label="Email address"
            />
            <Mail size={16} className={styles.inputIcon} />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className={styles.submitBtn}
          >
            {status === 'loading' ? (
              <Loader2 size={16} className={styles.spinner} />
            ) : (
              <>
                <span>{buttonText || defaultBtnText}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {status === 'error' && (
          <div className={styles.messageBox} role="alert">
            <span className={styles.errorText}>{feedbackMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // ─── CARD / WAITLIST VARIANT ──────────────────────────────────────────────
  return (
    <aside
      className={`${styles.cardWrapper} ${className}`}
      aria-labelledby="newsletter-card-heading"
    >
      <div className={styles.cardGlow} aria-hidden="true" />

      <div className={styles.cardHeader}>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            {isWaitlist ? 'Priority Access' : 'Daily Dispatch'}
          </span>
        </div>

        <h3 id="newsletter-card-heading" className={styles.cardTitle}>
          {title || defaultTitle}
        </h3>
        <p className={styles.cardDesc}>
          {description || defaultDesc}
        </p>

        {/* Feature perks */}
        <ul className={styles.perksList}>
          <li className={styles.perkItem}>
            <Sparkles size={14} className={styles.perkIcon} />
            <span>Zero fluff or hype</span>
          </li>
          <li className={styles.perkItem}>
            <ShieldCheck size={14} className={styles.perkIcon} />
            <span>1-click unsubscribe anytime</span>
          </li>
          <li className={styles.perkItem}>
            <Mail size={14} className={styles.perkIcon} />
            <span>Direct to your inbox daily</span>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Bot Honeypot */}
        <input
          type="text"
          name="_gotcha"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ display: 'none' }}
          tabIndex="-1"
          autoComplete="off"
        />

        <div className={styles.inputWrapper}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder={placeholder || defaultPlaceholder}
            disabled={status === 'loading'}
            required
            className={styles.input}
            aria-label="Email address"
          />
          <Mail size={16} className={styles.inputIcon} />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className={styles.submitBtn}
        >
          {status === 'loading' ? (
            <Loader2 size={16} className={styles.spinner} />
          ) : (
            <>
              <span>{buttonText || defaultBtnText}</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {status === 'error' && (
        <div className={styles.messageBox} role="alert">
          <span className={styles.errorText}>{feedbackMessage}</span>
        </div>
      )}
    </aside>
  );
}
