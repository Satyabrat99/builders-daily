"use client";
import { useState, useRef } from 'react';
import { 
  X, Search, ArrowUp, ArrowDown, RefreshCw, Check, 
  UploadCloud, Image as ImageIcon, Trash2, AlertCircle, Link as LinkIcon 
} from 'lucide-react';
import { styles } from '../adminBlogStyles';
import { useAdminBlog } from '../AdminBlogContext';
import { uploadImage } from '@/lib/uploadImage';

export default function BundleEditorModalSlot() {
  const {
    isBundleModalOpen,
    setIsBundleModalOpen,
    editingBundleId,
    bundleForm,
    setBundleForm,
    articleSearchInModal,
    setArticleSearchInModal,
    handleBundleNameChange,
    handleToggleArticleInBundle,
    handleMoveArticleInBundle,
    handleSaveBundle,
    savingBundle,
    blogs,
  } = useAdminBlog();

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  if (!isBundleModalOpen) return null;

  const handleFileSelect = async (file) => {
    if (!file) return;
    setUploadError(null);

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    // Validate file size: must be < 2MB (2 * 1024 * 1024 bytes)
    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`File is too large (${sizeMb} MB). Cover image must be less than 2MB.`);
      return;
    }

    setUploadingCover(true);
    try {
      const url = await uploadImage(file);
      setBundleForm(prev => ({ ...prev, cover_image: url }));
    } catch (err) {
      console.error('Failed to upload collection cover image:', err);
      setUploadError('Failed to upload cover image. Please check your connection or enter an image URL.');
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>
              {editingBundleId ? 'Edit Collection' : 'Create Article Bundle'}
            </h2>
            <p style={styles.modalSubtitle}>
              Organize stories into an intentional thematic sequence.
            </p>
          </div>
          <button 
            onClick={() => setIsBundleModalOpen(false)}
            style={styles.modalCloseBtn}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <div style={styles.modalBody}>
          {/* Bundle Name */}
          <div style={styles.modalInputGroup}>
            <label style={styles.modalLabel}>COLLECTION NAME *</label>
            <input
              type="text"
              value={bundleForm.name}
              onChange={(e) => handleBundleNameChange(e.target.value)}
              placeholder="e.g. Local LLM Mastery: From Zero to Quantized Models"
              style={styles.modalInput}
            />
          </div>

          {/* URL Slug */}
          <div style={styles.modalInputGroup}>
            <label style={styles.modalLabel}>URL SLUG</label>
            <input
              type="text"
              value={bundleForm.slug}
              onChange={(e) => setBundleForm(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="e.g. local-llm-mastery"
              style={styles.modalInput}
            />
          </div>

          {/* Collection Cover Image Upload Section */}
          <div style={styles.modalInputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={styles.modalLabel}>COLLECTION COVER IMAGE</label>
              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', letterSpacing: '0.04em' }}>
                4:3 ASPECT RATIO · &lt; 2MB
              </span>
            </div>

            {/* Dimension & File Size Guidance Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 14px',
              backgroundColor: 'var(--bgCardHover)',
              border: '1px solid var(--borderDark)',
              borderRadius: '12px',
              marginBottom: '10px',
              fontSize: '12px',
              color: 'var(--textMuted)',
              lineHeight: 1.4
            }}>
              <span style={{
                display: 'inline-flex',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(249, 115, 22, 0.12)',
                color: 'var(--primary)',
                fontWeight: '700',
                fontSize: '11px',
                whiteSpace: 'nowrap'
              }}>
                800 × 600 px
              </span>
              <span>
                Recommended dimensions as per the series card frame (<strong>4:3 aspect ratio</strong>). Maximum size: <strong>2 MB</strong>.
              </span>
            </div>

            {/* Upload Area / Image Preview */}
            {bundleForm.cover_image ? (
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                padding: '14px',
                backgroundColor: 'var(--bgApp)',
                border: '1px solid var(--borderDark)',
                borderRadius: '14px'
              }}>
                {/* 4:3 Card Aspect Ratio Thumbnail Preview */}
                <div style={{
                  width: '130px',
                  aspectRatio: '4 / 3',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid var(--borderDark)',
                  backgroundColor: 'var(--bgCard)',
                  position: 'relative',
                  flexShrink: 0
                }}>
                  <img
                    src={bundleForm.cover_image}
                    alt="Collection cover preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = '/blog-page/fallback-wafers.jpg'; }}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    fontSize: '9px',
                    fontWeight: '700',
                    color: '#ffffff',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    4:3 Card Frame
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    fontSize: '11.5px',
                    color: 'var(--textMuted)',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {bundleForm.cover_image}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingCover}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--borderDark)',
                        backgroundColor: 'var(--bgCard)',
                        color: 'var(--textMain)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <UploadCloud size={13} />
                      <span>{uploadingCover ? 'Uploading...' : 'Replace Image'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBundleForm(prev => ({ ...prev, cover_image: '' }))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        color: '#ef4444',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Drag and drop / Click upload container */}
                <div
                  onClick={() => !uploadingCover && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.length) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--borderDark)'}`,
                    borderRadius: '14px',
                    padding: '24px 20px',
                    textAlign: 'center',
                    backgroundColor: isDragging ? 'rgba(249, 115, 22, 0.05)' : 'var(--bgCardHover)',
                    cursor: uploadingCover ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(249, 115, 22, 0.12)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {uploadingCover ? <RefreshCw className="spin" size={18} /> : <UploadCloud size={20} />}
                  </div>

                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--textMain)' }}>
                      {uploadingCover ? 'Uploading cover image...' : 'Click to upload cover image or drag & drop'}
                    </span>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--textMuted)' }}>
                      Dimensions: <strong>800 × 600 px (4:3 ratio)</strong> · Size: <strong>&lt; 2 MB</strong> (PNG, JPG, WebP)
                    </p>
                  </div>
                </div>

                {/* Optional URL input fallback toggle */}
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--textMuted)',
                      fontSize: '11.5px',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    {showUrlInput ? 'Hide image URL input' : 'Or enter image URL manually'}
                  </button>
                </div>

                {showUrlInput && (
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      value={bundleForm.cover_image}
                      onChange={(e) => setBundleForm(prev => ({ ...prev, cover_image: e.target.value }))}
                      placeholder="https://example.com/collection-cover.jpg"
                      style={styles.modalInput}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {/* Upload Error Banner */}
            {uploadError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '8px'
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={styles.modalInputGroup}>
            <label style={styles.modalLabel}>SUMMARY / CURATOR NOTE</label>
            <textarea
              value={bundleForm.description}
              onChange={(e) => setBundleForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide a short description of what readers will learn from reading this bundle..."
              style={styles.modalTextarea}
            />
          </div>

          {/* Article Picker Section */}
          <div style={styles.articlePickerSection}>
            <div style={styles.articlePickerHeader}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--textMain)' }}>
                  Select Stories ({bundleForm.article_ids.length} included)
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--textMuted)' }}>
                  Check stories to include and use arrow buttons to adjust their sequence.
                </p>
              </div>

              <div style={styles.modalSearchWrap}>
                <Search size={13} color="var(--textMuted)" />
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={articleSearchInModal}
                  onChange={(e) => setArticleSearchInModal(e.target.value)}
                  style={styles.modalSearchInput}
                />
              </div>
            </div>

            <div style={styles.articlesChecklistContainer}>
              {blogs
                .filter(b => {
                  const q = articleSearchInModal.toLowerCase().trim();
                  return !q || (b.title && b.title.toLowerCase().includes(q));
                })
                .map((article) => {
                  const isSelected = bundleForm.article_ids.includes(article.id);
                  const orderIndex = bundleForm.article_ids.indexOf(article.id);

                  return (
                    <div
                      key={article.id}
                      style={{
                        ...styles.articlePickerRow,
                        backgroundColor: isSelected ? 'var(--bgCardHover)' : 'transparent',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--borderDark)',
                      }}
                    >
                      <label style={styles.articlePickerLabel}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleArticleInBundle(article.id)}
                          style={styles.checkboxInput}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--textMain)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {article.title || 'Untitled'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--textMuted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <span>/{article.slug}</span>
                            <span>·</span>
                            <span>{article.status === 'published' ? '🟢 Live' : '⚪ Draft'}</span>
                          </div>
                        </div>
                      </label>

                      {/* Order Controls if Selected */}
                      {isSelected && (
                        <div style={styles.orderControlsRow}>
                          <span style={styles.orderPill}>
                            Part {orderIndex + 1}
                          </span>
                          <button
                            type="button"
                            disabled={orderIndex === 0}
                            onClick={() => handleMoveArticleInBundle(orderIndex, 'up')}
                            style={{
                              ...styles.orderBtn,
                              opacity: orderIndex === 0 ? 0.3 : 1,
                              cursor: orderIndex === 0 ? 'not-allowed' : 'pointer'
                            }}
                            title="Move earlier"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={orderIndex === bundleForm.article_ids.length - 1}
                            onClick={() => handleMoveArticleInBundle(orderIndex, 'down')}
                            style={{
                              ...styles.orderBtn,
                              opacity: orderIndex === bundleForm.article_ids.length - 1 ? 0.3 : 1,
                              cursor: orderIndex === bundleForm.article_ids.length - 1 ? 'not-allowed' : 'pointer'
                            }}
                            title="Move later"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={styles.modalFooter}>
          <button
            onClick={() => setIsBundleModalOpen(false)}
            style={styles.modalCancelBtn}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveBundle}
            disabled={savingBundle}
            style={{
              ...styles.modalSaveBtn,
              opacity: savingBundle ? 0.7 : 1,
            }}
          >
            {savingBundle ? <RefreshCw className="spin" size={15} /> : <Check size={15} />}
            <span>{savingBundle ? 'Saving...' : 'Save Collection'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
