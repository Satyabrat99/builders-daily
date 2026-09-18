"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/components/Admin/AdminContext';
import styles from '@/components/Admin/adminStyles';
import { 
  Shield, ArrowUpRight, Save, RefreshCw, AlertTriangle, CheckCircle, 
  LayoutDashboard, Megaphone, Sparkles, Sliders, Users, BarChart3, Mail, Gift 
} from 'lucide-react';

export default function AdminLayoutShell({ children }) {
  const {
    ADMIN_EMAIL,
    user,
    authLoading,
    loading,
    report,
    saving,
    message,
    setMessage,
    handlePublish,
    promos,
    gems,
    accessRequests,
    userEvents,
    subscribersCount
  } = useAdmin();

  const pathname = usePathname();
  const activeTab = pathname.split('/')[2] || 'report';

  const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'true';

  // Auth Guard
  if (authLoading && !isPreview) {
    return (
      <div style={styles.stateContainer}>
        <RefreshCw className="spin" size={36} color="var(--primary)" />
        <p style={{ fontSize: '15px', color: 'var(--textMuted)', fontWeight: '500' }}>Loading session...</p>
      </div>
    );
  }

  if (!isPreview && (!user || user.email !== ADMIN_EMAIL)) {
    return (
      <div style={styles.stateContainer}>
        <div style={{ padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', marginBottom: '8px' }}>
          <AlertTriangle size={40} color="#ef4444" />
        </div>
        <h1 style={styles.stateTitle}>Access Denied</h1>
        <p style={styles.stateText}>You do not have permission to access the builder controller.</p>
        <Link href="/" style={styles.backHomeBtn}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (loading && !isPreview) {
    return (
      <div style={styles.stateContainer}>
        <RefreshCw className="spin" size={36} color="var(--primary)" />
        <p style={{ fontSize: '15px', color: 'var(--textMuted)', fontWeight: '500' }}>Fetching latest draft & system state...</p>
      </div>
    );
  }

  const tabItems = [
    { id: 'report', href: '/admin/report', label: 'Report Controller', icon: LayoutDashboard },
    { id: 'promos', href: '/admin/promos', label: 'Promo Slider', icon: Megaphone, count: promos.length },
    { id: 'gems', href: '/admin/gems', label: 'Featured Gems', icon: Sparkles, count: gems.length },
    { id: 'goodies', href: '/admin/goodies', label: 'Goodies Vault', icon: Gift },
    { id: 'subscribers', href: '/admin/subscribers', label: 'Audience & Leads', icon: Mail, count: subscribersCount || 0 },
    { id: 'settings', href: '/admin/settings', label: 'Site Settings', icon: Sliders },
    { id: 'writers', href: '/admin/writers', label: 'Blog Writers', icon: Users, count: accessRequests.length > 0 ? `${accessRequests.length} pending` : null, alert: accessRequests.length > 0 },
    { id: 'marketing', href: '/admin/marketing', label: 'Analytics & Logs', icon: BarChart3, count: userEvents.length },
  ];

  return (
    <div style={styles.container}>
      {/* Sleek Command Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.breadcrumbRow}>
            <span style={styles.systemBadge}>
              <Shield size={12} color="var(--primary)" />
              BUILDER DAILY COMMAND
            </span>
            <span style={styles.breadcrumbDivider}>/</span>
            <span style={styles.breadcrumbActive}>
              {tabItems.find(t => t.id === activeTab)?.label || 'Console'}
            </span>
          </div>
          <h1 style={styles.title}>Admin Control Center</h1>
          <p style={styles.subtitle}>Curate AI-generated feeds, manage interactive widgets, and configure platform settings.</p>
        </div>

        <div style={styles.headerActions}>
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={styles.liveSiteBtn}
            title="Open live dashboard in new tab"
          >
            <span>Live Site</span>
            <ArrowUpRight size={15} />
          </a>

          {report?.status === 'published' ? (
            <div style={styles.statusBadgeLive}>
              <span style={styles.livePulse} />
              <span>LIVE ON DASHBOARD</span>
            </div>
          ) : report ? (
            <div style={styles.statusBadgeDraft}>
              <span style={styles.draftPulse} />
              <span>DRAFT STAGED</span>
            </div>
          ) : null}

          {report && (
            <button 
              onClick={handlePublish} 
              disabled={saving} 
              style={{
                ...styles.publishBtn,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? <RefreshCw className="spin" size={16} /> : <Save size={16} />}
              <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Alert Notification */}
      {message.text && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === 'error' ? 'var(--statusDangerBg)' : 'var(--statusSuccessBg)',
          borderColor: message.type === 'error' ? 'var(--statusDangerBorder)' : 'var(--statusSuccessBorder)',
          color: message.type === 'error' ? 'var(--statusDanger)' : 'var(--statusSuccess)'
        }}>
          {message.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage({ type: '', text: '' })} 
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2-Column Vertical Workspace: Navigation Rail on Left, Content on Right */}
      <div style={styles.adminWorkspace}>
        {/* Left Vertical Navigation Rail */}
        <aside style={styles.verticalNavSidebar} aria-label="Admin console navigation">
          <div style={styles.verticalNavGroup}>
            <div style={styles.navGroupHeader}>CONTROL TABS</div>
            {tabItems.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  style={{
                    ...styles.verticalTab,
                    backgroundColor: isActive ? 'var(--bgCardHover)' : 'transparent',
                    color: isActive ? 'var(--textMain)' : 'var(--textMuted)',
                    borderColor: isActive ? 'var(--borderDark)' : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
                  }}
                >
                  <div style={{
                    ...styles.verticalTabIndicator,
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent'
                  }} />
                  <Icon size={16} color={isActive ? 'var(--primary)' : 'currentColor'} style={{ flexShrink: 0 }} />
                  <span style={styles.verticalTabLabel}>{tab.label}</span>
                  {tab.count !== undefined && tab.count !== null && (
                    <span style={{
                      ...styles.tabCount,
                      marginLeft: 'auto',
                      backgroundColor: tab.alert ? 'rgba(245, 158, 11, 0.15)' : isActive ? 'var(--primary)' : 'var(--borderDark)',
                      color: tab.alert ? '#f59e0b' : isActive ? '#ffffff' : 'var(--textMuted)',
                    }}>
                      {tab.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div style={styles.verticalNavDivider} />

          <div style={styles.verticalNavGroup}>
            <div style={styles.navGroupHeader}>CONTENT MANAGEMENT</div>
            <Link 
              href="/admin-blog" 
              style={styles.blogLinkVertical}
            >
              <ArrowUpRight size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span style={styles.verticalTabLabel}>📝 Blog CMS</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <section style={styles.verticalContentArea} aria-label="Tab content">
          {children}
        </section>
      </div>
    </div>
  );
}
