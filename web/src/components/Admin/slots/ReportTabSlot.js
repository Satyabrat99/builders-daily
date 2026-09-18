"use client";
import { useAdmin } from '@/components/Admin/AdminContext';
import styles from '@/components/Admin/adminStyles';
import { Sparkles, RefreshCw, Calendar, Eye, Plus } from 'lucide-react';

/* SECTION HELPER */
function Section({ title, subtitle, children, contentStyle = {} }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitleBlock}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
      <div style={{ ...styles.sectionContent, ...contentStyle }}>
        {children}
      </div>
    </div>
  );
}

/* ARRAY SECTION (CURATION ITEMS) */
function ArraySection({ title, subtitle, items, onUpdate, onAdd, isProduct = false, hideImage = false }) {
  return (
    <div style={styles.section}>
      <div style={styles.arraySectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>{title}</h2>
          {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
        </div>
        <button onClick={onAdd} style={styles.addPrimaryBtn}>
          <Plus size={14} />
          <span>Add Item</span>
        </button>
      </div>

      <div style={styles.arrayGrid}>
        {items.map((item, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.itemIndexRow}>
              <span style={styles.itemIndexPill}>ITEM #{idx + 1}</span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>{isProduct ? 'PRODUCT NAME' : 'TITLE'}</label>
              <input 
                style={{ ...styles.input, fontWeight: '700' }} 
                value={item.title || item.name || ''} 
                onChange={(e) => onUpdate(idx, isProduct ? 'name' : 'title', e.target.value)}
                placeholder="Title"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>LINK URL</label>
              <input 
                style={styles.input} 
                value={item.url || ''} 
                onChange={(e) => onUpdate(idx, 'url', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>DESCRIPTION</label>
              <textarea 
                style={styles.textarea} 
                value={item.description || ''} 
                onChange={(e) => onUpdate(idx, 'description', e.target.value)}
                placeholder="Concise summary for builders..."
              />
            </div>

            {!hideImage && (
              <div style={styles.imageInputRow}>
                <div style={styles.imgPreview}>
                  {(item.image || item.thumbnail) ? (
                    <img src={item.image || item.thumbnail} alt="" style={styles.preview} />
                  ) : (
                    <div style={styles.noImgPlaceholder}>No Img</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.inputLabel}>THUMBNAIL IMAGE URL</label>
                  <input 
                    style={{ ...styles.input, fontSize: '12px' }} 
                    value={item.image || item.thumbnail || ''} 
                    onChange={(e) => onUpdate(idx, isProduct ? 'thumbnail' : 'image', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportTabSlot() {
  const {
    report,
    setReport,
    handleUpdateDailyReport,
    handleUpdateField,
    handleAddItem,
    fetchDraft,
    archives,
    archivesLoading,
    setMessage
  } = useAdmin();

  const { content_json } = report || {};

  return (
    <>
      {report && content_json ? (
        <div style={styles.grid}>
          {/* Daily Report Highlights */}
          <Section 
            title="🏆 Daily Report Highlights" 
            subtitle="Primary spotlight of the day featured on top of the dashboard feed."
          >
            <div style={styles.bentoGrid}>
              {Object.entries(content_json.dailyReport || {}).map(([key, item]) => (
                <div key={key} style={styles.card}>
                  <div style={styles.cardTopRow}>
                    <div style={styles.categoryPill}>
                      <Sparkles size={12} color="var(--primary)" />
                      <span>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>FEATURED TITLE / NAME</label>
                    <input 
                      style={styles.input} 
                      value={item.name || ''} 
                      onChange={(e) => handleUpdateDailyReport(key, 'name', e.target.value)}
                      placeholder="e.g. Claude 3.7 Sonnet"
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>TARGET URL</label>
                    <input 
                      style={styles.input} 
                      value={item.url || ''} 
                      onChange={(e) => handleUpdateDailyReport(key, 'url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Feed Arrays */}
          <ArraySection 
            title="🐙 Trending Repos" 
            subtitle="Curated open source repositories shaping AI & software development."
            items={content_json.repos || []} 
            onUpdate={(idx, f, v) => handleUpdateField('repos', idx, f, v)} 
            onAdd={() => handleAddItem('repos')}
            hideImage={true}
          />

          <ArraySection 
            title="📰 HackerNews Picks" 
            subtitle="Top technical and philosophical threads from the HackerNews firehose."
            items={content_json.hn || []} 
            onUpdate={(idx, f, v) => handleUpdateField('hn', idx, f, v)} 
            onAdd={() => handleAddItem('hn')}
          />

          <ArraySection 
            title="🔥 Reddit Pulse" 
            subtitle="Community discussions, sentiment, and breakthroughs from top AI subreddits."
            items={content_json.reddit || []} 
            onUpdate={(idx, f, v) => handleUpdateField('reddit', idx, f, v)} 
            onAdd={() => handleAddItem('reddit')}
          />

          <ArraySection 
            title="🚀 Product Hunt Picks (Top 6)" 
            subtitle="The freshest tools and launches trending on Product Hunt."
            items={content_json.phPicks || []} 
            onUpdate={(idx, f, v) => handleUpdateField('phPicks', idx, f, v)} 
            onAdd={() => handleAddItem('phPicks')}
            isProduct
          />

          <ArraySection 
            title="🛠️ AI Tools (Gems)" 
            subtitle="High-utility builder applications, browser extensions, and APIs."
            items={content_json.aiTools || []} 
            onUpdate={(idx, f, v) => handleUpdateField('aiTools', idx, f, v)} 
            onAdd={() => handleAddItem('aiTools')}
            isProduct
          />
        </div>
      ) : (
        <div style={styles.noDraftCard}>
          <div style={styles.emptyIconContainer}>
            <RefreshCw size={36} color="var(--primary)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: 'var(--textMain)' }}>
              No Draft Report Found For Today
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--textMuted)', maxWidth: '440px', lineHeight: '1.5' }}>
              The automated AI pipeline creates daily drafts at midnight. You can trigger the pipeline manually or reload.
            </p>
          </div>
          <button onClick={fetchDraft} style={styles.refreshBtnInline}>
            <RefreshCw size={15} />
            <span>Check Again</span>
          </button>
        </div>
      )}

      {/* Published Archive Section */}
      <div style={{ marginTop: '64px' }}>
        <div style={styles.archiveHeaderRow}>
          <div>
            <h2 style={styles.sectionTitle}>📜 Published Archives</h2>
            <p style={styles.sectionSubtitle}>Select past issues to review, update curation links, or republish.</p>
          </div>
          <div style={styles.badgePill}>
            <Calendar size={13} color="var(--primary)" />
            <span>{archives.length} Issues Stored</span>
          </div>
        </div>

        {archivesLoading ? (
          <div style={styles.loadingBox}>
            <RefreshCw className="spin" size={24} color="var(--primary)" />
            <span>Loading archives history...</span>
          </div>
        ) : archives.length > 0 ? (
          <div style={styles.archiveGrid}>
            {archives.map((arch, idx) => (
              <div 
                key={arch.report_date || arch.id || `arch-${idx}`} 
                style={styles.archiveCard} 
                onClick={() => {
                  setReport(arch);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setMessage({ type: 'success', text: `Loaded report for ${arch.report_date}` });
                }}
              >
                <div style={styles.archiveTop}>
                  <span style={styles.archiveDate}>{arch.report_date}</span>
                  <span style={styles.publishedBadge}>LIVE ISSUE</span>
                </div>

                <div style={styles.archiveSummary}>
                  <div style={styles.summaryItem}>
                    <span style={{ color: 'var(--textMuted)' }}>Model:</span>
                    <strong style={{ color: 'var(--textMain)' }}>{arch.content_json?.dailyReport?.modelOfTheDay?.name || 'N/A'}</strong>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={{ color: 'var(--textMuted)' }}>Tool:</span>
                    <strong style={{ color: 'var(--textMain)' }}>{arch.content_json?.dailyReport?.toolOfTheDay?.name || 'N/A'}</strong>
                  </div>
                </div>

                <div style={styles.archiveFooter}>
                  <span>
                    {(arch.content_json?.gems?.length || 0) + (arch.content_json?.repos?.length || 0)} curation links
                  </span>
                  <div style={styles.inspectBtn}>
                    <span>Inspect Draft</span>
                    <Eye size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyMessageBox}>
            <p>No published reports found in historical storage.</p>
          </div>
        )}
      </div>
    </>
  );
}

export { Section, ArraySection };
