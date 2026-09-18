"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Gift, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  AlertCircle,
  Link as LinkIcon,
  Check
} from 'lucide-react';

const PLATFORMS = [
  { id: 'sheets', label: 'Google Sheet' },
  { id: 'notion', label: 'Notion OS' },
  { id: 'figma', label: 'Figma Kit' },
  { id: 'cursorrules', label: 'Cursor Rules' },
  { id: 'code', label: 'Open Source' },
  { id: 'legal', label: 'Legal / SAFE' },
  { id: 'tool', label: 'Free Tool' }
];

const CATEGORIES = ['Vibecoders', 'SaaS Builders', 'Series Founders'];

export default function ReachUsModal({ isOpen = false, onClose, initialTab = 'goody' }) {
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(isOpen);
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Goody submission state
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SaaS Builders');
  const [platform, setPlatform] = useState('tool');
  const [authorName, setAuthorName] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [submittingGoody, setSubmittingGoody] = useState(false);
  const [goodySuccess, setGoodySuccess] = useState(false);
  const [goodyError, setGoodyError] = useState('');

  // Feedback state
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('Feedback');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync isOpen prop
  useEffect(() => {
    setModalOpen(isOpen);
    if (isOpen) {
      setActiveTab(initialTab);
      setGoodySuccess(false);
      setFeedbackSuccess(false);
      setGoodyError('');
    }
  }, [isOpen, initialTab]);

  // Listen for global custom event
  useEffect(() => {
    const handleOpenEvent = (e) => {
      setModalOpen(true);
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
      setGoodySuccess(false);
      setFeedbackSuccess(false);
      setGoodyError('');
    };

    window.addEventListener('open-reach-us', handleOpenEvent);
    return () => window.removeEventListener('open-reach-us', handleOpenEvent);
  }, []);

  // Escape key handler & scroll lock
  useEffect(() => {
    if (!modalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    // Prevent body background scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen]);

  const handleClose = () => {
    setModalOpen(false);
    if (onClose) onClose();
  };

  // Auto-detect platform from URL
  const handleUrlChange = (val) => {
    setUrl(val);
    const lower = val.toLowerCase();
    if (lower.includes('docs.google.com/spreadsheets')) setPlatform('sheets');
    else if (lower.includes('notion.so') || lower.includes('notion.site')) setPlatform('notion');
    else if (lower.includes('figma.com')) setPlatform('figma');
    else if (lower.includes('cursorrules') || lower.includes('.mdc') || lower.includes('cursor.directory')) setPlatform('cursorrules');
    else if (lower.includes('github.com')) setPlatform('code');
  };

  const handleSubmitGoody = async (e) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) {
      setGoodyError('Resource URL and Title are required.');
      return;
    }

    setSubmittingGoody(true);
    setGoodyError('');

    try {
      const res = await fetch('/api/goodies/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          resource_url: url.trim(),
          description: description.trim(),
          category,
          platform,
          author_name: authorName.trim() || 'Community Builder',
          author_handle: authorHandle.trim() || null
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGoodySuccess(true);
        setUrl('');
        setTitle('');
        setDescription('');
        setAuthorName('');
        setAuthorHandle('');
      } else {
        setGoodyError(data.error || 'Failed to submit resource. Please try again.');
      }
    } catch (err) {
      setGoodyError('Network error. Please check connection and retry.');
    } finally {
      setSubmittingGoody(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setSubmittingFeedback(true);
    try {
      // Simulate feedback reception
      await new Promise(r => setTimeout(r, 500));
      setFeedbackSuccess(true);
      setFeedbackMessage('');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (!mounted || !modalOpen) return null;

  const modalContent = (
    <div style={styles.overlay} onClick={handleClose}>
      <style>{`
        @keyframes reachUsOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes reachUsModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          style={styles.closeBtn} 
          title="Close modal"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header Navigation */}
        <div style={styles.tabHeader}>
          <button
            onClick={() => setActiveTab('goody')}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'goody' ? '#10b981' : 'transparent',
              color: activeTab === 'goody' ? 'var(--textMain)' : 'var(--textMuted)',
              fontWeight: activeTab === 'goody' ? '700' : '500'
            }}
          >
            <Gift size={16} color={activeTab === 'goody' ? '#10b981' : 'currentColor'} />
            <span>Share a Goody</span>
            <span style={styles.vaultBadge}>VAULT</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'feedback' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'feedback' ? 'var(--textMain)' : 'var(--textMuted)',
              fontWeight: activeTab === 'feedback' ? '700' : '500'
            }}
          >
            <MessageSquare size={16} color={activeTab === 'feedback' ? 'var(--primary)' : 'currentColor'} />
            <span>Reach Us & Feedback</span>
          </button>
        </div>

        {/* Modal Content */}
        <div style={styles.body}>
          {activeTab === 'goody' ? (
            goodySuccess ? (
              <div style={styles.successContainer}>
                <div style={styles.successIconWrapper}>
                  <CheckCircle2 size={40} color="#10b981" />
                </div>
                <h3 style={styles.successTitle}>Goody Submitted to Vault!</h3>
                <p style={styles.successText}>
                  Thank you for contributing to Builder Daily. Our team reviews submissions for authenticity and indexes approved gems in the daily digest.
                </p>
                <div style={styles.successActions}>
                  <button 
                    onClick={() => setGoodySuccess(false)}
                    style={styles.secondaryBtn}
                  >
                    Submit Another Link
                  </button>
                  <button 
                    onClick={handleClose}
                    style={styles.primaryEmeraldBtn}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitGoody} style={styles.form}>
                <div style={styles.introBox}>
                  <div style={styles.introHeader}>
                    <Sparkles size={15} color="#10b981" />
                    <span style={styles.introTitle}>Curate for 10k+ Builders</span>
                  </div>
                  <p style={styles.introText}>
                    Found a game-changing Google Sheet, Notion OS, Figma UI kit, or .cursorrules? Share it here to get indexed in the daily digest vault.
                  </p>
                </div>

                {goodyError && (
                  <div style={styles.errorBox}>
                    <AlertCircle size={15} color="#ef4444" />
                    <span>{goodyError}</span>
                  </div>
                )}

                {/* Resource URL */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Resource URL / Link <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputIconWrapper}>
                    <LinkIcon size={15} style={styles.inputIcon} />
                    <input 
                      type="url"
                      required
                      placeholder="https://docs.google.com/spreadsheets/d/... or notion.so/..."
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      style={styles.inputWithIcon}
                    />
                  </div>
                </div>

                {/* Title */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Resource Title <span style={styles.required}>*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 500+ VC & Angel Investor Spreadsheet (2025)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                  />
                </div>

                {/* Two-Column Grid: Audience & Platform */}
                <div style={styles.twoCol}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Builder Audience</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      style={styles.select}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Resource Platform</label>
                    <select 
                      value={platform} 
                      onChange={(e) => setPlatform(e.target.value)}
                      style={styles.select}
                    >
                      {PLATFORMS.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Two-Column Grid: Creator & Handle */}
                <div style={styles.twoCol}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Creator / Author Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Bob Smith"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>X / Profile Handle</label>
                    <input 
                      type="text"
                      placeholder="e.g. @buildwithbob"
                      value={authorHandle}
                      onChange={(e) => setAuthorHandle(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Description */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Short Note / Description (Optional)</label>
                  <textarea 
                    rows={2}
                    placeholder="Why is this resource valuable for builders?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                  />
                </div>

                {/* Submit Action */}
                <div style={styles.submitRow}>
                  <button 
                    type="submit" 
                    disabled={submittingGoody}
                    style={{
                      ...styles.primaryEmeraldBtn,
                      opacity: submittingGoody ? 0.7 : 1,
                      cursor: submittingGoody ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Send size={14} />
                    <span>{submittingGoody ? 'Submitting...' : 'Submit to Goodies Vault'}</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            feedbackSuccess ? (
              <div style={styles.successContainer}>
                <div style={styles.successIconWrapper}>
                  <CheckCircle2 size={40} color="#10b981" />
                </div>
                <h3 style={styles.successTitle}>Message Received!</h3>
                <p style={styles.successText}>
                  Thanks for reaching out! The Builder Daily team reads every message and will get back to you if requested.
                </p>
                <button onClick={handleClose} style={styles.primaryBtn}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} style={styles.form}>
                <div style={styles.introBox}>
                  <div style={styles.introHeader}>
                    <MessageSquare size={15} color="var(--primary)" />
                    <span style={styles.introTitle}>Direct line to the team</span>
                  </div>
                  <p style={styles.introText}>
                    Have a feature suggestion, partnership proposal, sponsorship inquiry, or bug report? We want to hear from you.
                  </p>
                </div>

                <div style={styles.twoCol}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Your Email</label>
                    <input 
                      type="email"
                      placeholder="you@company.com"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Topic</label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      style={styles.select}
                    >
                      <option value="Feedback">Product Feedback</option>
                      <option value="Idea">New Section / Feature Idea</option>
                      <option value="Sponsorship">Sponsorship & Promo</option>
                      <option value="Bug">Bug Report</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Message <span style={styles.required}>*</span>
                  </label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Tell us what's on your mind or how we can help you build better..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.submitRow}>
                  <button 
                    type="submit" 
                    disabled={submittingFeedback}
                    style={styles.primaryBtn}
                  >
                    <Send size={14} />
                    <span>{submittingFeedback ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    padding: '16px',
    boxSizing: 'border-box',
    animation: 'reachUsOverlayIn 0.2s ease forwards'
  },
  modal: {
    backgroundColor: 'var(--bgCard, #18181b)',
    color: 'var(--textMain, #ffffff)',
    border: '1px solid var(--border, rgba(255, 255, 255, 0.12))',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '540px',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    animation: 'reachUsModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
  },
  closeBtn: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    background: 'none',
    border: 'none',
    color: 'var(--textMuted, #a1a1aa)',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    zIndex: 10
  },
  tabHeader: {
    display: 'flex',
    borderBottom: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
    padding: '0 16px',
    backgroundColor: 'var(--bgApp, #09090b)'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '15px 14px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  vaultBadge: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '2px 6px',
    borderRadius: '6px',
    letterSpacing: '0.04em'
  },
  body: {
    padding: '22px',
    maxHeight: 'calc(85vh - 60px)',
    overflowY: 'auto'
  },
  introBox: {
    padding: '12px 14px',
    borderRadius: '12px',
    backgroundColor: 'var(--bgApp, #09090b)',
    border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
    marginBottom: '16px'
  },
  introHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  },
  introTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--textMain, #ffffff)'
  },
  introText: {
    fontSize: '12px',
    color: 'var(--textMuted, #a1a1aa)',
    margin: 0,
    lineHeight: '1.5'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--textMain, #ffffff)'
  },
  required: {
    color: '#ff5a12'
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border, rgba(255, 255, 255, 0.15))',
    backgroundColor: 'var(--bgApp, #09090b)',
    color: 'var(--textMain, #ffffff)',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  inputIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--textMuted, #a1a1aa)'
  },
  inputWithIcon: {
    width: '100%',
    padding: '9px 12px 9px 36px',
    borderRadius: '10px',
    border: '1px solid var(--border, rgba(255, 255, 255, 0.15))',
    backgroundColor: 'var(--bgApp, #09090b)',
    color: 'var(--textMain, #ffffff)',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  twoCol: {
    display: 'flex',
    gap: '10px'
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border, rgba(255, 255, 255, 0.15))',
    backgroundColor: 'var(--bgApp, #09090b)',
    color: 'var(--textMain, #ffffff)',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border, rgba(255, 255, 255, 0.15))',
    backgroundColor: 'var(--bgApp, #09090b)',
    color: 'var(--textMain, #ffffff)',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '4px'
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px',
    backgroundColor: 'var(--primary, #ff5a12)',
    color: '#ffffff',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(255, 90, 18, 0.3)'
  },
  primaryEmeraldBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    color: 'var(--textMain, #ffffff)',
    border: '1px solid var(--border, rgba(255, 255, 255, 0.15))',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '24px 12px'
  },
  successIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  successTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--textMain, #ffffff)',
    margin: '0 0 8px'
  },
  successText: {
    fontSize: '13px',
    color: 'var(--textMuted, #a1a1aa)',
    lineHeight: '1.6',
    maxWidth: '380px',
    margin: '0 0 22px'
  },
  successActions: {
    display: 'flex',
    gap: '12px'
  }
};
