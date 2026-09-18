"use client";
import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import { supabase } from '@/lib/supabase';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Youtube } from '@tiptap/extension-youtube';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { ImageUploadExtension } from './Editor/ImageUploadExtension';
import SlashCommandExtension from './Editor/SlashCommandExtension';
import renderItems, { getSuggestionItems } from './Editor/SlashCommands';
import { Callout } from './Editor/CalloutExtension';
import { TweetExtensionEditor } from './Editor/TweetExtensionEditor';
import { GistExtensionEditor } from './Editor/GistExtensionEditor';
import { uploadImage } from '@/lib/uploadImage';
import Highlight from '@tiptap/extension-highlight';
import { ReferenceNode } from './Editor/ReferenceExtension';
import { BlockDeleteExtension } from './Editor/BlockDeleteExtension';

import 'tippy.js/dist/tippy.css';
import './tiptapExtensions.css';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bold, Italic, List, ListOrdered, Quote, Code, Settings, X, Highlighter, Layers, Check } from 'lucide-react';
import styles from './blogEditor.module.css';
import { useAuth } from '@/context/AuthContext';
import ThemeToggleSwitch from '@/components/ui/ThemeToggleSwitch';

const lowlight = createLowlight(common);

const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className={styles.fixedToolbar}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${styles.menuBtn} ${editor.isActive('bold') ? styles.active : ''}`}>
        <Bold size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${styles.menuBtn} ${editor.isActive('italic') ? styles.active : ''}`}>
        <Italic size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={`${styles.menuBtn} ${editor.isActive('highlight') ? styles.active : ''}`}>
        <Highlighter size={16} />
      </button>
      <div className={styles.divider} />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${styles.menuBtn} ${editor.isActive('heading', { level: 2 }) ? styles.active : ''}`}>
        H2
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${styles.menuBtn} ${editor.isActive('heading', { level: 3 }) ? styles.active : ''}`}>
        H3
      </button>
      <div className={styles.divider} />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${styles.menuBtn} ${editor.isActive('bulletList') ? styles.active : ''}`}>
        <List size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${styles.menuBtn} ${editor.isActive('orderedList') ? styles.active : ''}`}>
        <ListOrdered size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${styles.menuBtn} ${editor.isActive('blockquote') ? styles.active : ''}`}>
        <Quote size={16} />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`${styles.menuBtn} ${editor.isActive('codeBlock') ? styles.active : ''}`}>
        <Code size={16} />
      </button>
    </div>
  );
};

export default function BlogEditor({ initialData }) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  const titleTextareaRef = useRef(null);
  const excerptTextareaRef = useRef(null);

  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = titleTextareaRef.current.scrollHeight + 'px';
    }
  }, [title]);

  useEffect(() => {
    if (excerptTextareaRef.current) {
      excerptTextareaRef.current.style.height = 'auto';
      excerptTextareaRef.current.style.height = excerptTextareaRef.current.scrollHeight + 'px';
    }
  }, [excerpt]);

  // Collections / Bundles state
  const [bundles, setBundles] = useState([]);
  const [selectedBundleIds, setSelectedBundleIds] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(true);
  const [showQuickCreateBundle, setShowQuickCreateBundle] = useState(false);
  const [quickBundleName, setQuickBundleName] = useState('');
  const [creatingBundle, setCreatingBundle] = useState(false);

  useEffect(() => {
    fetchBundles();
  }, [initialData?.id]);

  const fetchBundles = async () => {
    setLoadingBundles(true);
    let loaded = [];
    try {
      const { data, error } = await supabase
        .from('blog_bundles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        loaded = data;
      }
    } catch (e) {}

    if (loaded.length === 0) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'blog_bundles')
          .single();
        if (!error && data) {
          loaded = JSON.parse(data.value || '[]');
        }
      } catch (err) {}
    }

    setBundles(loaded);

    if (initialData?.id) {
      const containing = loaded
        .filter(b => Array.isArray(b.article_ids) && b.article_ids.includes(initialData.id))
        .map(b => b.id);
      setSelectedBundleIds(containing);
    }
    setLoadingBundles(false);
  };

  const handleQuickCreateBundle = async (e) => {
    if (e) e.preventDefault();
    if (!quickBundleName.trim()) return;
    setCreatingBundle(true);
    const newName = quickBundleName.trim();
    const autoSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'bundle_' + Date.now();
    
    const newBundle = {
      id: newId,
      name: newName,
      slug: autoSlug,
      description: '',
      cover_image: '',
      article_ids: initialData?.id ? [initialData.id] : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let savedViaTable = false;
    try {
      const { error } = await supabase.from('blog_bundles').upsert(newBundle, { onConflict: 'id' });
      if (!error) savedViaTable = true;
    } catch(err) {}

    const updatedList = [newBundle, ...bundles];
    if (!savedViaTable) {
      try {
        await supabase.from('site_settings').upsert({
          key: 'blog_bundles',
          value: JSON.stringify(updatedList),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      } catch(err) {}
    }

    setBundles(updatedList);
    setSelectedBundleIds(prev => [...prev, newId]);
    setQuickBundleName('');
    setShowQuickCreateBundle(false);
    setCreatingBundle(false);
  };

  const handleToggleBundle = (bundleId) => {
    setSelectedBundleIds(prev =>
      prev.includes(bundleId) ? prev.filter(id => id !== bundleId) : [...prev, bundleId]
    );
  };

  useEffect(() => {
    if (!initialData && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [title, initialData]);

  useEffect(() => {
    if (initialData?.id) {
      const fetchSeo = async () => {
        try {
          const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'blog_seo_metadata')
            .single();
          if (data) {
            const mapping = JSON.parse(data.value || '{}');
            const seo = mapping[initialData.id] || {};
            setMetaTitle(seo.meta_title || '');
            setMetaDescription(seo.meta_description || '');
            setMetaKeywords(seo.meta_keywords || '');
          }
        } catch (e) {}
      };
      fetchSeo();
    }
  }, [initialData]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleContextMenu = (e) => {
    if (!editor) return;
    
    // Stop event propagation and prevent default context menu
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use CodeBlockLowlight instead
      }),
      Highlight,
      Placeholder.configure({ placeholder: 'Write your story here...' }),
      LinkExtension.configure({ openOnClick: false }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Youtube.configure({
        controls: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ImageUploadExtension,
      Callout,
      TweetExtensionEditor,
      GistExtensionEditor,
      SlashCommandExtension.configure({
        suggestion: {
          items: getSuggestionItems,
          render: renderItems,
        },
      }),
      ReferenceNode,
      BlockDeleteExtension,
    ],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class: styles.tiptap,
      },
    },
  });

  const handleSave = async (status) => {
    if (!title || !slug) return alert('Title and Slug are required');
    setSaving(true);
    
    const content = editor.getJSON();
    const textContent = editor.getText();
    const words = textContent.trim().split(/\s+/).length;
    const read_time_minutes = Math.max(1, Math.ceil(words / 200));

    const payload = {
      title,
      slug,
      excerpt,
      content,
      cover_image: coverImage,
      read_time_minutes,
      status
    };

    if (status === 'published' && (!initialData || initialData.status === 'draft')) {
      payload.published_at = new Date().toISOString();
    }

    let error;
    let newPostId = initialData?.id;

    if (initialData?.id) {
      const { error: updateError } = await supabase.from('builder_blogs').update(payload).eq('id', initialData.id);
      error = updateError;
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from('builder_blogs')
        .insert(payload)
        .select('id')
        .single();
      error = insertError;
      if (!error && insertData) {
        newPostId = insertData.id;
      }
    }

    // Save author mapping for new posts
    if (!error && newPostId && user) {
      try {
        const { data: mappingData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'blog_author_mapping')
          .single();
        
        let currentMapping = {};
        if (mappingData) {
          try {
            currentMapping = JSON.parse(mappingData.value || '{}');
          } catch (e) {}
        }
        
        // Only map if not already mapped, or if we want to ensure ownership
        if (!currentMapping[newPostId]) {
          currentMapping[newPostId] = user.id;
          await supabase
            .from('site_settings')
            .upsert({
              key: 'blog_author_mapping',
              value: JSON.stringify(currentMapping),
              updated_at: new Date().toISOString()
            }, { onConflict: 'key' });
        }
      } catch (mapErr) {
        console.error("Failed to save blog author mapping:", mapErr);
      }
    }

    // Save SEO metadata
    if (!error && newPostId) {
      try {
        const { data: seoData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'blog_seo_metadata')
          .single();
        
        let seoMapping = {};
        if (seoData) {
          try {
            seoMapping = JSON.parse(seoData.value || '{}');
          } catch (e) {}
        }
        
        seoMapping[newPostId] = {
          meta_title: metaTitle,
          meta_description: metaDescription,
          meta_keywords: metaKeywords
        };
        
        await supabase
          .from('site_settings')
          .upsert({
            key: 'blog_seo_metadata',
            value: JSON.stringify(seoMapping),
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      } catch (seoErr) {
        console.error("Failed to save SEO metadata:", seoErr);
      }
    }

    // Sync collections / bundles for this article
    if (!error && newPostId) {
      try {
        const updatedBundles = bundles.map(b => {
          const isSelected = selectedBundleIds.includes(b.id);
          const currentArticles = Array.isArray(b.article_ids) ? [...b.article_ids] : [];
          const hasArticle = currentArticles.includes(newPostId);

          if (isSelected && !hasArticle) {
            return {
              ...b,
              article_ids: [...currentArticles, newPostId],
              updated_at: new Date().toISOString()
            };
          } else if (!isSelected && hasArticle) {
            return {
              ...b,
              article_ids: currentArticles.filter(id => id !== newPostId),
              updated_at: new Date().toISOString()
            };
          }
          return b;
        });

        // 1. Try table upsert for each changed bundle
        for (const bundle of updatedBundles) {
          try {
            await supabase.from('blog_bundles').upsert(bundle, { onConflict: 'id' });
          } catch (e) {}
        }

        // 2. Always persist to site_settings fallback
        await supabase.from('site_settings').upsert({
          key: 'blog_bundles',
          value: JSON.stringify(updatedBundles),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      } catch (bundleErr) {
        console.error("Failed to sync article bundles:", bundleErr);
      }
    }

    setSaving(false);
    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      alert('Saved successfully!');
      if (user?.email === 'admin@test.com') {
        router.push('/admin-blog');
      } else {
        router.push('/user-blog');
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href={user?.email === 'admin@test.com' ? '/admin-blog' : '/user-blog'} className={styles.backBtn}>
            <ArrowLeft size={18} />
          </Link>
          <span className={styles.draftStatus}>{saving ? 'Saving...' : (initialData?.status === 'published' ? 'Published' : 'Draft')}</span>
          {selectedBundleIds.length > 0 && (
            <div 
              className={styles.collectionBadgeHeader} 
              onClick={() => setShowSettings(true)}
              title="Story is assigned to collection(s). Click to manage in settings."
            >
              <Layers size={13} style={{ color: 'var(--primary, #f97316)' }} />
              <span>
                {bundles.find(b => b.id === selectedBundleIds[0])?.name || 'In Collection'}
                {selectedBundleIds.length > 1 ? ` (+${selectedBundleIds.length - 1})` : ''}
              </span>
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <ThemeToggleSwitch />
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`${styles.iconBtn} ${showSettings ? styles.iconBtnActive : ''}`} 
            title="Publishing Settings & Collections"
          >
            <Settings size={18} />
          </button>
          <button disabled={saving} onClick={() => handleSave('draft')} className={styles.saveDraftBtn}>
            Save Draft
          </button>
          <button disabled={saving} onClick={() => handleSave('published')} className={styles.publishBtn}>
            Publish
          </button>
        </div>
      </header>

      {showSettings && (
        <div className={styles.settingsPanel}>
          <div className={styles.settingsHeader}>
            <h3>Story Settings</h3>
            <button onClick={() => setShowSettings(false)} className={styles.closeBtn}><X size={16} /></button>
          </div>
          <div className={styles.settingsBody}>
            {/* Collections & Series */}
            <div className={styles.collectionSection}>
              <div className={styles.collectionHeaderRow}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Layers size={13} style={{ color: 'var(--primary, #f97316)' }} /> Collection / Series
                </label>
                <button
                  type="button"
                  className={styles.quickAddBtn}
                  onClick={() => setShowQuickCreateBundle(prev => !prev)}
                >
                  {showQuickCreateBundle ? 'Cancel' : '+ New'}
                </button>
              </div>

              {showQuickCreateBundle && (
                <div className={styles.quickCreateBox}>
                  <input
                    type="text"
                    placeholder="Collection name..."
                    className={styles.quickCreateInput}
                    value={quickBundleName}
                    onChange={(e) => setQuickBundleName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleQuickCreateBundle();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.quickCreateSubmit}
                    disabled={creatingBundle || !quickBundleName.trim()}
                    onClick={handleQuickCreateBundle}
                  >
                    {creatingBundle ? '...' : 'Add'}
                  </button>
                </div>
              )}

              {loadingBundles ? (
                <div style={{ fontSize: '12px', color: 'var(--textMuted, #64748b)', padding: '6px 0' }}>
                  Loading collections...
                </div>
              ) : bundles.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--textMuted, #64748b)', padding: '4px 0' }}>
                  No collections yet. Click "+ New" above to create one.
                </div>
              ) : (
                <div className={styles.collectionList}>
                  {bundles.map(bundle => {
                    const isSelected = selectedBundleIds.includes(bundle.id);
                    const articleCount = Array.isArray(bundle.article_ids) ? bundle.article_ids.length : 0;
                    return (
                      <div
                        key={bundle.id}
                        className={`${styles.collectionItem} ${isSelected ? styles.collectionItemSelected : ''}`}
                        onClick={() => handleToggleBundle(bundle.id)}
                      >
                        <div className={styles.collectionItemLeft}>
                          <div className={`${styles.collectionCheckbox} ${isSelected ? styles.collectionCheckboxChecked : ''}`}>
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className={styles.collectionItemName} title={bundle.name}>
                            {bundle.name}
                          </span>
                        </div>
                        <span className={styles.collectionItemCount}>
                          {isSelected && !bundle.article_ids?.includes(initialData?.id)
                            ? `+1 new`
                            : `${articleCount} stories`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <label style={{ marginTop: '4px', display: 'block' }}>URL Slug</label>
            <input
              type="text"
              placeholder="url-slug-goes-here"
              className={styles.settingInput}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />

            <label style={{ marginTop: '10px', display: 'block' }}>SEO Meta Title</label>
            <input
              type="text"
              placeholder={title || "Custom page title (optional)"}
              className={styles.settingInput}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
            
            <label style={{ marginTop: '10px', display: 'block' }}>SEO Meta Description</label>
            <textarea
              placeholder={excerpt || "Custom meta description (optional)"}
              className={styles.settingTextarea}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
            
            <label style={{ marginTop: '10px', display: 'block' }}>SEO Meta Keywords</label>
            <input
              type="text"
              placeholder="blog, tech, ai (optional)"
              className={styles.settingInput}
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className={styles.editorMain}>
        {!coverImage && (
          <button 
            className={styles.addCoverBtn} 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async () => {
                if (input.files?.length) {
                  setUploadingCover(true);
                  try {
                    const url = await uploadImage(input.files[0]);
                    setCoverImage(url);
                  } catch(e) {
                    alert('Upload failed');
                  }
                  setUploadingCover(false);
                }
              };
              input.click();
            }}
          >
            {uploadingCover ? 'Uploading...' : 'Add Cover Image'}
          </button>
        )}
        
        {coverImage && (
          <div className={styles.coverImageContainer}>
            <img src={coverImage} alt="Cover" className={styles.coverImage} />
            <button className={styles.removeCoverBtn} onClick={() => setCoverImage(null)}>
              Remove
            </button>
          </div>
        )}

        <textarea
          ref={titleTextareaRef}
          rows={1}
          placeholder="Title"
          className={styles.titleInput}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              excerptTextareaRef.current?.focus();
            }
          }}
        />
        
        <textarea
          ref={excerptTextareaRef}
          placeholder="Subtitle / Excerpt"
          className={styles.subtitleInput}
          value={excerpt}
          onChange={(e) => {
            setExcerpt(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (editor && !editor.isFocused) {
                editor.commands.focus('start');
              }
            }
          }}
          rows={1}
        />

        <EditorToolbar editor={editor} />
        
        <div 
          className={styles.editorWrapper}
          onClick={() => {
            if (editor && !editor.isFocused) {
              editor.commands.focus();
            }
          }}
          onContextMenu={handleContextMenu}
        >
          <EditorContent editor={editor} />
        </div>

        {contextMenu && (
          <div 
            className={styles.contextMenu} 
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => { editor.chain().focus().toggleBold().run(); setContextMenu(null); }} 
              className={`${styles.contextMenuBtn} ${editor.isActive('bold') ? styles.contextMenuActive : ''}`}
              title="Bold"
            >
              <Bold size={14} />
            </button>
            <button 
              onClick={() => { editor.chain().focus().toggleItalic().run(); setContextMenu(null); }} 
              className={`${styles.contextMenuBtn} ${editor.isActive('italic') ? styles.contextMenuActive : ''}`}
              title="Italic"
            >
              <Italic size={14} />
            </button>
            <button 
              onClick={() => { editor.chain().focus().toggleHighlight().run(); setContextMenu(null); }} 
              className={`${styles.contextMenuBtn} ${editor.isActive('highlight') ? styles.contextMenuActive : ''}`}
              title="Highlight"
            >
              <Highlighter size={14} />
            </button>
            <div className={styles.contextMenuDivider} />
            <button 
              onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setContextMenu(null); }} 
              className={`${styles.contextMenuBtn} ${editor.isActive('heading', { level: 2 }) ? styles.contextMenuActive : ''}`}
            >
              H2
            </button>
            <button 
              onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setContextMenu(null); }} 
              className={`${styles.contextMenuBtn} ${editor.isActive('heading', { level: 3 }) ? styles.contextMenuActive : ''}`}
            >
              H3
            </button>
            <div className={styles.contextMenuDivider} />
            <button 
              onClick={() => { editor.chain().focus().toggleBulletList().run(); setContextMenu(null); }} 
              className={`${styles.contextMenuBtn} ${editor.isActive('bulletList') ? styles.contextMenuActive : ''}`}
              title="Bullet List"
            >
              <List size={14} />
            </button>
            <button 
              onClick={() => { editor.chain().focus().toggleOrderedList().run(); setContextMenu(null); }} 
              className={`${styles.contextMenuBtn} ${editor.isActive('orderedList') ? styles.contextMenuActive : ''}`}
              title="Ordered List"
            >
              <ListOrdered size={14} />
            </button>
            <button 
              onClick={() => { editor.chain().focus().toggleBlockquote().run(); setContextMenu(null); }} 
              className={`${styles.contextMenuBtn} ${editor.isActive('blockquote') ? styles.contextMenuActive : ''}`}
              title="Blockquote"
            >
              <Quote size={14} />
            </button>
            <button 
              onClick={() => { editor.chain().focus().toggleCodeBlock().run(); setContextMenu(null); }} 
              className={`${styles.contextMenuBtn} ${editor.isActive('codeBlock') ? styles.contextMenuActive : ''}`}
              title="Code Block"
            >
              <Code size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
