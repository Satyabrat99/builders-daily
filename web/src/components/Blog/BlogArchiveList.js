"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight, Search, ArrowUpDown, X } from 'lucide-react';
import styles from './BlogArchiveList.module.css';

const FALLBACKS = [
  '/blog-page/fallback-desk.jpg',
  '/blog-page/fallback-wafers.jpg',
  '/blog-page/fallback-archive.jpg',
];

function formatDate(dateStr) {
  if (!dateStr) return 'Recently';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return 'Recently';
  }
}

function extractPreview(blog) {
  if (blog.excerpt && blog.excerpt.trim().length > 8) {
    return blog.excerpt.trim();
  }
  if (blog.content) {
    try {
      const getTxt = (node) => {
        if (!node) return '';
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(getTxt).join(' ');
        if (node.text) return node.text;
        if (node.content) return getTxt(node.content);
        return '';
      };
      const text = getTxt(blog.content).trim().replace(/\s+/g, ' ');
      if (text.length > 10) {
        return text.length > 130 ? text.slice(0, 130) + '…' : text;
      }
    } catch {
      // fallback
    }
  }
  return 'Explorations in software design, autonomous agents, and systems thinking.';
}

export default function BlogArchiveList({ blogs = [], children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(10);

  const processedBlogs = useMemo(() => {
    let result = [...blogs];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((blog) => {
        const titleMatch = blog.title?.toLowerCase().includes(q);
        const excerptMatch = blog.excerpt?.toLowerCase().includes(q);
        const authorMatch = blog.author_name?.toLowerCase().includes(q);
        const tagsMatch = Array.isArray(blog.tags)
          ? blog.tags.some((t) => String(t).toLowerCase().includes(q))
          : typeof blog.tags === 'string' && blog.tags.toLowerCase().includes(q);

        let contentMatch = false;
        if (typeof blog.content === 'string') {
          contentMatch = blog.content.toLowerCase().includes(q);
        } else if (blog.content && typeof blog.content === 'object') {
          try {
            contentMatch = JSON.stringify(blog.content).toLowerCase().includes(q);
          } catch {}
        }

        return titleMatch || excerptMatch || authorMatch || tagsMatch || contentMatch;
      });
    }

    // Sort options
    result.sort((a, b) => {
      if (sortOption === 'oldest') {
        const timeA = new Date(a.published_at || a.created_at || 0).getTime();
        const timeB = new Date(b.published_at || b.created_at || 0).getTime();
        return timeA - timeB;
      }
      if (sortOption === 'read_time_asc') {
        const rA = Number(a.read_time_minutes) || 999;
        const rB = Number(b.read_time_minutes) || 999;
        return rA - rB;
      }
      if (sortOption === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // Default: 'newest'
      const timeA = new Date(a.published_at || a.created_at || 0).getTime();
      const timeB = new Date(b.published_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });

    return result;
  }, [blogs, searchQuery, sortOption]);

  const visibleBlogs = processedBlogs.slice(0, visibleCount);
  const hasMore = visibleCount < processedBlogs.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, processedBlogs.length));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setVisibleCount(10);
  };

  return (
    <div className={styles.container}>
      {/* Header with Title on Left and Search + Sort on Right */}
      <div className={styles.archiveHeader}>
        <div className={styles.headerInfo}>
          <h2 className={styles.archiveHeading}>All Experiments</h2>
          <p className={styles.archiveSubcopy}>
            Chronological archive of building notes, experiments, and reflections.
          </p>
        </div>

        <div className={styles.headerControls}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(10);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleClearSearch();
              }}
              className={styles.searchInput}
              aria-label="Search experiments"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className={styles.searchClearBtn}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort Box */}
          <div className={styles.sortBox}>
            <ArrowUpDown size={14} className={styles.sortIcon} aria-hidden="true" />
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setVisibleCount(10);
              }}
              className={styles.sortSelect}
              aria-label="Sort experiments"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="read_time_asc">Quick reads</option>
              <option value="title_asc">Alphabetical (A–Z)</option>
            </select>
          </div>

          {/* Dynamic Count Badge */}
          <span className={styles.archiveCountBadge}>
            {searchQuery.trim()
              ? `${processedBlogs.length} of ${blogs.length}`
              : `${blogs.length} ${blogs.length === 1 ? 'Article' : 'Articles'}`}
          </span>
        </div>
      </div>

      {/* Grid: Blog List on Left + Sticky Plant on Right */}
      <div className={styles.archiveGrid}>
        <div className={styles.archiveCol}>
          {visibleBlogs.length > 0 ? (
            <div className={styles.list} role="feed">
              {visibleBlogs.map((blog, idx) => {
                const cover = blog.cover_image || FALLBACKS[idx % FALLBACKS.length];
                const date = formatDate(blog.published_at);
                const readTime = blog.read_time_minutes ? `${blog.read_time_minutes} min read` : null;
                const preview = extractPreview(blog);

                return (
                  <Link
                    key={blog.id || blog.slug || idx}
                    href={`/blog/${blog.slug}`}
                    className={styles.row}
                  >
                    <div className={styles.thumbnailWrap}>
                      <img
                        src={cover}
                        alt=""
                        className={styles.thumbnail}
                        loading="lazy"
                      />
                    </div>

                    <div className={styles.contentWrap}>
                      <div className={styles.metaRow}>
                        <time dateTime={blog.published_at || undefined}>{date}</time>
                        {readTime && (
                          <>
                            <span className={styles.metaDot} aria-hidden="true" />
                            <span>{readTime}</span>
                          </>
                        )}
                        {blog.views > 0 && (
                          <>
                            <span className={styles.metaDot} aria-hidden="true" />
                            <span className={styles.viewsCount}>{blog.views} reads</span>
                          </>
                        )}
                      </div>

                      <h3 className={styles.title}>{blog.title}</h3>
                      <p className={styles.excerpt}>{preview}</p>
                    </div>

                    <div className={styles.actionWrap} aria-hidden="true">
                      <span className={styles.arrowCircle}>
                        <ArrowUpRight size={15} strokeWidth={2.2} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptySearch}>
              <div className={styles.emptySearchIcon}>
                <Search size={24} strokeWidth={2} />
              </div>
              <h4 className={styles.emptySearchTitle}>No experiments found</h4>
              <p className={styles.emptySearchText}>
                {searchQuery.trim()
                  ? `No stories matched "${searchQuery.trim()}". Try different keywords or reset.`
                  : 'No stories available in the archive yet.'}
              </p>
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className={styles.clearSearchBtn}
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {hasMore && (
            <div className={styles.loadMoreRow}>
              <button
                type="button"
                onClick={handleLoadMore}
                className={styles.loadMoreBtn}
              >
                Load More Stories ({processedBlogs.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
