"use client";
import { useAdmin } from '@/components/Admin/AdminContext';
import styles from '@/components/Admin/adminStyles';
import { Section } from '@/components/Admin/slots/ReportTabSlot';
import { Plus, RefreshCw, GripVertical, ArrowUp, ArrowDown, Trash2, UploadCloud, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { formatExternalUrl } from '@/lib/urlUtils';

export default function GemsTabSlot() {
  const {
    gems,
    gemsLoading,
    gemsVisible,
    gemBadges,
    draggedItemIdx,
    handleToggleGemsVisibility,
    handleAddGem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleMoveGem,
    handleToggleGemActive,
    handleDeleteGem,
    handleUpdateGemField,
    handleUploadGemImage,
    handleUpdateGemBadge
  } = useAdmin();

  return (
    <div style={styles.grid}>
      {/* Section Visibility Control */}
      <Section title="⚙️ Section Display Control" subtitle="Control visibility of the Featured Gems slider on the user dashboard.">
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--textMain)' }}>Featured Gems Row</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--textMuted)' }}>
                Display or hide the horizontal gem slider on the homepage.
              </p>
            </div>
            <button
              onClick={handleToggleGemsVisibility}
              style={{
                ...styles.visibilityToggleBtn,
                backgroundColor: gemsVisible ? 'var(--statusSuccessBg)' : 'var(--statusDangerBg)',
                borderColor: gemsVisible ? 'var(--statusSuccessBorder)' : 'var(--statusDangerBorder)',
                color: gemsVisible ? 'var(--statusSuccess)' : 'var(--statusDanger)',
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: gemsVisible ? 'var(--statusSuccess)' : 'var(--statusDanger)'
              }} />
              <span>{gemsVisible ? 'SECTION VISIBLE' : 'SECTION HIDDEN'}</span>
            </button>
          </div>
        </div>
      </Section>

      <Section 
        title="💎 Manage Standalone Featured Gems" 
        subtitle="Drag to reorder or use arrow controls. Live updates happen immediately without needing report republication."
      >
        <div style={styles.sectionHeaderRow}>
          <span style={{ fontSize: '13px', color: 'var(--textMuted)' }}>
            {gems.length} Gems Configured
          </span>
          <button onClick={handleAddGem} style={styles.addPrimaryBtn}>
            <Plus size={15} />
            <span>Add New Gem</span>
          </button>
        </div>
        
        {gemsLoading ? (
          <div style={styles.loadingBox}>
            <RefreshCw className="spin" size={24} color="var(--primary)" />
            <span>Loading gems catalog...</span>
          </div>
        ) : gems.length > 0 ? (
          <div style={styles.gemsGrid}>
            {gems.map((gem, idx) => (
              <div 
                key={gem.id || idx} 
                style={{
                  ...styles.card,
                  opacity: draggedItemIdx === idx ? 0.4 : 1,
                  position: 'relative'
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
              >
                {/* Active Toggle & Order Controls */}
                <div style={styles.gemCardTopRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={styles.dragHandle} title="Drag to reorder">
                      <GripVertical size={16} color="var(--textMuted)" />
                    </div>
                    <span style={styles.gemNumberBadge}>#{idx + 1}</span>
                    
                    {/* Up/Down buttons */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMoveGem(idx, 'up')}
                        style={{
                          ...styles.reorderArrowBtn,
                          opacity: idx === 0 ? 0.3 : 1,
                          cursor: idx === 0 ? 'not-allowed' : 'pointer'
                        }}
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        disabled={idx === gems.length - 1}
                        onClick={() => handleMoveGem(idx, 'down')}
                        style={{
                          ...styles.reorderArrowBtn,
                          opacity: idx === gems.length - 1 ? 0.3 : 1,
                          cursor: idx === gems.length - 1 ? 'not-allowed' : 'pointer'
                        }}
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleGemActive(gem.id, gem.is_active)}
                      style={{
                        ...styles.miniStatusBtn,
                        backgroundColor: gem.is_active ? 'var(--statusSuccessBg)' : 'var(--statusDangerBg)',
                        color: gem.is_active ? 'var(--statusSuccess)' : 'var(--statusDanger)',
                        borderColor: gem.is_active ? 'var(--statusSuccessBorder)' : 'var(--statusDangerBorder)',
                      }}
                    >
                      {gem.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button 
                      onClick={() => handleDeleteGem(gem.id)}
                      style={styles.miniDeleteBtn}
                      title="Delete Gem"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Inputs */}
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>TITLE</label>
                  <input 
                    style={{ ...styles.input, fontWeight: '700' }} 
                    value={gem.title || ''} 
                    onChange={(e) => handleUpdateGemField(gem.id, 'title', e.target.value)}
                    placeholder="Gem Title"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>DESCRIPTION</label>
                  <textarea 
                    style={{ ...styles.textarea, minHeight: '65px' }} 
                    value={gem.description || ''} 
                    onChange={(e) => handleUpdateGemField(gem.id, 'description', e.target.value)}
                    placeholder="Brief description of this model, dataset, or space"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ ...styles.inputLabel, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <LinkIcon size={12} color="#a855f7" />
                      <span>REDIRECT / SOURCE URL (DESTINATION)</span>
                    </label>
                    {gem.url && (
                      <a 
                        href={formatExternalUrl(gem.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#c084fc',
                          textDecoration: 'none',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        }}
                      >
                        <span>Visit Source</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  <input 
                    style={styles.input} 
                    value={gem.url || ''} 
                    onChange={(e) => handleUpdateGemField(gem.id, 'url', e.target.value)}
                    placeholder="https://huggingface.co/... or https://github.com/..."
                  />
                </div>

                {/* Image Preview & Upload */}
                <div style={styles.gemMediaRow}>
                  <div style={styles.gemMediaThumb}>
                    {gem.image_url ? (
                      <img src={gem.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={styles.gemMediaPlaceholder}>No Media</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <input 
                      style={{ ...styles.input, fontSize: '12px', padding: '8px 10px' }} 
                      value={gem.image_url || ''} 
                      onChange={(e) => handleUpdateGemField(gem.id, 'image_url', e.target.value)}
                      placeholder="Image URL"
                    />
                    
                    <label style={styles.customUploadBtn}>
                      <input 
                        type="file" 
                        onChange={(e) => handleUploadGemImage(e, gem.id)} 
                        style={{ display: 'none' }} 
                      />
                      <UploadCloud size={13} color="var(--primary)" />
                      <span>Upload Custom Media</span>
                    </label>
                  </div>
                </div>

                {/* Badge Selection */}
                <div style={{ ...styles.inputGroup, marginTop: '8px' }}>
                  <label style={styles.inputLabel}>BADGE ICON</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['/badge-1.png', '/badge-2.png'].map(badge => {
                      const isSelected = gemBadges[gem.id] === badge || (!gemBadges[gem.id] && badge === '/badge-1.png');
                      return (
                        <div 
                          key={badge}
                          onClick={() => handleUpdateGemBadge(gem.id, badge)}
                          style={{
                            ...styles.badgeChoice,
                            borderColor: isSelected ? 'var(--primary)' : 'var(--borderDark)',
                            backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.1)' : 'var(--bgApp)',
                          }}
                        >
                          <img src={badge} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={badge} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyMessageBox}>
            <p>No featured gems added yet. Click "+ Add New Gem" to get started.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
