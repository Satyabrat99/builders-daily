"use client";
import { useAdmin } from '@/components/Admin/AdminContext';
import styles from '@/components/Admin/adminStyles';
import { Section } from '@/components/Admin/slots/ReportTabSlot';
import { Trash2, RefreshCw, UploadCloud, Plus, Link as LinkIcon, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { formatExternalUrl } from '@/lib/urlUtils';

export default function PromosTabSlot() {
  const {
    promos,
    promosVisible,
    uploading,
    handleTogglePromosVisibility,
    handleTogglePromo,
    handleDeletePromo,
    handleUploadPromo,
    handleAddPromoByUrl,
    handleUpdatePromoUrl,
    handleUpdatePromoTargetUrl
  } = useAdmin();

  return (
    <div style={styles.grid}>
      {/* Section Visibility Control */}
      <Section title="⚙️ Section Display Control" subtitle="Turn the promotion slider banner on or off across the entire live dashboard.">
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--textMain)' }}>Promo Slider Row</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--textMuted)' }}>
                Controls whether promotional banners are visible to end users.
              </p>
            </div>
            <button
              onClick={handleTogglePromosVisibility}
              style={{
                ...styles.visibilityToggleBtn,
                backgroundColor: promosVisible ? 'var(--statusSuccessBg)' : 'var(--statusDangerBg)',
                borderColor: promosVisible ? 'var(--statusSuccessBorder)' : 'var(--statusDangerBorder)',
                color: promosVisible ? 'var(--statusSuccess)' : 'var(--statusDanger)',
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: promosVisible ? 'var(--statusSuccess)' : 'var(--statusDanger)'
              }} />
              <span>{promosVisible ? 'SECTION VISIBLE' : 'SECTION HIDDEN'}</span>
            </button>
          </div>
        </div>
      </Section>

      {/* 1x1 Wide Card Active Promotions List */}
      <Section 
        title="📢 Active Promotions (Slider)" 
        subtitle="1x1 full-width wide preview cards (1200x300, 4:1 aspect ratio). Add or edit banner image URL and click destination redirect link."
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          width: '100%',
        }}>
          {promos.map((promo, idx) => (
            <div 
              key={promo.id || `promo-${idx}`} 
              style={{
                backgroundColor: 'var(--bgCard)',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid var(--borderDark)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.2)',
                width: '100%',
              }}
            >
              {/* Wide 4:1 Banner Preview */}
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 1',
                maxHeight: '260px',
                minHeight: '160px',
                backgroundColor: '#0a0d14',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid var(--borderDark)',
              }}>
                <img 
                  src={promo.image_url} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }} 
                  alt={`Promo banner #${idx + 1}`} 
                />
                
                {/* Floating Badges */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 2,
                }}>
                  <span style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    letterSpacing: '0.04em',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}>
                    SLIDE #{idx + 1}
                  </span>
                </div>

                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 2,
                }}>
                  <span style={{
                    backgroundColor: promo.is_active ? 'rgba(16, 185, 129, 0.92)' : 'rgba(100, 116, 139, 0.92)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    letterSpacing: '0.04em',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                  }}>
                    {promo.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              {/* Data Inputs: Banner URL & Destination Target URL */}
              <div style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px',
                }}>
                  {/* Field 1: Banner Image URL */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ ...styles.inputLabel, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <ImageIcon size={13} color="var(--primary)" />
                      <span>BANNER IMAGE URL</span>
                    </label>
                    <input 
                      style={styles.input} 
                      value={promo.image_url || ''} 
                      onChange={(e) => handleUpdatePromoUrl(promo.id, e.target.value)}
                      placeholder="https://... (1200x300 recommended)"
                    />
                  </div>

                  {/* Field 2: Redirect / Destination URL */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ ...styles.inputLabel, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LinkIcon size={13} color="#3b82f6" />
                        <span>REDIRECT / DESTINATION URL (CLICK TARGET)</span>
                      </label>
                      {promo.target_url && (
                        <a 
                          href={formatExternalUrl(promo.target_url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#60a5fa',
                            textDecoration: 'none',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          }}
                        >
                          <span>Visit / Test</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    <input 
                      style={styles.input} 
                      value={promo.target_url || ''} 
                      onChange={(e) => handleUpdatePromoTargetUrl(promo.id, e.target.value)}
                      placeholder="https://yoursponsor.com/deal or https://github.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Actions Bar */}
              <div style={{
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bgApp)',
                borderTop: '1px solid var(--borderDark)',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleTogglePromo(promo.id, promo.is_active)}
                    style={{
                      ...styles.statusBtn,
                      backgroundColor: promo.is_active ? 'var(--statusSuccessBg)' : 'var(--statusDangerBg)',
                      color: promo.is_active ? 'var(--statusSuccess)' : 'var(--statusDanger)',
                      borderColor: promo.is_active ? 'var(--statusSuccessBorder)' : 'var(--statusDangerBorder)',
                      padding: '8px 18px',
                      flex: 'none',
                    }}
                  >
                    {promo.is_active ? 'Deactivate Banner' : 'Activate Banner'}
                  </button>
                  {promo.target_url && (
                    <a 
                      href={formatExternalUrl(promo.target_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        color: '#60a5fa',
                        fontSize: '12px',
                        fontWeight: '700',
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>Open Destination</span>
                    </a>
                  )}
                </div>

                <button 
                  onClick={() => handleDeletePromo(promo.id)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={14} />
                  <span>Delete Banner</span>
                </button>
              </div>
            </div>
          ))}
          
          {/* Dropzone Upload & Add Controls (Wide Card) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            width: '100%',
          }}>
            <label style={{
              ...styles.uploadCard,
              width: '100%',
              minHeight: '130px',
              boxSizing: 'border-box',
            }}>
              <input type="file" onChange={handleUploadPromo} style={{ display: 'none' }} disabled={uploading} />
              <div style={styles.uploadPlaceholder}>
                {uploading ? (
                  <RefreshCw className="spin" size={32} color="var(--primary)" />
                ) : (
                  <>
                    <div style={styles.uploadIconCircle}>
                      <UploadCloud size={24} color="var(--primary)" />
                    </div>
                    <span style={{ fontWeight: '700', color: 'var(--textMain)', fontSize: '15px' }}>Upload New 1200x300 Wide Banner</span>
                    <span style={{ fontSize: '12px', color: 'var(--textMuted)' }}>PNG, JPG, WebP up to 5MB</span>
                  </>
                )}
              </div>
            </label>
            <button 
              onClick={handleAddPromoByUrl} 
              style={{
                ...styles.urlAddBtn,
                width: '100%',
                padding: '14px',
                fontSize: '14px',
              }}
            >
              <Plus size={16} />
              <span>Add Banner & Destination via URL</span>
            </button>
          </div>
        </div>
      </Section>
      
      <Section title="💡 Helpful Info">
        <div style={styles.card}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--textMuted)', lineHeight: '1.6' }}>
            Promotional banner updates sync immediately to the live database and will be reflected upon the user's next navigation or reload. 
            Reports do not need to be republished to update promotions.
          </p>
        </div>
      </Section>
    </div>
  );
}
