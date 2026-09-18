"use client";
import { useAdmin } from '@/components/Admin/AdminContext';
import styles from '@/components/Admin/adminStyles';
import { Section } from '@/components/Admin/slots/ReportTabSlot';
import { RefreshCw } from 'lucide-react';

export default function WritersTabSlot() {
  const {
    profiles,
    profilesLoading,
    allowedWriters,
    accessRequests,
    handleToggleWriterAccess
  } = useAdmin();

  return (
    <Section title="✍️ Blog Writers Access" subtitle="Manage which registered community members can publish articles on Builder Daily.">
      <div style={styles.card}>
        {profilesLoading ? (
          <div style={styles.loadingBox}>
            <RefreshCw className="spin" size={24} color="var(--primary)" />
            <span>Loading registered users...</span>
          </div>
        ) : profiles.length === 0 ? (
          <div style={styles.emptyMessageBox}>No registered users found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <div style={styles.tableHeaderRow}>
              <span>MEMBER</span>
              <span>USER ID</span>
              <span style={{ textAlign: 'right' }}>ACCESS PERMISSION</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {profiles.filter(p => p.full_name !== 'Admin Builder').map((profile, idx) => {
                const isAllowed = allowedWriters.includes(profile.id);
                const hasRequested = accessRequests.includes(profile.id);
                const initialChar = (profile.full_name || 'U').charAt(0).toUpperCase();

                return (
                  <div key={profile.id || `profile-${idx}`} style={styles.tableRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={styles.userAvatarInitials}>
                        {initialChar}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--textMain)' }}>
                          {profile.full_name || 'Unnamed User'}
                        </div>
                        {hasRequested && !isAllowed && (
                          <span style={styles.requestedBadge}>
                            Requested Access
                          </span>
                        )}
                      </div>
                    </div>

                    <span style={styles.monoIdText}>{profile.id}</span>

                    <div style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleWriterAccess(profile.id)}
                        style={{
                          ...styles.actionAccessBtn,
                          backgroundColor: isAllowed ? 'var(--statusDangerBg)' : 'var(--statusSuccessBg)',
                          color: isAllowed ? 'var(--statusDanger)' : 'var(--statusSuccess)',
                          borderColor: isAllowed ? 'var(--statusDangerBorder)' : 'var(--statusSuccessBorder)',
                        }}
                      >
                        {isAllowed ? 'Revoke Access' : 'Grant Writer Access'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
