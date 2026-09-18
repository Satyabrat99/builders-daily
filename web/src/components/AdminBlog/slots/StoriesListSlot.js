"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, LayoutList, LayoutGrid, RefreshCw, Plus, 
  Edit3, Trash2, ArrowUpRight 
} from 'lucide-react';
import { styles } from '../adminBlogStyles';
import { useAdminBlog } from '../AdminBlogContext';

export default function StoriesListSlot() {
  const {
    blogs,
    loading,
    handleDelete,
    counts,
    formatDate,
  } = useAdminBlog();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  // Filtered & searched blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'published' ? blog.status === 'published' :
        blog.status !== 'published';

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        (blog.title && blog.title.toLowerCase().includes(q)) ||
        (blog.slug && blog.slug.toLowerCase().includes(q)) ||
        (blog.excerpt && blog.excerpt.toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  }, [blogs, statusFilter, searchQuery]);

  return (
    <>
      {/* Toolbar: Filter Tabs, Search & View Switcher */}
      <div style={styles.toolbar}>
        {/* Segmented Filter Tabs */}
        <div style={styles.filterTabs}>
          {[
            { id: 'all', label: 'All', count: counts.total },
            { id: 'published', label: 'Published', count: counts.published },
            { id: 'draft', label: 'Drafts', count: counts.drafts },
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  ...styles.filterTabBtn,
                  color: isActive ? 'var(--textMain)' : 'var(--textMuted)',
                  borderBottomColor: isActive ? 'var(--primary)' : 'transparent',
                  fontWeight: isActive ? '700' : '500',
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  ...styles.filterTabCount,
                  backgroundColor: isActive ? 'rgba(249, 115, 22, 0.12)' : 'var(--borderDark)',
                  color: isActive ? 'var(--primary)' : 'var(--textMuted)',
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Search + View Toggle */}
        <div style={styles.toolbarRight}>
          <div style={styles.searchContainer}>
            <Search size={14} color="var(--textMuted)" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Filter stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={styles.clearBtn}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Switcher */}
          <div style={styles.viewToggleGroup}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                ...styles.viewBtn,
                backgroundColor: viewMode === 'list' ? 'var(--bgCardHover)' : 'transparent',
                color: viewMode === 'list' ? 'var(--textMain)' : 'var(--textMuted)',
              }}
              title="List View"
              aria-label="List view"
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                ...styles.viewBtn,
                backgroundColor: viewMode === 'grid' ? 'var(--bgCardHover)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--textMain)' : 'var(--textMuted)',
              }}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={styles.loadingState}>
          <RefreshCw className="spin" size={24} color="var(--primary)" />
          <span style={styles.loadingText}>Fetching stories...</span>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>
            {searchQuery || statusFilter !== 'all' ? 'No stories match your filter' : 'No stories yet'}
          </h3>
          <p style={styles.emptyText}>
            {searchQuery || statusFilter !== 'all'
              ? 'Try searching with different keywords or clearing your status filter.'
              : 'Write your first technical deep dive or experiment to share with readers.'}
          </p>
          {(!searchQuery && statusFilter === 'all') && (
            <Link href="/admin-blog/new" style={styles.emptyNewBtn}>
              <Plus size={15} />
              <span>Write a story</span>
            </Link>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* EDITORIAL LIST VIEW */
        <div style={styles.listView}>
          {filteredBlogs.map((blog) => {
            const isPublished = blog.status === 'published';
            return (
              <article key={blog.id} style={styles.listRow}>
                {/* Text & Meta Column */}
                <div style={styles.listMain}>
                  <div style={styles.listMetaLine}>
                    <span style={{
                      ...styles.statusDot,
                      backgroundColor: isPublished ? '#10b981' : '#f59e0b',
                    }} />
                    <span style={{
                      ...styles.statusText,
                      color: isPublished ? '#10b981' : '#f59e0b',
                    }}>
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span style={styles.metaDot}>·</span>
                    <span style={styles.metaTime}>
                      {formatDate(blog.published_at || blog.created_at)}
                    </span>
                    <span style={styles.metaDot}>·</span>
                    <span style={styles.metaTime}>
                      {blog.read_time_minutes || 1} min read
                    </span>
                    <span style={styles.metaDot}>·</span>
                    <span style={styles.metaViews}>
                      {blog.views || 0} views
                    </span>
                  </div>

                  <Link href={`/admin-blog/edit/${blog.id}`} style={styles.listTitleLink}>
                    <h2 style={styles.listTitle}>
                      {blog.title || 'Untitled Story'}
                    </h2>
                  </Link>

                  {blog.excerpt && (
                    <p style={styles.listExcerpt}>
                      {blog.excerpt}
                    </p>
                  )}

                  <div style={styles.listFooter}>
                    <span style={styles.slugText}>
                      /{blog.slug || 'draft'}
                    </span>

                    <div style={styles.listActions}>
                      {isPublished && (
                        <Link 
                          href={`/blog/${blog.slug}`} 
                          target="_blank" 
                          style={styles.actionGhostBtn}
                          title="Open live post"
                        >
                          <span>Preview</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      )}
                      <Link 
                        href={`/admin-blog/edit/${blog.id}`} 
                        style={styles.actionPillBtn}
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </Link>
                      <button 
                        onClick={() => handleDelete(blog.id, blog.title)} 
                        style={styles.actionDeleteBtn}
                        title="Delete story"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {blog.cover_image && (
                  <div style={styles.listThumbWrap}>
                    <img 
                      src={blog.cover_image} 
                      alt={blog.title || 'Cover'} 
                      style={styles.listThumbImg} 
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        /* EDITORIAL GRID VIEW */
        <div style={styles.gridView}>
          {filteredBlogs.map((blog) => {
            const isPublished = blog.status === 'published';
            return (
              <div key={blog.id} style={styles.gridCard}>
                {blog.cover_image && (
                  <div style={styles.gridCoverWrap}>
                    <img 
                      src={blog.cover_image} 
                      alt={blog.title || 'Cover'} 
                      style={styles.gridCoverImg} 
                    />
                  </div>
                )}

                <div style={styles.gridCardBody}>
                  <div style={styles.gridMetaTop}>
                    <span style={{
                      ...styles.statusDot,
                      backgroundColor: isPublished ? '#10b981' : '#f59e0b',
                    }} />
                    <span style={{
                      ...styles.statusText,
                      color: isPublished ? '#10b981' : '#f59e0b',
                    }}>
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span style={styles.metaDot}>·</span>
                    <span style={styles.metaTime}>
                      {formatDate(blog.published_at || blog.created_at)}
                    </span>
                  </div>

                  <Link href={`/admin-blog/edit/${blog.id}`} style={styles.gridTitleLink}>
                    <h3 style={styles.gridTitle}>
                      {blog.title || 'Untitled Story'}
                    </h3>
                  </Link>

                  {blog.excerpt && (
                    <p style={styles.gridExcerpt}>
                      {blog.excerpt}
                    </p>
                  )}

                  <div style={styles.gridFooter}>
                    <span style={styles.metaViews}>
                      {blog.read_time_minutes || 1}m · {blog.views || 0} views
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {isPublished && (
                        <Link 
                          href={`/blog/${blog.slug}`} 
                          target="_blank" 
                          style={styles.gridIconBtn}
                          title="Preview live"
                        >
                          <ArrowUpRight size={14} />
                        </Link>
                      )}
                      <Link 
                        href={`/admin-blog/edit/${blog.id}`} 
                        style={styles.gridIconBtn}
                        title="Edit story"
                      >
                        <Edit3 size={14} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(blog.id, blog.title)} 
                        style={styles.gridDeleteBtn}
                        title="Delete"
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
    </>
  );
}
