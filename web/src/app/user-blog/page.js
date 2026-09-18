"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit3, Trash2, ArrowLeft, Eye, Clock } from 'lucide-react';
import Link from 'next/link';
import styles from '../admin-blog/blogAdmin.module.css';
import AccessDenied from '@/components/Admin/AccessDenied';

export default function UserBlogAdmin() {
  const { user, loading: authLoading, isWriter } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isWriter) {
      fetchBlogs();
    }
  }, [user, authLoading, isWriter]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      // 1. Fetch all blogs
      const { data: blogData, error: blogError } = await supabase
        .from('builder_blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (blogError) throw blogError;

      // 2. Fetch author mapping
      const { data: mappingData, error: mappingError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'blog_author_mapping')
        .single();

      let mapping = {};
      if (!mappingError && mappingData) {
        try {
          mapping = JSON.parse(mappingData.value || '{}');
        } catch (e) {}
      }

      // 3. Filter only current user's blogs
      if (blogData && user) {
        const userBlogs = blogData.filter(blog => mapping[blog.id] === user.id);
        setBlogs(userBlogs);
      }
    } catch (err) {
      console.error("Error fetching user blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    
    // Perform delete in Supabase
    const { error } = await supabase.from('builder_blogs').delete().eq('id', id);
    if (!error) {
      // Also clean up the author mapping
      try {
        const { data: mappingData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'blog_author_mapping')
          .single();
        
        if (mappingData) {
          const mapping = JSON.parse(mappingData.value || '{}');
          delete mapping[id];
          await supabase
            .from('site_settings')
            .upsert({
              key: 'blog_author_mapping',
              value: JSON.stringify(mapping),
              updated_at: new Date().toISOString()
            }, { onConflict: 'key' });
        }
      } catch (e) {}
      
      fetchBlogs();
    } else {
      alert('Error deleting post');
    }
  };

  if (authLoading) return <div className={styles.container}>Loading...</div>;
  if (!user || !isWriter) {
    return <AccessDenied user={user} />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/blog" className={styles.backButton}>
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <h1 className={styles.title}>My Blog Workspace</h1>
          <p className={styles.subtitle}>Write, edit, and publish your stories</p>
        </div>
        <Link href="/user-blog/new" className={styles.newButton}>
          <Plus size={18} /> New Post
        </Link>
      </header>

      {loading ? (
        <div className={styles.loading}>Loading your posts...</div>
      ) : (
        <div className={styles.grid}>
          {blogs.length === 0 ? (
            <div className={styles.empty}>You haven&apos;t written any blog posts yet. Write your first story!</div>
          ) : (
            blogs.map((blog) => (
              <div key={blog.id} className={styles.card}>
                {blog.cover_image && (
                  <img src={blog.cover_image} alt={blog.title || 'Cover'} className={styles.cardCover} />
                )}
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{blog.title || 'Untitled Draft'}</h3>
                    <span className={blog.status === 'published' ? styles.badgeLive : styles.badgeDraft}>
                      {blog.status.toUpperCase()}
                    </span>
                  </div>
                  <p className={styles.slug}>/{blog.slug}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b', marginBottom: '16px', marginTop: '-4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} /> {blog.views || 0} views
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {blog.read_time_minutes || 1} min read
                    </span>
                  </div>
                  <div className={styles.cardActions}>
                    <Link href={`/blog/${blog.slug}`} target="_blank" className={styles.actionBtn}>
                      View
                    </Link>
                    <Link href={`/user-blog/edit/${blog.id}`} className={styles.actionBtn}>
                      <Edit3 size={16} /> Edit
                    </Link>
                    <button onClick={() => handleDelete(blog.id)} className={styles.deleteBtn}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
