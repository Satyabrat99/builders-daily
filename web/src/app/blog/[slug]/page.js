import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Mail, Link as LinkIcon } from 'lucide-react';
import styles from './blogPost.module.css';
import ViewTracker from '@/components/Blog/ViewTracker';
import RichTextRenderer from '@/components/Blog/RichTextRenderer';
import BlogHeader from '@/components/Blog/BlogHeader';
import BlogFooter from '@/components/Blog/BlogFooter';
import '@/components/Admin/tiptapExtensions.css';

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Youtube } from '@tiptap/extension-youtube';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Callout } from '@/components/Admin/Editor/CalloutExtension';
import { TweetExtension } from '@/components/Admin/Editor/TweetExtension';
import { GistExtension } from '@/components/Admin/Editor/GistExtension';
import Highlight from '@tiptap/extension-highlight';

import TableOfContents from '@/components/Blog/TableOfContents';
import { Playfair_Display, Inter } from 'next/font/google';
const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--font-gt-super' });
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sohne' });

const lowlight = createLowlight(common);

import Heading from '@tiptap/extension-heading';
import { ReferenceNode } from '@/components/Admin/Editor/ReferenceExtension';

const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
      },
    }
  },
});

export const revalidate = 60;

export async function generateStaticParams() {
  const { data: blogs } = await supabase
    .from('builder_blogs')
    .select('slug')
    .eq('status', 'published');

  return (blogs || []).map((blog) => ({
    slug: blog.slug,
  }));
}

async function getBlogPost(slug) {
  const { data, error } = await supabase
    .from('builder_blogs')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !data) return null;
  return data;
}

async function getRecentPosts(excludeSlug) {
  const { data } = await supabase
    .from('builder_blogs')
    .select('id, title, slug, excerpt, cover_image, published_at, read_time_minutes')
    .eq('status', 'published')
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(3);
  return data || [];
}

export async function generateMetadata({ params }) {
  const p = await params;
  const slug = p.slug;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  let seoData = {};
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'blog_seo_metadata')
      .single();
    
    if (data) {
      const mapping = JSON.parse(data.value || '{}');
      seoData = mapping[post.id] || {};
    }
  } catch (e) {}

  const title = seoData.meta_title || post.title;
  const description = seoData.meta_description || post.excerpt || '';
  const keywords = seoData.meta_keywords || '';

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://buildersdaily.com/blog/${slug}`,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
      type: 'article',
      publishedTime: post.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image ? [post.cover_image] : [],
    }
  };
}

export default async function BlogPost({ params }) {
  const p = await params;
  const slug = p.slug;
  const post = await getBlogPost(slug);
  const recentPosts = await getRecentPosts(slug);

  if (!post) {
    notFound();
  }

  // Extract headings and inject IDs
  const headings = [];
  let htmlContent = '';

  if (post.content?._engine === 'lexical') {
    // Lexical engine: use the exported semantic HTML and inject heading IDs for TOC
    let rawHtml = post.content.html || '';
    rawHtml = rawHtml.replace(/<(h[23])>(.*?)<\/\1>/gi, (match, tag, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const level = parseInt(tag[1], 10);
      headings.push({ id, text: cleanText, level });
      return `<${tag} id="${id}">${text}</${tag}>`;
    });
    htmlContent = rawHtml;
  } else if (post.content) {
    const injectIdsAndExtractHeadings = (node) => {
      if (node.type === 'heading' && node.attrs && (node.attrs.level === 2 || node.attrs.level === 3)) {
        const text = node.content?.map(c => c.text).join('') || '';
        if (text) {
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          node.attrs = { ...node.attrs, id };
          headings.push({ id, text, level: node.attrs.level });
        }
      }
      if (node.content) {
        node.content.forEach(injectIdsAndExtractHeadings);
      }
    };

    injectIdsAndExtractHeadings(post.content);

    // Convert TipTap JSON to HTML
    htmlContent = generateHTML(post.content, [
      StarterKit.configure({ codeBlock: false, heading: false }),
      CustomHeading,
      LinkExtension.configure({ openOnClick: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Youtube,
      TaskList,
      TaskItem,
      Table,
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Callout,
      TweetExtension,
      GistExtension,
      Highlight,
      ReferenceNode
    ]);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.cover_image ? [post.cover_image] : [],
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at || post.published_at || post.created_at,
    "description": post.excerpt || '',
    "author": {
      "@type": "Organization",
      "name": "Builders Daily",
      "logo": {
        "@type": "ImageObject",
        "url": "https://buildersdaily.com/builders%20daily-webp.webp"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Builders Daily",
      "logo": {
        "@type": "ImageObject",
        "url": "https://buildersdaily.com/builders%20daily-webp.webp"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogHeader />
      <main className={`${styles.pageWrapper} ${playfair.variable} ${inter.variable}`}>
        <ViewTracker slug={slug} />
      
      <div className={styles.layoutContainer}>
        {post.cover_image && (
          <div className={styles.coverImageWrapper}>
            <img 
              src={post.cover_image} 
              alt={post.title} 
              className={styles.coverImage} 
            />
          </div>
        )}

        {/* Left Sidebar TOC & Meta */}
        <aside className={styles.leftSidebar}>
          <div className={styles.leftSticky}>
            <TableOfContents headings={headings} />
          </div>
        </aside>

        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post.title}</h1>
            {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
          </header>


          <div className={styles.content}>
            <RichTextRenderer htmlContent={htmlContent} />
          </div>

          <div className={styles.authorMetaBar}>
            <div className={styles.authorBlock}>
              <div className={styles.authorAvatar}>B</div>
              <div className={styles.authorInfo}>
                <div className={styles.authorName}>Builder Daily</div>
                <div className={styles.metaDate}>
                  {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Recently'}
                  {post.read_time_minutes > 0 && ` · ${post.read_time_minutes} min read`}
                </div>
              </div>
            </div>

            <div className={styles.shareIcons}>
              <button className={styles.shareBtn} aria-label="Share via Message"><MessageCircle size={16} /></button>
              <button className={styles.shareBtn} aria-label="Share via Email"><Mail size={16} /></button>
              <button className={styles.shareBtn} aria-label="Copy Link"><LinkIcon size={16} /></button>
            </div>
          </div>
        </article>

        {recentPosts.length > 0 && (
          <section className={styles.recentPosts}>
            <h3 className={styles.recentPostsTitle}>More Experiments</h3>
            <div className={styles.recentGrid}>
              {recentPosts.map((recent) => (
                <Link key={recent.id} href={`/blog/${recent.slug}`} className={styles.recentCard}>
                  <div className={styles.recentCardImage}>
                    {recent.cover_image
                      ? <img src={recent.cover_image} alt={recent.title} className={styles.recentCardImg} />
                      : <div className={styles.recentCardPlaceholder} />}
                  </div>
                  <div className={styles.recentCardBody}>
                    <p className={styles.recentCardMeta}>
                      {recent.published_at ? format(new Date(recent.published_at), 'MMM d, yyyy') : 'Recently'}
                      {recent.read_time_minutes > 0 && ` · ${recent.read_time_minutes} min read`}
                    </p>
                    <h4 className={styles.recentCardTitle}>{recent.title}</h4>
                    {recent.excerpt && <p className={styles.recentCardExcerpt}>{recent.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}


        <footer className={styles.footer}>
          <div className={styles.aboutBlock}>
            <h3 className={styles.footerTitle}>More from Builder</h3>
            <p className={styles.footerDesc}>
              Get the best AI models, tools, and repos curated daily.
            </p>
            <Link href="/" className={styles.footerBtn}>
              View Daily Report
            </Link>
          </div>
          
          <Link href="/blog" className={styles.backBtn}>
            <ArrowLeft size={16} /> Back to Experiments
          </Link>
        </footer>
      </div>
    </main>

      <BlogFooter />
    </>
  );
}
