"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from '@/components/Admin/adminStyles';
import { Section } from '@/components/Admin/slots/ReportTabSlot';
import { 
  Sparkles, 
  ExternalLink, 
  Check, 
  Trash2, 
  Plus, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  PenTool, 
  Terminal, 
  Code2, 
  Scale, 
  Link as LinkIcon,
  Star,
  CheckCircle,
  AlertCircle,
  Edit3,
  SlidersHorizontal,
  Eye,
  X,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Power,
  Info
} from 'lucide-react';
import BaseModal from '@/components/ui/BaseModal';
import { INITIAL_GOODIES } from '@/lib/goodiesData';
import { GoodiesIcon } from '@/components/ui/SectionIcons';
import { supabase } from '@/lib/supabase';



const PLATFORMS = [
  { id: 'sheets', label: 'Google Sheet', icon: FileSpreadsheet },
  { id: 'notion', label: 'Notion OS', icon: FileText },
  { id: 'figma', label: 'Figma Kit', icon: PenTool },
  { id: 'cursorrules', label: 'Cursor Rules', icon: Terminal },
  { id: 'code', label: 'Open Source', icon: Code2 },
  { id: 'legal', label: 'Legal / SAFE', icon: Scale },
  { id: 'tool', label: 'Free Tool', icon: ExternalLink }
];

const CATEGORIES = ['Vibecoders', 'SaaS Builders', 'Series Founders'];

export default function GoodiesTabSlot() {
  const [goodies, setGoodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Quick Scraper Form State
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [stagedGoody, setStagedGoody] = useState(null);
  const [savingGoody, setSavingGoody] = useState(false);

  // Active filter in live list
  const [activeFilter, setActiveFilter] = useState('All');

  // Helper to obtain authorized headers with current Supabase session
  const getAuthHeaders = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
      }
    } catch (e) {}
    return { 'Content-Type': 'application/json' };
  };

  // Load goodies from API
  const loadGoodies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goodies?admin=true&status=all');
      const data = await res.json();
      let list = (data.goodies && data.goodies.length > 0) ? data.goodies : INITIAL_GOODIES;

      // Check for live sequence order from server or localStorage
      let savedOrder = (data.live_order && Array.isArray(data.live_order) && data.live_order.length > 0) 
        ? data.live_order 
        : null;

      if (!savedOrder) {
        try {
          const cached = localStorage.getItem('builder_goodies_live_order');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) savedOrder = parsed;
          }
        } catch (e) {}
      }

      if (savedOrder && Array.isArray(savedOrder) && savedOrder.length > 0) {
        const liveItems = [];
        const itemMap = new Map(list.map(g => [g.id, g]));
        for (const id of savedOrder) {
          if (itemMap.has(id)) {
            liveItems.push({ ...itemMap.get(id), is_featured: true });
            itemMap.delete(id);
          }
        }
        const remaining = Array.from(itemMap.values()).map(g => ({
          ...g,
          is_featured: false
        }));
        list = [...liveItems, ...remaining];
      }

      setGoodies(list);
    } catch (err) {
      console.warn('Failed to fetch from /api/goodies, fallback to seed:', err);
      let fallbackList = INITIAL_GOODIES;
      try {
        const cached = localStorage.getItem('builder_goodies_live_order');
        if (cached) {
          const savedOrder = JSON.parse(cached);
          if (Array.isArray(savedOrder) && savedOrder.length > 0) {
            const liveItems = [];
            const itemMap = new Map(fallbackList.map(g => [g.id, g]));
            for (const id of savedOrder) {
              if (itemMap.has(id)) {
                liveItems.push({ ...itemMap.get(id), is_featured: true });
                itemMap.delete(id);
              }
            }
            const remaining = Array.from(itemMap.values()).map(g => ({ ...g, is_featured: false }));
            fallbackList = [...liveItems, ...remaining];
          }
        }
      } catch (e) {}
      setGoodies(fallbackList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoodies();
  }, []);

  const showNotification = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // 1. Scrape metadata from URL
  const handleScrape = async (e) => {
    e?.preventDefault();
    if (!scrapeUrl.trim()) return;

    setScraping(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/goodies/scrape-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setStagedGoody({
          title: data.title || '',
          description: data.description || '',
          resource_url: data.resource_url || scrapeUrl.trim(),
          platform: data.platform || 'tool',
          category: data.category || 'SaaS Builders',
          author_name: data.author_name || 'Curated Builder',
          author_handle: '',
          status: 'approved',
          is_featured: false
        });
        showNotification('Metadata extracted! Review details below and publish.');
      } else {
        showNotification(data.error || 'Failed to extract metadata', 'error');
      }
    } catch (err) {
      showNotification('Network error scraping URL', 'error');
    } finally {
      setScraping(false);
    }
  };

  // 2. Publish Staged Goody
  const handlePublishStaged = async () => {
    if (!stagedGoody || !stagedGoody.title || !stagedGoody.resource_url) return;

    setSavingGoody(true);
    try {
      const res = await fetch('/api/goodies', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(stagedGoody)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('Resource published live to Builder Goodies vault!');
        setStagedGoody(null);
        setScrapeUrl('');
        loadGoodies();
      } else {
        // Optimistic addition if local fallback
        setGoodies(prev => [
          { ...stagedGoody, id: `local-${Date.now()}` },
          ...prev
        ]);
        showNotification('Goody staged locally (Supabase table offline or syncing)');
        setStagedGoody(null);
        setScrapeUrl('');
      }
    } catch (err) {
      showNotification('Error saving goody: ' + err.message, 'error');
    } finally {
      setSavingGoody(false);
    }
  };

  // 3. Approve Pending Community Goody
  const handleApprove = async (id) => {
    try {
      const res = await fetch('/api/goodies', {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ id, status: 'approved' })
      });

      if (res.ok) {
        setGoodies(prev => prev.map(g => g.id === id ? { ...g, status: 'approved' } : g));
        showNotification('Goody approved and published live!');
      } else {
        // Optimistic update
        setGoodies(prev => prev.map(g => g.id === id ? { ...g, status: 'approved' } : g));
        showNotification('Goody marked as approved!');
      }
    } catch (err) {
      showNotification('Error approving: ' + err.message, 'error');
    }
  };

  // 4. Toggle Goody Live on Digest (Strict Max 6 Allowed)
  const handleToggleLive = async (goody) => {
    const isCurrentlyLive = digestGoodies.some(g => g.id === goody.id);

    if (isCurrentlyLive) {
      // 1. Deactivate / Shut it off
      const remainingLive = digestGoodies.filter(g => g.id !== goody.id);
      const newOrder = remainingLive.map(g => g.id);

      setGoodies(prev => prev.map(g => g.id === goody.id ? { ...g, is_featured: false } : g));
      showNotification(`${goody.title} shut off. Slot freed (${remainingLive.length}/6 active).`);

      try {
        localStorage.setItem('builder_goodies_live_order', JSON.stringify(newOrder));
      } catch (e) {}

      try {
        await fetch('/api/goodies', {
          method: 'PATCH',
          headers: await getAuthHeaders(),
          body: JSON.stringify({
            id: goody.id,
            is_featured: false,
            live_order: newOrder
          })
        });
      } catch (err) {
        console.error('Failed to sync shut off status:', err);
      }
    } else {
      // 2. Activate / Go Live (Strictly max 6 allowed)
      if (digestGoodies.length >= 6) {
        showNotification('Maximum 6 goodies can be Live on the digest at once. Please shut off another goody first.', 'error');
        return;
      }

      const updatedLive = [...digestGoodies, { ...goody, is_featured: true }];
      const newOrder = updatedLive.map(g => g.id);

      setGoodies(prev => prev.map(g => g.id === goody.id ? { ...g, is_featured: true } : g));
      showNotification(`🚀 ${goody.title} is now Live on Digest (Slot #${updatedLive.length})!`);

      try {
        localStorage.setItem('builder_goodies_live_order', JSON.stringify(newOrder));
      } catch (e) {}

      try {
        await fetch('/api/goodies', {
          method: 'PATCH',
          headers: await getAuthHeaders(),
          body: JSON.stringify({
            id: goody.id,
            is_featured: true,
            live_order: newOrder
          })
        });
      } catch (err) {
        console.error('Failed to sync go live status:', err);
      }
    }
  };

  // 5. Drag & Drop and Sequence Controls (Slot #1 to #6)
  const draggedItemRef = useRef(null);
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDragStart = (e, index) => {
    draggedItemRef.current = index;
    setDraggedItemIdx(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      try {
        e.dataTransfer.setData('text/plain', String(index));
      } catch (err) {}
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDragLeave = (e, index) => {
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverIdx === index) setDragOverIdx(null);
    }
  };

  const handleDragEnd = () => {
    draggedItemRef.current = null;
    setDraggedItemIdx(null);
    setDragOverIdx(null);
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    let sourceIdx = draggedItemRef.current;
    if (sourceIdx === null && draggedItemIdx !== null) {
      sourceIdx = draggedItemIdx;
    }
    if (sourceIdx === null && e.dataTransfer) {
      try {
        const data = e.dataTransfer.getData('text/plain');
        if (data !== '') {
          const parsed = parseInt(data, 10);
          if (!isNaN(parsed)) sourceIdx = parsed;
        }
      } catch (err) {}
    }

    draggedItemRef.current = null;
    setDraggedItemIdx(null);
    setDragOverIdx(null);

    if (sourceIdx === null || sourceIdx === targetIdx) {
      return;
    }
    handleReorderLive(sourceIdx, targetIdx);
  };

  const handleMoveLive = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= digestGoodies.length) return;
    handleReorderLive(index, targetIdx);
  };

  const handleReorderLive = async (draggedIdx, targetIdx) => {
    if (draggedIdx === targetIdx || draggedIdx < 0 || targetIdx < 0) return;
    const reordered = [...digestGoodies];
    if (draggedIdx >= reordered.length || targetIdx >= reordered.length) return;

    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    const liveIds = reordered.map(g => g.id);
    const nonLive = goodies.filter(g => !liveIds.includes(g.id));
    const nextGoodies = [
      ...reordered.map((g, idx) => ({ ...g, is_featured: true, order_index: idx })),
      ...nonLive.map((g, idx) => ({ ...g, is_featured: false, order_index: 100 + idx }))
    ];

    // 1. Immediately update state
    setGoodies(nextGoodies);
    showNotification('Digest sequence updated!');

    // 2. Cache locally immediately so reload/re-render NEVER reverts
    try {
      localStorage.setItem('builder_goodies_live_order', JSON.stringify(liveIds));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('builder_goodies_order_change', { detail: liveIds }));
      }
    } catch (e) {}

    // 3. Persist to API
    try {
      await fetch('/api/goodies', {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ live_order: liveIds })
      });
    } catch (err) {
      console.error('Failed to sync live reorder:', err);
    }
  };

  // 6. Delete Goody
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this resource from the vault?')) return;

    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/goodies?id=${id}`, { method: 'DELETE', headers });
      setGoodies(prev => prev.filter(g => g.id !== id));
      showNotification('Resource removed from vault');
    } catch (err) {
      setGoodies(prev => prev.filter(g => g.id !== id));
      showNotification('Resource removed');
    }
  };

  // 7. Edit / Create Goody & Custom Cover Image (URL Only)
  const [editingGoody, setEditingGoody] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const handleOpenCreateNew = () => {
    setEditingGoody({
      id: null,
      isNew: true,
      title: '',
      description: '',
      category: 'SaaS Builders',
      platform: 'tool',
      author_name: 'Curator',
      author_handle: '',
      resource_url: '',
      thumbnail_url: '',
      custom_image_url: '',
      og_image_url: '',
      status: 'approved',
      is_featured: false
    });
  };

  const handleOpenEdit = (goody) => {
    const rawCustom = goody.custom_image_url || '';
    const rawOg = goody.og_image_url || goody.thumbnail_url || goody.image || '';
    setEditingGoody({
      id: goody.id,
      isNew: false,
      title: goody.title || '',
      description: goody.description || '',
      category: goody.category || 'SaaS Builders',
      platform: goody.platform || 'tool',
      author_name: goody.author_name || 'Curator',
      author_handle: goody.author_handle || '',
      resource_url: goody.resource_url || goody.url || '',
      thumbnail_url: goody.thumbnail_url || goody.image || '',
      custom_image_url: rawCustom,
      og_image_url: rawOg,
      status: goody.status || 'approved',
      is_featured: !!goody.is_featured
    });
  };

  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    if (!editingGoody) return;
    if (!editingGoody.title.trim()) {
      showNotification('Title cannot be empty', 'error');
      return;
    }
    if (editingGoody.isNew && !editingGoody.resource_url.trim()) {
      showNotification('Resource destination URL is required', 'error');
      return;
    }

    const customUrl = editingGoody.custom_image_url ? editingGoody.custom_image_url.trim() : '';
    let ogUrl = editingGoody.og_image_url ? editingGoody.og_image_url.trim() : (editingGoody.thumbnail_url || '');
    if (!ogUrl && editingGoody.resource_url) {
      const ghMatch = editingGoody.resource_url.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
      if (ghMatch && !['features', 'topics', 'trending'].includes(ghMatch[1])) {
        ogUrl = `https://opengraph.githubassets.com/1/${ghMatch[1]}/${ghMatch[2].replace(/\.git$/i, '')}`;
      } else if (editingGoody.resource_url.startsWith('http')) {
        ogUrl = `/api/og-image?url=${encodeURIComponent(editingGoody.resource_url)}`;
      }
    }
    const dominatingThumb = customUrl ? customUrl : (ogUrl || '');

    setSavingEdit(true);

    // Case 1: Manual Creation (POST)
    if (editingGoody.isNew) {
      try {
        const res = await fetch('/api/goodies', {
          method: 'POST',
          headers: await getAuthHeaders(),
          body: JSON.stringify({
            title: editingGoody.title.trim(),
            resource_url: editingGoody.resource_url.trim(),
            description: editingGoody.description ? editingGoody.description.trim() : '',
            category: editingGoody.category || 'SaaS Builders',
            platform: editingGoody.platform || 'tool',
            author_name: editingGoody.author_name ? editingGoody.author_name.trim() : 'Curator',
            author_handle: editingGoody.author_handle ? editingGoody.author_handle.trim() : '',
            thumbnail_url: dominatingThumb,
            custom_image_url: customUrl,
            og_image_url: ogUrl,
            status: 'approved',
            is_featured: false
          })
        });

        const data = await res.json();
        const createdGoody = {
          id: (data && data.goody && data.goody.id) ? data.goody.id : `goody-manual-${Date.now()}`,
          title: editingGoody.title.trim(),
          resource_url: editingGoody.resource_url.trim(),
          description: editingGoody.description ? editingGoody.description.trim() : '',
          category: editingGoody.category || 'SaaS Builders',
          platform: editingGoody.platform || 'tool',
          author_name: editingGoody.author_name ? editingGoody.author_name.trim() : 'Curator',
          author_handle: editingGoody.author_handle ? editingGoody.author_handle.trim() : '',
          thumbnail_url: dominatingThumb,
          image: dominatingThumb,
          custom_image_url: customUrl,
          og_image_url: ogUrl,
          status: 'approved',
          is_featured: false,
          click_count: 0
        };

        setGoodies(prev => [createdGoody, ...prev]);
        showNotification('New goody created and saved to vault successfully!');
        setEditingGoody(null);
      } catch (err) {
        const fallbackGoody = {
          id: `goody-manual-${Date.now()}`,
          title: editingGoody.title.trim(),
          resource_url: editingGoody.resource_url.trim(),
          description: editingGoody.description ? editingGoody.description.trim() : '',
          category: editingGoody.category || 'SaaS Builders',
          platform: editingGoody.platform || 'tool',
          author_name: editingGoody.author_name ? editingGoody.author_name.trim() : 'Curator',
          author_handle: editingGoody.author_handle ? editingGoody.author_handle.trim() : '',
          thumbnail_url: dominatingThumb,
          image: dominatingThumb,
          custom_image_url: customUrl,
          og_image_url: ogUrl,
          status: 'approved',
          is_featured: false,
          click_count: 0
        };
        setGoodies(prev => [fallbackGoody, ...prev]);
        showNotification('New goody created locally and added to vault');
        setEditingGoody(null);
      } finally {
        setSavingEdit(false);
      }
      return;
    }

    // Case 2: Update Existing (PATCH)
    try {
      const res = await fetch('/api/goodies', {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          id: editingGoody.id,
          title: editingGoody.title.trim(),
          description: editingGoody.description ? editingGoody.description.trim() : '',
          category: editingGoody.category,
          platform: editingGoody.platform,
          author_name: editingGoody.author_name ? editingGoody.author_name.trim() : 'Curator',
          author_handle: editingGoody.author_handle ? editingGoody.author_handle.trim() : '',
          resource_url: editingGoody.resource_url ? editingGoody.resource_url.trim() : '',
          thumbnail_url: dominatingThumb,
          custom_image_url: customUrl,
          og_image_url: ogUrl
        })
      });

      const updatedRecord = {
        ...editingGoody,
        title: editingGoody.title.trim(),
        description: editingGoody.description ? editingGoody.description.trim() : '',
        thumbnail_url: dominatingThumb,
        image: dominatingThumb,
        custom_image_url: customUrl,
        og_image_url: ogUrl
      };

      setGoodies(prev => prev.map(g => g.id === editingGoody.id ? { ...g, ...updatedRecord } : g));
      showNotification('Resource updated successfully!');
      setEditingGoody(null);
    } catch (err) {
      setGoodies(prev => prev.map(g => g.id === editingGoody.id ? { ...g, ...editingGoody } : g));
      showNotification('Resource updated locally', 'success');
      setEditingGoody(null);
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('edit') === 'first' && goodies.length > 0) {
      handleOpenEdit(goodies[0]);
    }
  }, [goodies]);

  const pendingGoodies = goodies.filter(g => g.status === 'pending');
  const approvedGoodies = goodies.filter(g => g.status !== 'pending');
  const digestGoodies = approvedGoodies.filter(g => g.is_featured).slice(0, 6);
  const vaultGoodies = approvedGoodies.filter(g => !digestGoodies.some(d => d.id === g.id));

  const filteredVault = activeFilter === 'All'
    ? vaultGoodies
    : vaultGoodies.filter(g => g.category?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div style={styles.grid}>
      {/* Toast Notification */}
      {message.text && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === 'error' ? 'var(--statusDangerBg)' : 'var(--statusSuccessBg)',
          borderColor: message.type === 'error' ? 'var(--statusDangerBorder)' : 'var(--statusSuccessBorder)',
          color: message.type === 'error' ? 'var(--statusDanger)' : 'var(--statusSuccess)',
          marginBottom: '20px'
        }}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Fast URL Scraper & 1-Click Vault Ingestion */}
      <Section 
        title="⚡ Auto-Scrape & Add New Goody" 
        subtitle="Paste any link (Google Sheet, Notion page, Figma template, X post, GitHub repo) to auto-extract metadata in 2 seconds, or create a goody manually."
      >
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={handleScrape} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1, minWidth: '280px' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <LinkIcon size={16} style={{ position: 'absolute', left: '14px', color: 'var(--textMuted)' }} />
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/spreadsheets/d/... or https://notion.so/..."
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  style={{
                    ...styles.input,
                    paddingLeft: '40px',
                    height: '44px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={scraping || !scrapeUrl.trim()}
                style={{
                  ...styles.btnPrimary,
                  height: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0 20px',
                  opacity: (scraping || !scrapeUrl.trim()) ? 0.6 : 1,
                  cursor: (scraping || !scrapeUrl.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {scraping ? <RefreshCw className="spin" size={16} /> : <Sparkles size={16} />}
                <span>{scraping ? 'Extracting...' : 'Auto-Extract'}</span>
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--textMuted)', fontWeight: '600' }}>or</span>
              <button
                type="button"
                onClick={handleOpenCreateNew}
                style={{
                  ...styles.btnSecondary,
                  height: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '0 16px',
                  fontWeight: '700',
                  fontSize: '13px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Plus size={16} />
                <span>Create Manually</span>
              </button>
            </div>
          </div>

          {/* Staged Goody Review Card */}
          {stagedGoody && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(16, 185, 129, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} />
                  STAGED CANDIDATE
                </span>
                <button
                  type="button"
                  onClick={() => setStagedGoody(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--textMuted)', cursor: 'pointer', fontSize: '12px' }}
                >
                  Discard Draft
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.inputLabel}>RESOURCE TITLE</label>
                  <input
                    style={styles.input}
                    value={stagedGoody.title}
                    onChange={(e) => setStagedGoody({ ...stagedGoody, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={styles.inputLabel}>RESOURCE URL</label>
                  <input
                    style={styles.input}
                    value={stagedGoody.resource_url}
                    onChange={(e) => setStagedGoody({ ...stagedGoody, resource_url: e.target.value })}
                  />
                </div>

                <div>
                  <label style={styles.inputLabel}>AUDIENCE CATEGORY</label>
                  <select
                    style={styles.select}
                    value={stagedGoody.category}
                    onChange={(e) => setStagedGoody({ ...stagedGoody, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.inputLabel}>PLATFORM FORMAT</label>
                  <select
                    style={styles.select}
                    value={stagedGoody.platform}
                    onChange={(e) => setStagedGoody({ ...stagedGoody, platform: e.target.value })}
                  >
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.inputLabel}>CREATOR / AUTHOR</label>
                  <input
                    style={styles.input}
                    value={stagedGoody.author_name}
                    onChange={(e) => setStagedGoody({ ...stagedGoody, author_name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={styles.inputLabel}>X HANDLE (OPTIONAL)</label>
                  <input
                    style={styles.input}
                    placeholder="@handle"
                    value={stagedGoody.author_handle || ''}
                    onChange={(e) => setStagedGoody({ ...stagedGoody, author_handle: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.inputLabel}>DESCRIPTION / CONTEXT</label>
                <textarea
                  rows={2}
                  style={styles.textarea}
                  value={stagedGoody.description}
                  onChange={(e) => setStagedGoody({ ...stagedGoody, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handlePublishStaged}
                  disabled={savingGoody}
                  style={{
                    ...styles.btnPrimary,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px'
                  }}
                >
                  <Check size={16} />
                  <span>{savingGoody ? 'Publishing...' : 'Publish to Vault Live'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* 2. Inbound Community Review Queue */}
      <Section 
        title={`📬 Community Inbound Queue (${pendingGoodies.length})`}
        subtitle="Submissions sent from the user-facing 'Reach us' modal. Approve to make them live on the digest or discard spam."
      >
        <div style={styles.card}>
          {pendingGoodies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--textMuted)', fontSize: '13px' }}>
              <span>✨ Inbound inbox is clear! No pending submissions awaiting review.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingGoodies.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bgApp)',
                    border: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(249, 115, 22, 0.12)',
                        color: '#f97316'
                      }}>
                        {item.category}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6'
                      }}>
                        {item.platform}
                      </span>
                    </div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--textMain)' }}>
                      {item.title}
                    </h4>
                    {item.description && (
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--textMuted)' }}>
                        {item.description}
                      </p>
                    )}
                    <div style={{ fontSize: '11px', color: 'var(--textMuted)', marginTop: '6px' }}>
                      Submitted by: <strong>{item.author_name}</strong> {item.author_handle ? `(${item.author_handle})` : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <a
                      href={item.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...styles.btnSecondary,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={12} />
                      <span>Inspect</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      style={{
                        ...styles.btnSecondary,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        fontSize: '12px'
                      }}
                      title="Edit title & description before publishing"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>


                    <button
                      onClick={() => handleApprove(item.id)}
                      style={{
                        ...styles.btnPrimary,
                        backgroundColor: '#10b981',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        fontSize: '12px'
                      }}
                    >
                      <Check size={13} />
                      <span>Approve & Publish</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        ...styles.deleteBtn,
                        padding: '6px 10px',
                        fontSize: '12px'
                      }}
                      title="Discard submission"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* 3. Live on Digest — Drag-and-Drop Slot Sequence (Strict Max 6) */}
      <Section 
        title={`🚀 Live on Digest — Slot Sequence (${digestGoodies.length}/6 Active)`}
        subtitle="Arranged exactly as they appear on the homepage daily digest. Drag cards with the grip handle or use up/down arrows to rearrange slots #1 through #6. Exactly 6 goodies can be live at a time."
      >
        <div style={styles.card}>
          {digestGoodies.length === 0 ? (
            <div style={{
              padding: '36px 20px',
              textAlign: 'center',
              borderRadius: '12px',
              border: '2px dashed var(--borderDark)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--textMuted)', fontWeight: '600' }}>
                No goodies are currently active on the live digest.
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--textMuted)' }}>
                Browse the Goodies Vault Catalog below and click <strong>&quot;Go Live&quot;</strong> on up to 6 resources.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {digestGoodies.map((g, idx) => {
                const dominatingImg = (g.custom_image_url && g.custom_image_url.trim()) ? g.custom_image_url.trim() : (g.og_image_url || g.thumbnail_url || g.image || '');
                const isCustomImg = !!(g.custom_image_url && g.custom_image_url.trim());

                return (
                  <div
                    key={g.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: dragOverIdx === idx ? 'rgba(16, 185, 129, 0.08)' : 'var(--bgApp)',
                      border: dragOverIdx === idx ? '2px dashed #10b981' : '1px solid var(--border)',
                      gap: '14px',
                      flexWrap: 'wrap',
                      opacity: draggedItemIdx === idx ? 0.35 : 1,
                      transform: dragOverIdx === idx ? 'scale(1.01)' : 'none',
                      transition: 'opacity 0.2s ease, transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
                      position: 'relative'
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={(e) => handleDragLeave(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, idx)}
                  >
                    {/* Reorder Grip & Slot Number */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <div 
                        style={{ ...styles.dragHandle, padding: '4px', borderRadius: '4px', cursor: 'grab' }} 
                        title="Drag to rearrange sequence"
                      >
                        <GripVertical size={16} color="var(--textMuted)" />
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.04em'
                      }}>
                        #{idx + 1}
                      </span>

                      {/* Arrow Buttons */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); handleMoveLive(idx, 'up'); }}
                          style={{
                            ...styles.reorderArrowBtn,
                            opacity: idx === 0 ? 0.25 : 1,
                            cursor: idx === 0 ? 'not-allowed' : 'pointer'
                          }}
                          title="Move up in sequence"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === digestGoodies.length - 1}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); handleMoveLive(idx, 'down'); }}
                          style={{
                            ...styles.reorderArrowBtn,
                            opacity: idx === digestGoodies.length - 1 ? 0.25 : 1,
                            cursor: idx === digestGoodies.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                          title="Move down in sequence"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail Preview */}
                    <div style={{
                      width: '64px',
                      height: '42px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--borderDark)',
                      flexShrink: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {dominatingImg ? (
                        <img
                          src={dominatingImg}
                          alt={g.title}
                          draggable={false}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Eye size={14} color="var(--textMuted)" />
                      )}
                    </div>

                    {/* Metadata & Title */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '1px 7px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981'
                        }}>
                          {g.platform?.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--textMuted)', fontWeight: '600' }}>
                          {g.category}
                        </span>
                        {isCustomImg ? (
                          <span style={{
                            fontSize: '9px',
                            fontWeight: '700',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            letterSpacing: '0.04em'
                          }}>
                            CUSTOM COVER
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '9px',
                            fontWeight: '600',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--textMuted)',
                            letterSpacing: '0.04em'
                          }}>
                            OG FALLBACK
                          </span>
                        )}
                      </div>

                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--textMain)' }}>
                        {g.title}
                      </h4>
                      {g.description && (
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--textMuted)', lineHeight: '1.4' }}>
                          {g.description}
                        </p>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => handleOpenEdit(g)}
                        style={{
                          ...styles.btnSecondary,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="Edit title, description, or custom cover image URL"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <a
                        href={g.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                          ...styles.btnSecondary,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          textDecoration: 'none'
                        }}
                      >
                        <span>Visit</span>
                        <ExternalLink size={12} />
                      </a>

                      {/* Shut It Button */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => handleToggleLive(g)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title="Deactivate and remove from digest"
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                        <span>Shut it</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Section>

      {/* 4. Goodies Vault Catalog (Inactive / Stored Resources) */}
      <Section 
        title={`📦 Goodies Vault Catalog (${vaultGoodies.length} Available)`}
        subtitle="Approved builder resources in reserve. Click 'Go Live' to place any resource into an open digest slot (strictly max 6 live at once)."
      >
        <div style={styles.card}>
          {/* Filter Pills & Manual Creation Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', ...CATEGORIES].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: activeFilter === f ? 'var(--textMain)' : 'var(--border)',
                    backgroundColor: activeFilter === f ? 'var(--textMain)' : 'var(--bgApp)',
                    color: activeFilter === f ? 'var(--bgApp)' : 'var(--textMuted)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleOpenCreateNew}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={14} />
              <span>+ Create Goody Manually</span>
            </button>
          </div>

          {/* Vault Goodies List */}
          {filteredVault.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--textMuted)', fontSize: '13px' }}>
              No goodies found in the vault matching &quot;{activeFilter}&quot;.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredVault.map((g) => {
                const dominatingImg = (g.custom_image_url && g.custom_image_url.trim()) ? g.custom_image_url.trim() : (g.og_image_url || g.thumbnail_url || g.image || '');

                return (
                  <div
                    key={g.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bgApp)',
                      border: '1px solid var(--border)',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
                      <div style={{
                        width: '54px',
                        height: '36px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--borderDark)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {dominatingImg ? (
                          <img
                            src={dominatingImg}
                            alt={g.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <Eye size={12} color="var(--textMuted)" />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '1px 7px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6'
                          }}>
                            {g.platform?.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--textMuted)', fontWeight: '600' }}>
                            {g.category}
                          </span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--textMain)' }}>
                          {g.title}
                        </h4>
                        {g.description && (
                          <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--textMuted)', lineHeight: '1.4' }}>
                            {g.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(g)}
                        style={{
                          ...styles.btnSecondary,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="Edit title & description"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <a
                        href={g.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...styles.btnSecondary,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          textDecoration: 'none'
                        }}
                      >
                        <span>Visit</span>
                        <ExternalLink size={12} />
                      </a>

                      {/* Go Live Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleLive(g)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          backgroundColor: digestGoodies.length >= 6 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(16, 185, 129, 0.15)',
                          border: digestGoodies.length >= 6 ? '1px solid var(--borderDark)' : '1px solid rgba(16, 185, 129, 0.4)',
                          color: digestGoodies.length >= 6 ? 'var(--textMuted)' : '#10b981',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: digestGoodies.length >= 6 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title={digestGoodies.length >= 6 ? "Digest is full (6/6 slots active). Shut off an active goody first." : "Make live on digest"}
                      >
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: digestGoodies.length >= 6 ? 'var(--textMuted)' : '#10b981'
                        }} />
                        <span>Go Live</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(g.id)}
                        style={{
                          ...styles.deleteBtn,
                          padding: '6px 10px',
                          fontSize: '12px'
                        }}
                        title="Delete goody from vault"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Section>

      {/* 4. Edit Goody Modal */}
      <BaseModal
        isOpen={!!editingGoody}
        onClose={() => setEditingGoody(null)}
        maxWidth="680px"
      >
        {editingGoody && (
          <div>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '18px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--borderDark)'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GoodiesIcon size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--textMain)' }}>
                      {editingGoody.isNew ? 'Create New Goody' : 'Edit Goody'}
                    </h3>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: editingGoody.isNew ? 'rgba(59, 130, 246, 0.12)' : (editingGoody.status === 'approved' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(249, 115, 22, 0.12)'),
                      color: editingGoody.isNew ? '#3b82f6' : (editingGoody.status === 'approved' ? '#10b981' : '#f97316')
                    }}>
                      {editingGoody.isNew ? 'NEW RESOURCE' : (editingGoody.status?.toUpperCase() || 'APPROVED')}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: editingGoody.is_featured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: editingGoody.is_featured ? '#10b981' : 'var(--textMuted)',
                      border: editingGoody.is_featured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--borderDark)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: editingGoody.is_featured ? '#10b981' : 'var(--textMuted)' }} />
                      {editingGoody.isNew ? 'VAULT STORAGE' : (editingGoody.is_featured ? 'LIVE ON DIGEST' : 'IN VAULT')}
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--textMuted)' }}>
                    {editingGoody.isNew 
                      ? 'Manually curate and save a new builder resource directly to the vault.'
                      : 'Fine-tune title, description, cover image, and metadata. Changes sync immediately.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingGoody(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--textMuted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Feed Card Mini-Preview */}
            {(() => {
              const customUrl = editingGoody.custom_image_url ? editingGoody.custom_image_url.trim() : '';
              let ogUrl = editingGoody.og_image_url ? editingGoody.og_image_url.trim() : (editingGoody.thumbnail_url || '');
              if (!ogUrl && editingGoody.resource_url) {
                const ghMatch = editingGoody.resource_url.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
                if (ghMatch && !['features', 'topics', 'trending'].includes(ghMatch[1])) {
                  ogUrl = `https://opengraph.githubassets.com/1/${ghMatch[1]}/${ghMatch[2].replace(/\.git$/i, '')}`;
                } else if (editingGoody.resource_url.startsWith('http')) {
                  ogUrl = `/api/og-image?url=${encodeURIComponent(editingGoody.resource_url)}`;
                }
              }
              const dominatingImg = customUrl || ogUrl;
              const isCustomDominating = !!customUrl;

              return (
                <div style={{
                  backgroundColor: 'var(--bgApp)',
                  border: '1px solid var(--borderDark)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center'
                }}>
                  {/* Cover thumbnail */}
                  <div style={{
                    width: '96px',
                    height: '56px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--borderDark)',
                    flexShrink: 0,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {dominatingImg ? (
                      <img
                        key={dominatingImg}
                        src={dominatingImg}
                        alt={editingGoody.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <Eye size={16} color="var(--textMuted)" />
                    )}
                  </div>

                  {/* Text Info Preview */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '9px', fontWeight: '800', color: '#10b981', letterSpacing: '0.04em' }}>
                        {editingGoody.platform?.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--textMuted)', fontWeight: '600' }}>
                        • {editingGoody.category}
                      </span>
                      {isCustomDominating ? (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '800',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          DOMINATING: CUSTOM URL
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '800',
                          backgroundColor: 'rgba(59, 130, 246, 0.12)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#60a5fa' }} />
                          FALLBACK: OG EXTRACTED
                        </span>
                      )}
                    </div>
                    <h4 style={{
                      margin: 0,
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--textMain)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {editingGoody.title || 'Untitled Resource'}
                    </h4>
                    <p style={{
                      margin: '2px 0 0',
                      fontSize: '11px',
                      color: 'var(--textMuted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {editingGoody.description || 'No description entered yet...'}
                    </p>
                  </div>

                  <div style={{
                    fontSize: '10px',
                    color: 'var(--textMuted)',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Eye size={11} />
                    <span>Live Feed Preview</span>
                  </div>
                </div>
              );
            })()}

            <form onSubmit={handleSaveEdit}>
              {/* Category Segmented Selector */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--textMuted)',
                  letterSpacing: '0.06em',
                  marginBottom: '6px'
                }}>
                  AUDIENCE CATEGORY
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px'
                }}>
                  {CATEGORIES.map(c => {
                    const active = editingGoody.category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditingGoody({ ...editingGoody, category: c })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: active ? '1px solid #10b981' : '1px solid var(--borderDark)',
                          backgroundColor: active ? 'rgba(16, 185, 129, 0.12)' : 'var(--bgApp)',
                          color: active ? '#10b981' : 'var(--textMuted)',
                          fontSize: '12px',
                          fontWeight: active ? '700' : '500',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Platform Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: 'var(--textMuted)',
                      letterSpacing: '0.06em'
                    }}>
                      RESOURCE TITLE *
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--textMuted)' }}>
                      1–3 words (Featured Gem style)
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bgApp)',
                      border: '1px solid var(--borderDark)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: 'var(--textMain)',
                      fontSize: '13px',
                      fontWeight: '700',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    value={editingGoody.title}
                    onChange={(e) => setEditingGoody({ ...editingGoody, title: e.target.value })}
                    placeholder="e.g. shadcn/ui"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--textMuted)',
                    letterSpacing: '0.06em',
                    marginBottom: '6px'
                  }}>
                    PLATFORM FORMAT
                  </label>
                  <select
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bgApp)',
                      border: '1px solid var(--borderDark)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: 'var(--textMain)',
                      fontSize: '13px',
                      fontWeight: '600',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    value={editingGoody.platform}
                    onChange={(e) => setEditingGoody({ ...editingGoody, platform: e.target.value })}
                  >
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--textMuted)',
                    letterSpacing: '0.06em'
                  }}>
                    DESCRIPTION / PUNCHY TAGLINE
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--textMuted)' }}>
                    Single sentence, max ~50 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--bgApp)',
                    border: '1px solid var(--borderDark)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: 'var(--textMain)',
                    fontSize: '13px',
                    lineHeight: '1.45',
                    outline: 'none',
                    minHeight: '64px',
                    resize: 'vertical'
                  }}
                  value={editingGoody.description}
                  onChange={(e) => setEditingGoody({ ...editingGoody, description: e.target.value })}
                  placeholder="Accessible, copy-paste React & Tailwind components."
                />
              </div>

              {/* Creator & Social Handle */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--textMuted)',
                    letterSpacing: '0.06em',
                    marginBottom: '6px'
                  }}>
                    CREATOR / AUTHOR
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bgApp)',
                      border: '1px solid var(--borderDark)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: 'var(--textMain)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                    value={editingGoody.author_name}
                    onChange={(e) => setEditingGoody({ ...editingGoody, author_name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--textMuted)',
                    letterSpacing: '0.06em',
                    marginBottom: '6px'
                  }}>
                    X / SOCIAL HANDLE
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bgApp)',
                      border: '1px solid var(--borderDark)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: 'var(--textMain)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                    placeholder="@handle"
                    value={editingGoody.author_handle}
                    onChange={(e) => setEditingGoody({ ...editingGoody, author_handle: e.target.value })}
                  />
                </div>
              </div>

              {/* Resource Destination URL */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--textMuted)',
                    letterSpacing: '0.06em'
                  }}>
                    RESOURCE DESTINATION URL *
                  </label>
                  {editingGoody.resource_url && (
                    <a
                      href={editingGoody.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <span>Test link</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--bgApp)',
                    border: '1px solid var(--borderDark)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: 'var(--textMain)',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                  value={editingGoody.resource_url}
                  onChange={(e) => setEditingGoody({ ...editingGoody, resource_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Cover Image: URL only with OG fallback */}
              {(() => {
                const hasCustomUrl = !!(editingGoody.custom_image_url && editingGoody.custom_image_url.trim());
                const fallbackOg = editingGoody.og_image_url || editingGoody.thumbnail_url || '';

                return (
                  <div style={{
                    marginBottom: '22px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--borderDark)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <label style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: 'var(--textMain)',
                        letterSpacing: '0.06em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <ImageIcon size={14} color="var(--primary)" />
                        <span>COVER IMAGE (URL ONLY)</span>
                      </label>
                      <span style={{ fontSize: '11px', color: 'var(--textMuted)' }}>
                        Custom URL dominates • OG is automatic fallback
                      </span>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input
                        type="url"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          backgroundColor: 'var(--bgApp)',
                          border: hasCustomUrl ? '1px solid #10b981' : '1px solid var(--borderDark)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          color: 'var(--textMain)',
                          fontSize: '12px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        value={editingGoody.custom_image_url || ''}
                        onChange={(e) => setEditingGoody({ ...editingGoody, custom_image_url: e.target.value })}
                        placeholder="Paste image URL (e.g. https://... - leave empty to use OG fallback)"
                      />
                    </div>

                    {/* Status indicator row */}
                    <div style={{
                      marginTop: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {hasCustomUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>
                            Custom URL is active and dominating the feed card
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60a5fa' }} />
                          <span style={{ fontSize: '11px', color: 'var(--textMuted)' }}>
                            No custom URL entered — using OG extracted image as fallback
                          </span>
                        </div>
                      )}

                      {hasCustomUrl && (
                        <button
                          type="button"
                          onClick={() => setEditingGoody({ ...editingGoody, custom_image_url: '' })}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--textMuted)',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0
                          }}
                        >
                          Clear & Reset to OG Fallback
                        </button>
                      )}
                    </div>

                    {/* OG Fallback URL info box */}
                    {fallbackOg && (
                      <div style={{
                        marginTop: '10px',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px dashed var(--borderDark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--textMuted)', textTransform: 'uppercase' }}>OG Fallback:</span>
                          <span style={{ fontSize: '11px', color: 'var(--textMuted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {fallbackOg}
                          </span>
                        </div>
                        <a
                          href={fallbackOg}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '10px', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}
                        >
                          <span>View OG</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Footer Actions */}
              <div style={{
                display: 'flex',
                justifyContent: editingGoody.isNew ? 'flex-end' : 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--borderDark)'
              }}>
                {!editingGoody.isNew && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editingGoody.id);
                      setEditingGoody(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 8px'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete Resource</span>
                  </button>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingGoody(null)}
                    style={{
                      ...styles.btnSecondary,
                      padding: '8px 18px',
                      fontSize: '13px',
                      borderRadius: '8px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 22px',
                      fontSize: '13px',
                      fontWeight: '700',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: '#000',
                      cursor: savingEdit ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    {savingEdit ? (
                      <RefreshCw className="spin" size={14} />
                    ) : editingGoody.isNew ? (
                      <Plus size={14} />
                    ) : (
                      <Check size={14} />
                    )}
                    <span>
                      {savingEdit 
                        ? (editingGoody.isNew ? 'Creating...' : 'Saving...') 
                        : (editingGoody.isNew ? 'Create & Add to Vault' : 'Save Changes')}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </BaseModal>

    </div>
  );
}
