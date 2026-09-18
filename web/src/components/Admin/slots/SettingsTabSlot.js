"use client";
import { useAdmin } from '@/components/Admin/AdminContext';
import styles from '@/components/Admin/adminStyles';
import { Section } from '@/components/Admin/slots/ReportTabSlot';
import { Check, RefreshCw, UploadCloud, Trash2, Plus, Save } from 'lucide-react';

export default function SettingsTabSlot() {
  const {
    toggleStyle,
    handleUpdateToggleStyle,
    spotlightBg,
    setSpotlightBg,
    handleUpdateSpotlightBgUrl,
    handleUploadSpotlightBg,
    uploading,
    spotlightBgHistory,
    heroFonts,
    handleUpdateHeroFont,
    handleRemoveHeroFont,
    handleAddHeroFont,
    handleSaveHeroFonts,
    savingFonts,
    cardBgs,
    setCardBgs,
    handleUpdateCardBgUrl,
    handleUploadCardBg
  } = useAdmin();

  return (
    <div style={styles.grid}>
      <Section title="⚙️ Site Configuration" subtitle="Global branding and dynamic UI preferences.">
        
        {/* Theme Toggle Style */}
        <div style={styles.card}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: 'var(--textMain)' }}>
              Theme Toggle Style
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--textMuted)' }}>
              Select the visual styling of the light/dark mode switch across the site.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['classic', 'sunset'].map(styleOption => {
                const isSelected = toggleStyle === styleOption;
                return (
                  <button 
                    key={styleOption}
                    onClick={() => handleUpdateToggleStyle(styleOption)}
                    style={{
                      ...styles.themeStyleOptionBtn,
                      borderColor: isSelected ? 'var(--primary)' : 'var(--borderDark)',
                      backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.12)' : 'var(--bgApp)',
                      color: isSelected ? 'var(--primary)' : 'var(--textMain)',
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>
                      {styleOption === 'classic' ? '☀️ Classic Sky' : '🌅 Sunset Glow'}
                    </span>
                    {isSelected && <Check size={14} color="var(--primary)" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Spotlight Background */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={styles.spotlightPreviewFrame}>
                {spotlightBg?.match(/\.(mp4|webm)$/i) ? (
                  <video src={spotlightBg} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={spotlightBg} alt="Spotlight" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--textMain)' }}>Spotlight Background</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--textMuted)' }}>
                  Main visual background texture for the hero spotlight module.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                style={{ ...styles.input, width: '240px', padding: '9px 12px', fontSize: '13px' }}
                value={spotlightBg} 
                onChange={(e) => setSpotlightBg(e.target.value)}
                placeholder="Image or video URL..."
              />
              <button 
                onClick={() => handleUpdateSpotlightBgUrl(spotlightBg)} 
                style={styles.saveUrlBtn}
              >
                Save URL
              </button>
              <label style={styles.uploadNewBtn}>
                <input type="file" onChange={handleUploadSpotlightBg} style={{ display: 'none' }} disabled={uploading} />
                {uploading ? <RefreshCw className="spin" size={15} /> : <UploadCloud size={15} />}
                <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
              </label>
            </div>
          </div>

          <div style={styles.cardDivider} />

          <div>
            <h4 style={styles.subHeaderCaps}>PREVIOUSLY UPLOADED ASSETS</h4>
            {spotlightBgHistory.length > 0 ? (
              <div style={styles.historyThumbGrid}>
                {spotlightBgHistory.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleUpdateSpotlightBgUrl(url)}
                    style={{ 
                      ...styles.historyThumb,
                      borderColor: spotlightBg === url ? 'var(--primary)' : 'var(--borderDark)',
                      opacity: spotlightBg === url ? 1 : 0.65,
                    }}
                  >
                    {url.match(/\.(mp4|webm)$/i) ? (
                      <video src={url} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={url} alt={`History ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {spotlightBg === url && (
                      <div style={styles.activeCheckBadge}>
                        <Check size={11} color="#ffffff" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptySmallBox}>
                No previous uploads found.
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Hero Typewriter Fonts */}
      <Section title="✍️ Hero Typewriter Fonts" subtitle="Fonts that cycle automatically on the homepage hero banner.">
        <div style={styles.card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {heroFonts.map((font, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--textMuted)', width: '24px' }}>
                  {idx + 1}.
                </span>
                <input 
                  style={{ ...styles.input, flex: 1, padding: '10px 14px' }}
                  value={font}
                  onChange={(e) => handleUpdateHeroFont(idx, e.target.value)}
                  placeholder="e.g. Space Grotesk, Fira Code, Outfit"
                />
                <button 
                  onClick={() => handleRemoveHeroFont(idx)}
                  style={styles.deleteFontBtn}
                  title="Remove font"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px' }}>
            <button onClick={handleAddHeroFont} style={styles.secondaryBtn}>
              <Plus size={15} />
              <span>Add Font</span>
            </button>
            <button 
              onClick={handleSaveHeroFonts} 
              disabled={savingFonts}
              style={styles.primaryActionBtn}
            >
              {savingFonts ? <RefreshCw className="spin" size={15} /> : <Save size={15} />}
              <span>{savingFonts ? 'Saving Fonts...' : 'Save Fonts'}</span>
            </button>
          </div>
        </div>
      </Section>

      {/* Of The Day Card Backgrounds */}
      <Section title="🖼️ Of The Day Card Backgrounds" subtitle="Custom artwork or video loop textures for daily spotlight cards.">
        <div style={styles.card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {['model', 'tool', 'repo', 'paper'].map((type, idx, arr) => (
              <div key={type} style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                gap: '16px',
                borderBottom: idx !== arr.length - 1 ? '1px solid var(--border)' : 'none', 
                paddingBottom: idx !== arr.length - 1 ? '20px' : '0' 
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={styles.cardBgThumbFrame}>
                    {cardBgs[type]?.match(/\.(mp4|webm)$/i) ? (
                      <video src={cardBgs[type]} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={cardBgs[type] || '/model-2-png.png'} alt={`${type} bg`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--textMain)', textTransform: 'capitalize' }}>
                      {type} Card Texture
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--textMuted)' }}>Upload or link an image/video asset</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    style={{ ...styles.input, width: '220px', padding: '8px 12px', fontSize: '13px' }}
                    value={cardBgs[type] || ''} 
                    onChange={(e) => setCardBgs(prev => ({ ...prev, [type]: e.target.value }))}
                    placeholder="Image URL..."
                  />
                  <button 
                    onClick={() => handleUpdateCardBgUrl(cardBgs[type], type)} 
                    style={styles.saveUrlBtn}
                  >
                    Save
                  </button>
                  <label style={styles.uploadNewBtn}>
                    <input type="file" onChange={(e) => handleUploadCardBg(e, type)} style={{ display: 'none' }} disabled={uploading} />
                    {uploading ? <RefreshCw className="spin" size={14} /> : <UploadCloud size={14} />}
                    <span>Upload</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
