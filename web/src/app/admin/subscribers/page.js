"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Mail, UserPlus, Download, RefreshCw, Search, 
  CheckCircle, ExternalLink, Trash2, Shield, Calendar, Clock, Filter 
} from 'lucide-react';

export default function SubscribersAdminPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'newsletter' | 'waitlist'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'unsubscribed'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSubscribers(data);
      } else {
        console.warn('Subscribers fetch warning:', error?.message);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Compute Metrics
  const totalCount = subscribers.length;
  const newsletterCount = subscribers.filter(s => s.type === 'newsletter' || s.type === 'both').length;
  const waitlistCount = subscribers.filter(s => s.type === 'waitlist' || s.type === 'both').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayNewCount = subscribers.filter(s => s.created_at && s.created_at.startsWith(todayStr)).length;

  // Filter & Search Logic
  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = searchQuery === '' || 
      sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.referral_code?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || sub.type === filterType || sub.type === 'both';
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) return;

    const headers = ['Email', 'Name', 'Type', 'Status', 'Source', 'Referral Code', 'Joined At'];
    const rows = filteredSubscribers.map(sub => [
      `"${sub.email || ''}"`,
      `"${sub.name || ''}"`,
      `"${sub.type || ''}"`,
      `"${sub.status || ''}"`,
      `"${sub.source || ''}"`,
      `"${sub.referral_code || ''}"`,
      `"${sub.created_at ? new Date(sub.created_at).toISOString() : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `builder-daily-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle Status
  const handleToggleStatus = async (sub) => {
    const newStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', sub.id);

      if (!error) {
        setSubscribers(prev => prev.map(item => item.id === sub.id ? { ...item, status: newStatus } : item));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={pageStyles.container}>
      {/* Top Action Header */}
      <div style={pageStyles.topBar}>
        <div>
          <h2 style={pageStyles.pageTitle}>Audience &amp; Subscribers</h2>
          <p style={pageStyles.pageSubtitle}>
            Monitor active newsletter readers, track waitlist leads, and export contacts anytime.
          </p>
        </div>

        <div style={pageStyles.actionBtnGroup}>
          <button 
            onClick={fetchSubscribers} 
            disabled={loading}
            style={pageStyles.secondaryBtn}
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>

          <button 
            onClick={handleExportCSV}
            disabled={filteredSubscribers.length === 0}
            style={pageStyles.secondaryBtn}
            title="Export filtered subscribers to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <a 
            href="https://resend.com"
            target="_blank"
            rel="noopener noreferrer"
            style={pageStyles.primaryLinkBtn}
            title="Open Resend Delivery Dashboard"
          >
            <span>Resend Console</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div style={pageStyles.kpiGrid}>
        <div style={pageStyles.kpiCard}>
          <div style={pageStyles.kpiHeader}>
            <span style={pageStyles.kpiLabel}>Total Audience</span>
            <div style={{ ...pageStyles.kpiIconBox, backgroundColor: 'rgba(249, 115, 22, 0.12)', color: 'var(--primary)' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={pageStyles.kpiValue}>{totalCount}</div>
          <div style={pageStyles.kpiSub}>Lifetime email captures</div>
        </div>

        <div style={pageStyles.kpiCard}>
          <div style={pageStyles.kpiHeader}>
            <span style={pageStyles.kpiLabel}>Newsletter Readers</span>
            <div style={{ ...pageStyles.kpiIconBox, backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
              <Mail size={18} />
            </div>
          </div>
          <div style={pageStyles.kpiValue}>{newsletterCount}</div>
          <div style={pageStyles.kpiSub}>Subscribed to daily dispatches</div>
        </div>

        <div style={pageStyles.kpiCard}>
          <div style={pageStyles.kpiHeader}>
            <span style={pageStyles.kpiLabel}>Waitlist Leads</span>
            <div style={{ ...pageStyles.kpiIconBox, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <UserPlus size={18} />
            </div>
          </div>
          <div style={pageStyles.kpiValue}>{waitlistCount}</div>
          <div style={pageStyles.kpiSub}>Priority early access queue</div>
        </div>

        <div style={pageStyles.kpiCard}>
          <div style={pageStyles.kpiHeader}>
            <span style={pageStyles.kpiLabel}>Today's New Signups</span>
            <div style={{ ...pageStyles.kpiIconBox, backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={pageStyles.kpiValue}>+{todayNewCount}</div>
          <div style={pageStyles.kpiSub}>New members joined today</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={pageStyles.toolbar}>
        <div style={pageStyles.searchBox}>
          <Search size={15} style={pageStyles.searchIcon} />
          <input
            type="text"
            placeholder="Search email, source, or referral code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={pageStyles.searchInput}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={pageStyles.clearBtn}
            >
              ✕
            </button>
          )}
        </div>

        <div style={pageStyles.filterGroup}>
          <div style={pageStyles.pillSelector}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                ...pageStyles.pillBtn,
                ...(filterType === 'all' ? pageStyles.pillBtnActive : {})
              }}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('newsletter')}
              style={{
                ...pageStyles.pillBtn,
                ...(filterType === 'newsletter' ? pageStyles.pillBtnActive : {})
              }}
            >
              Newsletter
            </button>
            <button
              onClick={() => setFilterType('waitlist')}
              style={{
                ...pageStyles.pillBtn,
                ...(filterType === 'waitlist' ? pageStyles.pillBtnActive : {})
              }}
            >
              Waitlist
            </button>
          </div>

          <div style={pageStyles.pillSelector}>
            <button
              onClick={() => setFilterStatus('all')}
              style={{
                ...pageStyles.pillBtn,
                ...(filterStatus === 'all' ? pageStyles.pillBtnActive : {})
              }}
            >
              All Status
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              style={{
                ...pageStyles.pillBtn,
                ...(filterStatus === 'active' ? pageStyles.pillBtnActive : {})
              }}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('unsubscribed')}
              style={{
                ...pageStyles.pillBtn,
                ...(filterStatus === 'unsubscribed' ? pageStyles.pillBtnActive : {})
              }}
            >
              Unsubscribed
            </button>
          </div>
        </div>
      </div>

      {/* Subscribers Table Card */}
      <div style={pageStyles.tableCard}>
        {loading ? (
          <div style={pageStyles.loadingBox}>
            <RefreshCw size={28} className="spin" color="var(--primary)" />
            <p style={{ color: 'var(--textMuted)', fontSize: '14px', marginTop: '12px' }}>
              Loading subscriber database...
            </p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div style={pageStyles.emptyBox}>
            <Mail size={36} color="var(--textMuted)" style={{ opacity: 0.5, marginBottom: '12px' }} />
            <h4 style={{ color: 'var(--textMain)', margin: '0 0 6px', fontSize: '16px' }}>No subscribers found</h4>
            <p style={{ color: 'var(--textMuted)', fontSize: '13.5px', margin: 0 }}>
              {searchQuery || filterType !== 'all' ? 'Try adjusting your search query or filters.' : 'New subscribers will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={pageStyles.table}>
              <thead>
                <tr style={pageStyles.thRow}>
                  <th style={pageStyles.th}>SUBSCRIBER EMAIL</th>
                  <th style={pageStyles.th}>TYPE</th>
                  <th style={pageStyles.th}>SOURCE</th>
                  <th style={pageStyles.th}>STATUS</th>
                  <th style={pageStyles.th}>JOINED DATE</th>
                  <th style={{ ...pageStyles.th, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map(sub => {
                  const isWaitlistType = sub.type === 'waitlist';
                  const isActive = sub.status === 'active';
                  const dateFormatted = sub.created_at 
                    ? new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={sub.id} style={pageStyles.tr}>
                      <td style={pageStyles.td}>
                        <div style={pageStyles.emailCell}>
                          <span style={pageStyles.emailText}>{sub.email}</span>
                          {sub.referral_code && (
                            <span style={pageStyles.referralBadge}>
                              Ref: {sub.referral_code}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={pageStyles.td}>
                        <span style={{
                          ...pageStyles.typeBadge,
                          backgroundColor: isWaitlistType ? 'rgba(249, 115, 22, 0.12)' : 'rgba(99, 102, 241, 0.1)',
                          color: isWaitlistType ? 'var(--primary)' : '#6366f1',
                          borderColor: isWaitlistType ? 'rgba(249, 115, 22, 0.25)' : 'rgba(99, 102, 241, 0.25)',
                        }}>
                          {sub.type}
                        </span>
                      </td>

                      <td style={pageStyles.td}>
                        <span style={pageStyles.sourceBadge}>
                          {sub.source || 'direct'}
                        </span>
                      </td>

                      <td style={pageStyles.td}>
                        <span style={{
                          ...pageStyles.statusBadge,
                          backgroundColor: isActive ? 'var(--statusSuccessBg)' : 'var(--statusNeutralBg)',
                          color: isActive ? 'var(--statusSuccess)' : 'var(--textMuted)',
                        }}>
                          <span style={{
                            ...pageStyles.statusDot,
                            backgroundColor: isActive ? 'var(--statusSuccess)' : 'var(--textMuted)'
                          }} />
                          {sub.status || 'active'}
                        </span>
                      </td>

                      <td style={pageStyles.td}>
                        <span style={pageStyles.dateText}>{dateFormatted}</span>
                      </td>

                      <td style={{ ...pageStyles.td, textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          disabled={actionLoading}
                          style={pageStyles.actionBtn}
                          title={isActive ? "Mark as unsubscribed" : "Re-activate subscriber"}
                        >
                          {isActive ? 'Unsubscribe' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const pageStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontFamily: 'var(--font-heading, system-ui, sans-serif)',
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--textMain)',
    margin: '0 0 6px',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontFamily: 'var(--font-body, system-ui, sans-serif)',
    fontSize: '13.5px',
    color: 'var(--textMuted)',
    margin: 0,
    lineHeight: '1.5',
  },
  actionBtnGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: 'var(--bgCard)',
    border: '1px solid var(--borderDark)',
    borderRadius: '10px',
    color: 'var(--textMain)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  primaryLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.28)',
    transition: 'all 0.15s ease',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    backgroundColor: 'var(--bgCard)',
    border: '1px solid var(--borderDark)',
    borderRadius: '14px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--textMuted)',
  },
  kpiIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '26px',
    fontWeight: '800',
    fontFamily: 'var(--font-heading, system-ui, sans-serif)',
    color: 'var(--textMain)',
    letterSpacing: '-0.025em',
    lineHeight: '1.1',
    marginTop: '4px',
  },
  kpiSub: {
    fontSize: '12px',
    color: 'var(--textMuted)',
    opacity: 0.8,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '1',
    minWidth: '240px',
    maxWidth: '380px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--textMuted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: '38px',
    padding: '0 32px 0 36px',
    backgroundColor: 'var(--bgCard)',
    border: '1px solid var(--borderDark)',
    borderRadius: '10px',
    color: 'var(--textMain)',
    fontSize: '13px',
    outline: 'none',
  },
  clearBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: 'var(--textMuted)',
    cursor: 'pointer',
    fontSize: '12px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  pillSelector: {
    display: 'flex',
    backgroundColor: 'var(--bgCard)',
    border: '1px solid var(--borderDark)',
    borderRadius: '10px',
    padding: '3px',
    gap: '2px',
  },
  pillBtn: {
    background: 'none',
    border: 'none',
    padding: '5px 11px',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--textMuted)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pillBtnActive: {
    backgroundColor: 'var(--bgApp)',
    color: 'var(--textMain)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
  },
  tableCard: {
    backgroundColor: 'var(--bgCard)',
    border: '1px solid var(--borderDark)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
  },
  loadingBox: {
    padding: '64px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyBox: {
    padding: '64px 20px',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1px solid var(--borderDark)',
    backgroundColor: 'var(--bgApp)',
  },
  th: {
    padding: '12px 18px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.06em',
    color: 'var(--textMuted)',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid var(--borderSubtle, rgba(0,0,0,0.03))',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 18px',
    fontSize: '13.5px',
    verticalAlign: 'middle',
  },
  emailCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  emailText: {
    fontWeight: '600',
    color: 'var(--textMain)',
  },
  referralBadge: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: 'var(--textMuted)',
  },
  typeBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '700',
    border: '1px solid',
    textTransform: 'capitalize',
  },
  sourceBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '11.5px',
    backgroundColor: 'var(--bgApp)',
    color: 'var(--textMuted)',
    border: '1px solid var(--borderDark)',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  dateText: {
    color: 'var(--textMuted)',
    fontSize: '12.5px',
  },
  actionBtn: {
    background: 'none',
    border: '1px solid var(--borderDark)',
    padding: '5px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--textMuted)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
