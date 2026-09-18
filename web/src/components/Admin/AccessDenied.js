"use client";
import { useState, useEffect } from 'react';
import { requestWriterAccess, checkRequestStatus } from '@/lib/requestAccess';
import Link from 'next/link';

export default function AccessDenied({ user }) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function initCheck() {
      if (user?.id) {
        const isAlreadyRequested = await checkRequestStatus(user.id);
        setRequested(isAlreadyRequested);
      }
      setChecking(false);
    }
    initCheck();
  }, [user]);

  const handleRequest = async () => {
    if (!user) return alert("Please log in first.");
    setLoading(true);
    const res = await requestWriterAccess(user.id);
    setLoading(false);
    if (res.error) {
      alert("Failed to submit request: " + res.error);
    } else {
      setRequested(true);
      alert("Access request submitted successfully to admin!");
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      fontFamily: 'var(--font-article, "DM Sans", sans-serif)',
      padding: '24px',
      textAlign: 'center',
      gap: '18px',
      backgroundColor: 'var(--color-newsprint-cream)',
      color: 'var(--color-ink)'
    }}>
      <div style={{
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        color: '#f97316',
        borderRadius: '50%',
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '8px'
      }}>
        !
      </div>
      
      <h2 style={{ 
        fontSize: '26px', 
        fontWeight: '700', 
        color: 'var(--color-heading)',
        margin: 0,
        letterSpacing: '-0.02em'
      }}>
        Access Restricted
      </h2>
      
      <p style={{ 
        fontSize: '15px', 
        color: 'var(--color-body-text)', 
        maxWidth: '440px', 
        lineHeight: '1.6', 
        margin: '0 0 12px 0' 
      }}>
        To write articles or share stories on Builders Daily, you need writer permissions from the admin.
      </p>

      {checking ? (
        <div style={{ color: 'var(--color-meta)', fontSize: '14px' }}>Checking request status...</div>
      ) : (
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          {requested ? (
            <button
              disabled
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.06)',
                color: 'var(--color-meta)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'not-allowed'
              }}
            >
              Request Pending Admin Approval
            </button>
          ) : (
            <button
              onClick={handleRequest}
              disabled={loading}
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                backgroundColor: '#f97316',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.25)',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? 'Submitting...' : 'Request Access'}
            </button>
          )}
          
          <Link
            href="/blog"
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.15)',
              color: 'var(--color-heading)',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              backgroundColor: 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            Go to Blog
          </Link>
        </div>
      )}
    </div>
  );
}
