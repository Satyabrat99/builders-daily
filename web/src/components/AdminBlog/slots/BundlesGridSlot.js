"use client";
import { RefreshCw, Layers, Plus, Edit3, Trash2 } from 'lucide-react';
import { styles } from '../adminBlogStyles';
import { useAdminBlog } from '../AdminBlogContext';
import BundleEditorModalSlot from './BundleEditorModalSlot';

export default function BundlesGridSlot() {
  const {
    bundles,
    bundlesLoading,
    blogs,
    handleOpenNewBundleModal,
    handleOpenEditBundleModal,
    handleDeleteBundle,
    formatDate,
  } = useAdminBlog();

  return (
    <div>
      {bundlesLoading ? (
        <div style={styles.loadingState}>
          <RefreshCw className="spin" size={24} color="var(--primary)" />
          <span style={styles.loadingText}>Fetching collections...</span>
        </div>
      ) : bundles.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIconWrap}>
            <Layers size={36} color="var(--primary)" />
          </div>
          <h3 style={styles.emptyTitle}>No collections created yet</h3>
          <p style={styles.emptyText}>
            Bundles allow you to group related articles into guided thematic roadmaps, series, or multi-part deep dives.
          </p>
          <button onClick={handleOpenNewBundleModal} style={styles.emptyNewBtn}>
            <Plus size={15} />
            <span>Create first collection</span>
          </button>
        </div>
      ) : (
        <div style={styles.bundlesGrid}>
          {bundles.map((bundle) => {
            const bundleArticleCount = Array.isArray(bundle.article_ids) ? bundle.article_ids.length : 0;
            const includedArticles = (bundle.article_ids || [])
              .map(id => blogs.find(b => b.id === id))
              .filter(Boolean);

            return (
              <div key={bundle.id} style={styles.bundleCard}>
                {/* Bundle Header Thumbnail */}
                <div style={styles.bundleCoverFrame}>
                  {bundle.cover_image ? (
                    <img src={bundle.cover_image} alt={bundle.name} style={styles.bundleCoverImg} />
                  ) : (
                    <div style={styles.bundleCoverFallback}>
                      <Layers size={32} color="rgba(249, 115, 22, 0.4)" />
                    </div>
                  )}
                  <span style={styles.bundleCountChip}>
                    {bundleArticleCount} {bundleArticleCount === 1 ? 'Article' : 'Articles'}
                  </span>
                </div>

                <div style={styles.bundleCardBody}>
                  <div style={styles.bundleSlugPill}>
                    /bundle/{bundle.slug || 'series'}
                  </div>

                  <h3 style={styles.bundleTitle}>
                    {bundle.name}
                  </h3>

                  {bundle.description && (
                    <p style={styles.bundleDesc}>
                      {bundle.description}
                    </p>
                  )}

                  {/* Articles list preview */}
                  {includedArticles.length > 0 && (
                    <div style={styles.bundleArticlesList}>
                      <span style={styles.bundleArticlesHeader}>CURATED ORDER:</span>
                      {includedArticles.slice(0, 4).map((art, idx) => (
                        <div key={art.id} style={styles.bundleArticleRow}>
                          <span style={styles.bundleOrderBadge}>{idx + 1}</span>
                          <span style={styles.bundleArticleTitle}>{art.title}</span>
                        </div>
                      ))}
                      {includedArticles.length > 4 && (
                        <div style={styles.moreArticlesNotice}>
                          + {includedArticles.length - 4} more stories in series
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bundle Actions Footer */}
                  <div style={styles.bundleFooter}>
                    <span style={{ fontSize: '11px', color: 'var(--textMuted)' }}>
                      Updated {formatDate(bundle.updated_at || bundle.created_at)}
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditBundleModal(bundle)}
                        style={styles.actionPillBtn}
                      >
                        <Edit3 size={13} />
                        <span>Edit Bundle</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBundle(bundle.id, bundle.name)}
                        style={styles.actionDeleteBtn}
                        title="Delete collection"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal is mounted beside the grid */}
      <BundleEditorModalSlot />
    </div>
  );
}
