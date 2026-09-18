import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BlogHeader from '@/components/Blog/BlogHeader';
import BlogFooter from '@/components/Blog/BlogFooter';
import NewsletterForm from '@/components/Email/NewsletterForm';
import SeriesCardDeck from '@/components/Blog/SeriesCardDeck';
import BlogArchiveList from '@/components/Blog/BlogArchiveList';
import styles from './page.module.css';

export const revalidate = 60;

export const metadata = {
  title: 'Experiments & Blog | Builders Daily',
  description: 'Deep dives, AI prototypes, and the messy process of building tomorrow.',
};

const FALLBACKS = [
  '/blog-page/fallback-desk.jpg',
  '/blog-page/fallback-wafers.jpg',
  '/blog-page/fallback-archive.jpg',
];

const DEFAULT_SERIES = [
  {
    id: 'series-reasoning',
    title: 'The Future of\nReasoning Models',
    count: '6 ARTICLES',
    image: '/blog-new/series-reasoning.png',
    tone: 'Orange',
  },
  {
    id: 'series-synthetic',
    title: 'Synthetic Data\nExplorations',
    count: '5 ARTICLES',
    image: '/blog-new/series-synthetic.png',
    tone: 'Light',
  },
  {
    id: 'series-creative',
    title: 'AI in Creative\nWorkflows',
    count: '4 ARTICLES',
    image: '/blog-new/series-creative.png',
    tone: 'Dark',
  },
  {
    id: 'series-neural',
    title: 'Neural Architecture\nFoundations',
    count: '8 ARTICLES',
    image: '/blog-new/series-reasoning.png',
    tone: 'Orange',
  },
  {
    id: 'series-agents',
    title: 'Autonomous Agent\nProtocols',
    count: '5 ARTICLES',
    image: '/blog-new/series-synthetic.png',
    tone: 'Light',
  },
  {
    id: 'series-multimodal',
    title: 'Multimodal Latent\nSpaces',
    count: '4 ARTICLES',
    image: '/blog-new/series-creative.png',
    tone: 'Dark',
  },
];

async function getBlogs() {
  const { data, error } = await supabase
    .from('builder_blogs')
    .select('id, title, slug, excerpt, content, cover_image, published_at, read_time_minutes, author_name, tags')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    const fallback = await supabase
      .from('builder_blogs')
      .select('id, title, slug, excerpt, content, cover_image, published_at, read_time_minutes')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (fallback.error) {
      console.error('Error fetching blogs:', fallback.error);
      return [];
    }
    return fallback.data || [];
  }

  return data || [];
}

function extractBlogPreview(blog) {
  if (blog.excerpt && blog.excerpt.trim().length > 6) {
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
      if (text.length > 8) {
        return text.length > 72 ? text.slice(0, 72) + '…' : text;
      }
    } catch {
      // fallback
    }
  }
  return 'Notes and reflections from the latest build.';
}

async function getBundles() {
  try {
    const { data, error } = await supabase
      .from('blog_bundles')
      .select('id, name, slug, description, cover_image, article_ids, is_featured, created_at')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) return data;

    if (error) {
      const retry = await supabase
        .from('blog_bundles')
        .select('id, name, slug, description, cover_image, article_ids, created_at')
        .order('created_at', { ascending: false });

      if (!retry.error && retry.data && retry.data.length > 0) return retry.data;
    }
  } catch (e) {
    // Table may not exist yet.
  }

  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'blog_bundles')
    .single();

  if (data?.value) {
    try {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    } catch (e) {
      return [];
    }
  }

  return [];
}

function parseIds(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function coverFor(entity, index = 0) {
  return entity?.cover_image || FALLBACKS[index % FALLBACKS.length];
}

function formatMeta(blog) {
  const date = blog.published_at
    ? format(new Date(blog.published_at), 'MMM d, yyyy')
    : 'Recently';
  const read = blog.read_time_minutes
    ? `${blog.read_time_minutes} min read`
    : null;
  return { date, read };
}

export default async function BlogFeed() {
  const [blogs, bundlesRaw] = await Promise.all([getBlogs(), getBundles()]);

  const blogById = new Map(blogs.map((blog) => [blog.id, blog]));
  const bundles = (Array.isArray(bundlesRaw) ? bundlesRaw : [])
    .map((bundle) => {
      const ids = parseIds(bundle.article_ids);
      const articles = ids.map((id) => blogById.get(id)).filter(Boolean);
      return { ...bundle, articles };
    })
    .sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));

  // Section 1: Latest blog (left 75%) + Past 3 blogs in sequence (right 25%)
  const leadBlog = blogs[0] || null;
  const leadMeta = leadBlog ? formatMeta(leadBlog) : null;
  const leadCover = leadBlog ? coverFor(leadBlog, 0) : FALLBACKS[0];

  const pastThreeBlogs = blogs.slice(1, 4);

  // Section 2: Curated Collections (from blog-new cover images & tones, mapped to bundles)
  const collections = DEFAULT_SERIES.map((defaultItem, idx) => {
    const bundle = bundles[idx];
    if (!bundle) return defaultItem;

    const count = bundle.articles?.length || 0;
    const firstArticleSlug = bundle.articles?.[0]?.slug;
    const hasCustomName =
      bundle.name &&
      bundle.name.toLowerCase() !== 'first 5' &&
      bundle.name.trim() !== '';

    return {
      id: bundle.id || defaultItem.id,
      title: hasCustomName ? bundle.name : defaultItem.title,
      count: count > 0 ? `${count} ${count === 1 ? 'STORY' : 'STORIES'}` : defaultItem.count,
      image: bundle.cover_image || defaultItem.image,
      tone: defaultItem.tone,
      href: firstArticleSlug ? `/blog/${firstArticleSlug}` : '/blog',
    };
  });

  return (
    <div className={styles.page}>
      <BlogHeader />

      <main className={styles.mainContainer}>
        {/* ===================================================================
            SECTION 1: HERO & RECENT TIMELINE (75:25 TWO-COLUMN RATIO)
            =================================================================== */}
        <section className={styles.heroSection} aria-label="Latest and recent stories">
          <div className={styles.heroGrid}>
            {/* Left 75% Column: Latest Blog */}
            <div className={styles.leadCol}>
              {leadBlog ? (
                <Link href={`/blog/${leadBlog.slug}`} className={styles.heroFrame}>
                  <img
                    src={leadCover}
                    alt=""
                    className={styles.heroImage}
                  />
                  <div className={styles.heroScrim} aria-hidden="true" />
                  <div className={styles.heroCopy}>
                    <p className={styles.heroMeta}>
                      <span className={styles.badgeLatest}>Latest Story</span>
                      <span>{leadMeta.date}</span>
                      {leadMeta.read && (
                        <>
                          <span className={styles.metaDot} aria-hidden="true" />
                          <span>{leadMeta.read}</span>
                        </>
                      )}
                    </p>
                    <h1 className={styles.heroTitle}>{leadBlog.title}</h1>
                    {leadBlog.excerpt && (
                      <p className={styles.heroExcerpt}>{leadBlog.excerpt}</p>
                    )}
                    <span className={styles.heroCta}>
                      Read story
                      <ArrowRight size={16} strokeWidth={2} />
                    </span>
                  </div>
                </Link>
              ) : (
                <div className={styles.heroFrame}>
                  <img src={FALLBACKS[0]} alt="" className={styles.heroImage} />
                  <div className={styles.heroScrim} aria-hidden="true" />
                  <div className={styles.heroCopy}>
                    <h1 className={styles.heroTitle}>No experiments yet</h1>
                    <p className={styles.heroExcerpt}>
                      Published stories will land here. Check back shortly.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right 25% Column: Past 3 blogs in sequence */}
            <div className={styles.recentCol}>
              <div className={styles.recentHeader}>
                <h2 className={styles.recentHeading}>Recent Stories</h2>
              </div>

              <div className={styles.recentStack}>
                {pastThreeBlogs.map((blog, index) => {
                  const meta = formatMeta(blog);
                  const cover = coverFor(blog, index + 1);
                  const preview = extractBlogPreview(blog);

                  return (
                    <Link
                      key={blog.id || blog.slug || index}
                      href={`/blog/${blog.slug}`}
                      className={styles.recentCard}
                    >
                      <div className={styles.recentThumbWrap}>
                        <img
                          src={cover}
                          alt=""
                          className={styles.recentThumb}
                          loading="lazy"
                        />
                      </div>
                      <div className={styles.recentContent}>
                        <div className={styles.recentMeta}>
                          <time>{meta.date}</time>
                        </div>
                        <h3 className={styles.recentTitle}>{blog.title}</h3>
                        {preview && (
                          <p className={styles.recentExcerpt}>{preview}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}

                {pastThreeBlogs.length === 0 && (
                  <div className={styles.emptyRecent}>
                    <p>More stories coming soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 2: COLLECTIONS & SERIES (BLOG-NEW STYLE, 3 IN SET, PILL PAGINATION)
            =================================================================== */}
        <SeriesCardDeck collections={collections} />

        {/* ===================================================================
            SECTION 3: ARCHIVE FEED & STICKY WATERCOLOR PLANT (85:15 RATIO)
            =================================================================== */}
        <section className={styles.archiveSection} id="all-stories" aria-label="Complete archive">
          <BlogArchiveList blogs={blogs}>
            {/* Right 15% Column: Sticky Watercolor Plant */}
            <aside className={styles.plantCol} aria-hidden="true">
              <div className={styles.plantSticky}>
                <div className={styles.plantVisual}>
                  <img
                    src="/watercolor-plant.png"
                    alt="Botanical illustration"
                    className={styles.plantImage}
                  />
                </div>
                <div className={styles.plantCaption}>
                  <span className={styles.plantText}>Peace &amp; Focus</span>
                </div>
              </div>
            </aside>
          </BlogArchiveList>
        </section>

        {/* Section 4 standalone newsletter removed as requested; moved to BlogFooter */}
      </main>

      <BlogFooter />
    </div>
  );
}
