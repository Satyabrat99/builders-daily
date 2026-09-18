"use client";
import { useAdmin } from '@/components/Admin/AdminContext';
import styles from '@/components/Admin/adminStyles';
import { Section } from '@/components/Admin/slots/ReportTabSlot';
import { Terminal, Save, Activity, Trash2, RefreshCw } from 'lucide-react';

export default function MarketingTabSlot() {
  const {
    customAnalytics,
    setCustomAnalytics,
    handleSaveCustomAnalytics,
    userEvents,
    eventsLoading,
    handleClearEvents
  } = useAdmin();

  return (
    <div style={styles.grid}>
      <Section title="📊 Analytics Tag Manager" subtitle="Insert custom scripts (Google Analytics, Umami, Plausible, PostHog) injected globally.">
        <div style={styles.card}>
          <div style={styles.codeHeaderRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={15} color="var(--primary)" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--textMain)' }}>Root Header Script Payload</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--textMuted)' }}>Injected at &lt;head&gt;</span>
          </div>
          <textarea
            style={styles.codeTextarea}
            value={customAnalytics}
            onChange={(e) => setCustomAnalytics(e.target.value)}
            placeholder="<!-- Paste tracking scripts here (e.g. <script async defer src='...'></script>) -->"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button onClick={handleSaveCustomAnalytics} style={styles.primaryActionBtn}>
              <Save size={15} />
              <span>Save Tracking Script</span>
            </button>
          </div>
        </div>
      </Section>

      <Section title="⚡ Real-Time User Event Logs" subtitle="Live stream of telemetry and reader engagement events.">
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--primary)" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--textMain)' }}>
                Recent Activity Feed ({userEvents.length})
              </span>
            </div>
            <button onClick={handleClearEvents} style={styles.clearLogsBtn}>
              <Trash2 size={13} />
              <span>Clear Logs</span>
            </button>
          </div>

          {eventsLoading ? (
            <div style={styles.loadingBox}>
              <RefreshCw className="spin" size={20} color="var(--primary)" />
              <span>Loading tracking telemetry...</span>
            </div>
          ) : userEvents.length === 0 ? (
            <div style={styles.emptyMessageBox}>
              No user events logged yet. Clicks and interactions will stream here in real time.
            </div>
          ) : (
            <div style={styles.terminalContainer}>
              {userEvents.map((evt) => (
                <div key={evt.key} style={styles.terminalLogRow}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={styles.eventChip}>
                      {evt.event_name}
                    </span>
                    <span style={styles.eventTimestamp}>
                      {new Date(evt.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.eventUrl}>
                    <strong>Path:</strong> {evt.metadata?.url || 'unknown'}
                  </div>
                  {evt.metadata && Object.keys(evt.metadata).filter(k => k !== 'url' && k !== 'timestamp').length > 0 && (
                    <div style={styles.metadataCodeBox}>
                      {JSON.stringify(Object.fromEntries(Object.entries(evt.metadata).filter(([k]) => k !== 'url' && k !== 'timestamp')))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
