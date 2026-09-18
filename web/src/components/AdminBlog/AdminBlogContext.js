"use client";
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const AdminBlogContext = createContext(null);

export function AdminBlogProvider({ children }) {
  const { user, loading: authLoading, isWriter, isAdmin } = useAuth();

  // Articles state
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bundles / Collections state
  const [bundles, setBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState(null);
  const [bundleForm, setBundleForm] = useState({
    name: '',
    slug: '',
    description: '',
    cover_image: '',
    article_ids: []
  });
  const [articleSearchInModal, setArticleSearchInModal] = useState('');
  const [savingBundle, setSavingBundle] = useState(false);

  useEffect(() => {
    if (!authLoading && isWriter) {
      fetchBlogs();
      fetchBundles();
    }
  }, [user, authLoading, isWriter]);

  const fetchBlogs = async () => {
    if (blogs.length === 0) setLoading(true);
    const { data, error } = await supabase
      .from('builder_blogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setBlogs(data);
    }
    setLoading(false);
  };

  const fetchBundles = async () => {
    setBundlesLoading(true);
    try {
      // 1. Try fetching from dedicated table
      const { data, error } = await supabase
        .from('blog_bundles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBundles(data);
        setBundlesLoading(false);
        return;
      }
    } catch (e) {
      // Table may not exist yet, fallback
    }

    // 2. Fallback to site_settings table
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'blog_bundles')
        .single();

      if (!error && data) {
        setBundles(JSON.parse(data.value || '[]'));
      }
    } catch (err) {
      console.warn("Could not fetch bundles from site_settings:", err);
    } finally {
      setBundlesLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const postTitle = title ? `"${title}"` : 'this article';
    if (!window.confirm(`Delete ${postTitle}? This cannot be undone.`)) return;
    const { error } = await supabase.from('builder_blogs').delete().eq('id', id);
    if (!error) {
      fetchBlogs();
    } else {
      alert('Error deleting post: ' + error.message);
    }
  };

  // --- BUNDLE MANAGEMENT ---
  const handleOpenNewBundleModal = () => {
    setEditingBundleId(null);
    setBundleForm({
      name: '',
      slug: '',
      description: '',
      cover_image: '',
      article_ids: []
    });
    setArticleSearchInModal('');
    setIsBundleModalOpen(true);
  };

  const handleOpenEditBundleModal = (bundle) => {
    setEditingBundleId(bundle.id);
    setBundleForm({
      name: bundle.name || '',
      slug: bundle.slug || '',
      description: bundle.description || '',
      cover_image: bundle.cover_image || '',
      article_ids: Array.isArray(bundle.article_ids) ? [...bundle.article_ids] : []
    });
    setArticleSearchInModal('');
    setIsBundleModalOpen(true);
  };

  const handleBundleNameChange = (name) => {
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setBundleForm(prev => ({
      ...prev,
      name,
      slug: prev.slug === '' || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug
    }));
  };

  const handleToggleArticleInBundle = (articleId) => {
    setBundleForm(prev => {
      const exists = prev.article_ids.includes(articleId);
      if (exists) {
        return {
          ...prev,
          article_ids: prev.article_ids.filter(id => id !== articleId)
        };
      } else {
        return {
          ...prev,
          article_ids: [...prev.article_ids, articleId]
        };
      }
    });
  };

  const handleMoveArticleInBundle = (index, direction) => {
    setBundleForm(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.article_ids.length) return prev;
      const updated = [...prev.article_ids];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return { ...prev, article_ids: updated };
    });
  };

  const handleSaveBundle = async () => {
    if (!bundleForm.name.trim()) {
      alert('Please enter a name for the collection.');
      return;
    }

    setSavingBundle(true);
    const finalSlug = bundleForm.slug.trim() || bundleForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const bundleId = editingBundleId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'bundle_' + Date.now());

    const bundlePayload = {
      id: bundleId,
      name: bundleForm.name.trim(),
      slug: finalSlug,
      description: bundleForm.description.trim(),
      cover_image: bundleForm.cover_image.trim(),
      article_ids: bundleForm.article_ids,
      updated_at: new Date().toISOString(),
      created_at: editingBundleId 
        ? (bundles.find(b => b.id === editingBundleId)?.created_at || new Date().toISOString())
        : new Date().toISOString()
    };

    let savedViaTable = false;
    try {
      const { error: tableError } = await supabase
        .from('blog_bundles')
        .upsert(bundlePayload, { onConflict: 'id' });

      if (!tableError) {
        savedViaTable = true;
      }
    } catch (e) {
      savedViaTable = false;
    }

    // If table write failed (or table doesn't exist yet), persist to site_settings fallback
    if (!savedViaTable) {
      const updatedBundlesList = editingBundleId
        ? bundles.map(b => b.id === editingBundleId ? bundlePayload : b)
        : [bundlePayload, ...bundles];

      await supabase
        .from('site_settings')
        .upsert({
          key: 'blog_bundles',
          value: JSON.stringify(updatedBundlesList),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    }

    // Refresh state
    await fetchBundles();
    setSavingBundle(false);
    setIsBundleModalOpen(false);
  };

  const handleDeleteBundle = async (bundleId, bundleName) => {
    if (!window.confirm(`Delete collection "${bundleName}"? The articles themselves will not be deleted.`)) return;

    let deletedViaTable = false;
    try {
      const { error } = await supabase
        .from('blog_bundles')
        .delete()
        .eq('id', bundleId);
      if (!error) deletedViaTable = true;
    } catch (e) {}

    // Also update fallback site_settings
    const updated = bundles.filter(b => b.id !== bundleId);
    setBundles(updated);

    await supabase
      .from('site_settings')
      .upsert({
        key: 'blog_bundles',
        value: JSON.stringify(updated),
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    fetchBundles();
  };

  // Status counts
  const counts = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter(b => b.status === 'published').length;
    const drafts = blogs.filter(b => b.status === 'draft' || !b.status).length;
    return { total, published, drafts };
  }, [blogs]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const value = {
    user,
    authLoading,
    isWriter,
    isAdmin,
    blogs,
    loading,
    fetchBlogs,
    handleDelete,
    counts,
    formatDate,
    bundles,
    bundlesLoading,
    fetchBundles,
    isBundleModalOpen,
    setIsBundleModalOpen,
    editingBundleId,
    bundleForm,
    setBundleForm,
    articleSearchInModal,
    setArticleSearchInModal,
    savingBundle,
    handleOpenNewBundleModal,
    handleOpenEditBundleModal,
    handleBundleNameChange,
    handleToggleArticleInBundle,
    handleMoveArticleInBundle,
    handleSaveBundle,
    handleDeleteBundle,
  };

  return (
    <AdminBlogContext.Provider value={value}>
      {children}
    </AdminBlogContext.Provider>
  );
}

export function useAdminBlog() {
  const context = useContext(AdminBlogContext);
  if (!context) {
    throw new Error('useAdminBlog must be used within an AdminBlogProvider');
  }
  return context;
}
