"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export const ADMIN_EMAIL = 'admin@test.com';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [archives, setArchives] = useState([]);
  const [archivesLoading, setArchivesLoading] = useState(true);

  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(true);
  const [promosVisible, setPromosVisible] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [gems, setGems] = useState([]);
  const [gemsLoading, setGemsLoading] = useState(true);
  const [gemsVisible, setGemsVisible] = useState(true);
  const [spotlightBg, setSpotlightBg] = useState('/spot-2.webp');
  const [spotlightBgHistory, setSpotlightBgHistory] = useState([]);

  const [cardBgs, setCardBgs] = useState({ model: '', tool: '', repo: '', paper: '' });
  const [gemBadges, setGemBadges] = useState({});
  const [heroFonts, setHeroFonts] = useState(['Space Grotesk', 'JetBrains Mono', 'Playfair Display', 'Bebas Neue', 'Caveat', 'Oswald']);
  const [savingFonts, setSavingFonts] = useState(false);
  const [toggleStyle, setToggleStyle] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('builder_daily_toggle_style') || 'classic';
    }
    return 'classic';
  });

  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [allowedWriters, setAllowedWriters] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);

  const [userEvents, setUserEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [customAnalytics, setCustomAnalytics] = useState('');

  const [subscribersCount, setSubscribersCount] = useState(0);

  const [draggedItemIdx, setDraggedItemIdx] = useState(null);

  useEffect(() => {
    if (!authLoading && user?.email === ADMIN_EMAIL) {
      fetchDraft();
      fetchArchives();
      fetchPromos();
      fetchPromosVisibility();
      fetchGems();
      fetchGemsVisibility();
      fetchSpotlightBg();
      fetchSpotlightBgHistory();
      fetchCardBgs();
      fetchGemBadges();
      fetchHeroFonts();
      fetchToggleStyle();
      fetchProfiles();
      fetchAllowedWriters();
      fetchAccessRequests();
      fetchUserEvents();
      fetchCustomAnalytics();
      fetchSubscribersCount();
    }
  }, [user, authLoading]);

  const fetchSubscribersCount = async () => {
    try {
      const { count, error } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        setSubscribersCount(count);
      }
    } catch (e) {
      console.warn('Failed to fetch subscribers count:', e);
    }
  };

  const fetchToggleStyle = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'theme_toggle_style')
      .single();

    if (!error && data) {
      setToggleStyle(data.value);
    }
  };

  const fetchUserEvents = async () => {
    setEventsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .like('key', 'event_%');
      
      if (!error && data) {
        const parsedEvents = data.map(row => {
          try {
            const parsedValue = JSON.parse(row.value);
            return {
              key: row.key,
              ...parsedValue
            };
          } catch(e) {
            return { key: row.key, event_name: 'Unknown', created_at: row.updated_at };
          }
        });
        
        parsedEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setUserEvents(parsedEvents);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchCustomAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'custom_analytics_script')
        .single();
      if (!error && data) {
        setCustomAnalytics(data.value);
      }
    } catch (e) {}
  };

  const handleSaveCustomAnalytics = async () => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'custom_analytics_script',
          value: customAnalytics,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      if (error) {
        alert('Error saving custom analytics script: ' + error.message);
      } else {
        setMessage({ type: 'success', text: 'Custom analytics script saved successfully!' });
      }
    } catch(e) {
      alert('Error: ' + e.message);
    }
  };

  const handleClearEvents = async () => {
    if (!window.confirm('Are you sure you want to clear all user event logs?')) return;
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key')
        .like('key', 'event_%');
      
      if (data && data.length > 0) {
        const keysToDelete = data.map(item => item.key);
        const { error } = await supabase
          .from('site_settings')
          .delete()
          .in('key', keysToDelete);
        
        if (error) {
          alert('Error clearing logs: ' + error.message);
        } else {
          setMessage({ type: 'success', text: 'All event logs cleared successfully!' });
          setUserEvents([]);
        }
      } else {
        alert('No event logs to clear.');
      }
    } catch(e) {
      alert('Error: ' + e.message);
    }
  };

  const fetchAllowedWriters = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'allowed_blog_writers')
        .single();
      if (!error && data) {
        setAllowedWriters(JSON.parse(data.value || '[]'));
      }
    } catch (e) {
      console.error("Error fetching allowed writers:", e);
    }
  };

  const fetchAccessRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'blog_access_requests')
        .single();
      if (!error && data) {
        setAccessRequests(JSON.parse(data.value || '[]'));
      }
    } catch (e) {
      console.error("Error fetching access requests:", e);
    }
  };

  const fetchProfiles = async () => {
    setProfilesLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });
      if (!error && data) {
        setProfiles(data);
      }
    } catch (e) {
      console.error("Error fetching profiles:", e);
    } finally {
      setProfilesLoading(false);
    }
  };

  const handleToggleWriterAccess = async (userId) => {
    let updatedWriters;
    const isGranting = !allowedWriters.includes(userId);

    if (isGranting) {
      updatedWriters = [...allowedWriters, userId];
    } else {
      updatedWriters = allowedWriters.filter(id => id !== userId);
    }

    setAllowedWriters(updatedWriters);

    const { error: writersErr } = await supabase
      .from('site_settings')
      .upsert({
        key: 'allowed_blog_writers',
        value: JSON.stringify(updatedWriters),
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (writersErr) {
      setMessage({ type: 'error', text: 'Failed to update writer access: ' + writersErr.message });
      fetchAllowedWriters(); // Revert
      return;
    }

    // If granting access, also remove from pending access requests
    if (isGranting && accessRequests.includes(userId)) {
      const updatedRequests = accessRequests.filter(id => id !== userId);
      setAccessRequests(updatedRequests);

      await supabase
        .from('site_settings')
        .upsert({
          key: 'blog_access_requests',
          value: JSON.stringify(updatedRequests),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    }

    setMessage({ 
      type: 'success', 
      text: isGranting ? 'Access granted and request cleared!' : 'Access revoked!' 
    });
  };

  const handleUpdateToggleStyle = async (newStyle) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('builder_daily_toggle_style', newStyle);
      window.dispatchEvent(new CustomEvent('builder_toggle_style_change', { detail: newStyle }));
    }
    setToggleStyle(newStyle);

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'theme_toggle_style', value: newStyle, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    
    if (error) {
      setMessage({ type: 'error', text: 'Settings update failed: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Toggle style updated successfully!' });
    }
  };

  const fetchGemBadges = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'gem_badges')
      .single();
    if (!error && data) {
      try {
        setGemBadges(JSON.parse(data.value));
      } catch (e) {}
    }
  };

  const handleUpdateGemBadge = async (gemId, badgeIcon) => {
    const newBadges = { ...gemBadges, [gemId]: badgeIcon };
    setGemBadges(newBadges);

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'gem_badges', value: JSON.stringify(newBadges), updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update badge: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Gem badge updated successfully!' });
    }
  };

  const fetchHeroFonts = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero_fonts')
      .single();
    if (!error && data) {
      try {
        setHeroFonts(JSON.parse(data.value));
      } catch (e) {}
    }
  };

  const handleUpdateHeroFont = (index, val) => {
    const updated = [...heroFonts];
    updated[index] = val;
    setHeroFonts(updated);
  };

  const handleAddHeroFont = () => {
    setHeroFonts([...heroFonts, '']);
  };

  const handleRemoveHeroFont = (index) => {
    const updated = [...heroFonts];
    updated.splice(index, 1);
    setHeroFonts(updated);
  };

  const handleSaveHeroFonts = async () => {
    setSavingFonts(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'hero_fonts', value: JSON.stringify(heroFonts), updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save fonts: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Hero fonts updated successfully!' });
    }
    setSavingFonts(false);
  };

  const fetchPromosVisibility = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'promos_visible')
      .single();

    if (!error && data) {
      setPromosVisible(data.value === 'true');
    }
  };

  const handleTogglePromosVisibility = async () => {
    const nextVal = !promosVisible;
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'promos_visible', value: nextVal.toString(), updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (!error) {
      setPromosVisible(nextVal);
      setMessage({ type: 'success', text: `Promo Slider is now ${nextVal ? 'VISIBLE' : 'HIDDEN'} on the dashboard.` });
    } else {
      setMessage({ type: 'error', text: 'Failed to update visibility toggle: ' + error.message });
    }
  };

  const fetchPromos = async () => {
    setPromosLoading(true);
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('order_index', { ascending: true });

    let targetUrlsMap = {};
    try {
      const { data: targetSetting } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'promo_target_urls')
        .single();
      if (targetSetting && targetSetting.value) {
        targetUrlsMap = JSON.parse(targetSetting.value);
      }
    } catch {
      // Ignore if setting does not exist yet
    }

    if (!error && data) {
      const enriched = data.map(p => ({
        ...p,
        target_url: p.target_url || p.link_url || targetUrlsMap[p.id] || ''
      }));
      setPromos(enriched);
    } else if (data) {
      setPromos(data);
    }
    setPromosLoading(false);
  };

  const fetchGems = async () => {
    setGemsLoading(true);
    const { data, error } = await supabase
      .from('featured_gems')
      .select('*')
      .order('order_index', { ascending: true });

    let gemUrlsMap = {};
    try {
      const { data: urlSetting } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'gem_urls')
        .single();
      if (urlSetting && urlSetting.value) {
        gemUrlsMap = JSON.parse(urlSetting.value);
      }
    } catch {
      // Ignore if setting does not exist yet
    }

    if (!error && data) {
      const enriched = data.map(g => ({
        ...g,
        url: g.url || gemUrlsMap[g.id] || ''
      }));
      setGems(enriched);
    } else if (data) {
      setGems(data);
    }
    setGemsLoading(false);
  };

  const fetchGemsVisibility = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'featured_gems_visible')
      .single();

    if (!error && data) {
      setGemsVisible(data.value === 'true');
    }
  };

  const handleToggleGemsVisibility = async () => {
    const nextVal = !gemsVisible;
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'featured_gems_visible', value: nextVal.toString(), updated_at: new Date().toISOString() });

    if (!error) {
      setGemsVisible(nextVal);
      setMessage({ type: 'success', text: `Featured Gems section is now ${nextVal ? 'VISIBLE' : 'HIDDEN'} on the dashboard.` });
    } else {
      setMessage({ type: 'error', text: 'Failed to update visibility toggle: ' + error.message });
    }
  };

  const fetchSpotlightBg = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'spotlight_bg_image')
      .single();

    if (!error && data) {
      setSpotlightBg(data.value);
    }
  };

  const fetchSpotlightBgHistory = async () => {
    const { data, error } = await supabase.storage
      .from('assets')
      .list('settings', {
        limit: 20,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (!error && data) {
      const urls = data
        .filter(file => file.name.startsWith('spotlight_bg_') || file.name.match(/\.(jpg|jpeg|png|webp|gif|mp4|webm)$/i))
        .map(file => {
          const { data: urlData } = supabase.storage
            .from('assets')
            .getPublicUrl(`settings/${file.name}`);
          return urlData.publicUrl;
        });
      setSpotlightBgHistory(urls);
    }
  };

  const handleUploadSpotlightBg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `spotlight_bg_${Math.random()}.${fileExt}`;
    const filePath = `settings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file);

    if (uploadError) {
      setMessage({ type: 'error', text: 'Upload failed: ' + uploadError.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('site_settings')
      .upsert({ key: 'spotlight_bg_image', value: urlData.publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (dbError) {
      setMessage({ type: 'error', text: 'Settings update failed: ' + dbError.message });
    } else {
      setMessage({ type: 'success', text: 'Spotlight background updated successfully!' });
      setSpotlightBg(urlData.publicUrl);
      fetchSpotlightBgHistory();
    }
    setUploading(false);
  };

  const handleUpdateSpotlightBgUrl = async (newUrl) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'spotlight_bg_image', value: newUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    
    if (error) {
      setMessage({ type: 'error', text: 'Settings update failed: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Spotlight background updated successfully!' });
      setSpotlightBg(newUrl);
    }
  };

  const fetchCardBgs = async () => {
    const keys = ['card_bg_model', 'card_bg_tool', 'card_bg_repo', 'card_bg_paper'];
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', keys);

    if (!error && data) {
      const bgs = { ...cardBgs };
      data.forEach(item => {
        const type = item.key.replace('card_bg_', '');
        bgs[type] = item.value;
      });
      setCardBgs(bgs);
    }
  };

  const handleUploadCardBg = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `card_bg_${type}_${Math.random()}.${fileExt}`;
    const filePath = `settings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file);

    if (uploadError) {
      setMessage({ type: 'error', text: 'Upload failed: ' + uploadError.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('site_settings')
      .upsert({ key: `card_bg_${type}`, value: urlData.publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (dbError) {
      setMessage({ type: 'error', text: 'Settings update failed: ' + dbError.message });
    } else {
      setMessage({ type: 'success', text: `Card background (${type}) updated successfully!` });
      setCardBgs(prev => ({ ...prev, [type]: urlData.publicUrl }));
    }
    setUploading(false);
  };

  const handleUpdateCardBgUrl = async (newUrl, type) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: `card_bg_${type}`, value: newUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    
    if (error) {
      setMessage({ type: 'error', text: 'Settings update failed: ' + error.message });
    } else {
      setMessage({ type: 'success', text: `Card background (${type}) updated successfully!` });
      setCardBgs(prev => ({ ...prev, [type]: newUrl }));
    }
  };

  const handleAddGem = async () => {
    const { error } = await supabase
      .from('featured_gems')
      .insert({
        title: 'New Featured Gem',
        description: 'Description here...',
        url: '',
        image_url: '',
        is_active: true,
        order_index: gems.length
      });

    if (!error) {
      fetchGems();
    } else {
      setMessage({ type: 'error', text: 'Failed to add gem: ' + error.message });
    }
  };

  const handleUpdateGemField = async (id, field, value) => {
    const updatedGems = gems.map(gem => gem.id === id ? { ...gem, [field]: value } : gem);
    setGems(updatedGems);

    const { error } = await supabase
      .from('featured_gems')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      setMessage({ type: 'error', text: `Failed to update ${field}: ` + error.message });
    }

    // Two-tier resilience: Also persist redirect URL in site_settings so link never gets lost
    if (field === 'url') {
      try {
        const { data: existingSetting } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'gem_urls')
          .single();
        const existingMap = existingSetting && existingSetting.value ? JSON.parse(existingSetting.value) : {};
        existingMap[id] = value;
        await supabase
          .from('site_settings')
          .upsert({
            key: 'gem_urls',
            value: JSON.stringify(existingMap),
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      } catch (err) {
        console.warn('Fallback gem_urls sync error:', err);
      }
    }
  };

  const handleToggleGemActive = async (id, isActive) => {
    const { error } = await supabase
      .from('featured_gems')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (!error) fetchGems();
  };

  const handleDeleteGem = async (id) => {
    if (!window.confirm('Delete this featured gem?')) return;

    const { error } = await supabase
      .from('featured_gems')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchGems();
    } else {
      setMessage({ type: 'error', text: 'Failed to delete gem: ' + error.message });
    }
  };

  const handleUploadGemImage = async (e, gemId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `gems/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file);

    if (uploadError) {
      setMessage({ type: 'error', text: 'Upload failed: ' + uploadError.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('featured_gems')
      .update({ image_url: urlData.publicUrl })
      .eq('id', gemId);

    if (dbError) {
      setMessage({ type: 'error', text: 'DB Update failed: ' + dbError.message });
    } else {
      setMessage({ type: 'success', text: 'Gem image uploaded successfully!' });
      fetchGems();
    }
    setUploading(false);
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedItemIdx === null || draggedItemIdx === targetIdx) return;
    handleReorderGems(draggedItemIdx, targetIdx);
    setDraggedItemIdx(null);
  };

  const handleMoveGem = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= gems.length) return;
    handleReorderGems(index, targetIdx);
  };

  const handleReorderGems = async (draggedIdx, targetIdx) => {
    if (draggedIdx === targetIdx) return;
    
    const reordered = [...gems];
    const [removed] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, removed);
    
    setGems(reordered.map((gem, idx) => ({ ...gem, order_index: idx })));
    
    const updates = reordered.map((gem, idx) => {
      return supabase
        .from('featured_gems')
        .update({ order_index: idx })
        .eq('id', gem.id);
    });
    
    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed) {
      setMessage({ type: 'error', text: 'Reordering sync failed: ' + failed.error.message });
      fetchGems();
    } else {
      setMessage({ type: 'success', text: 'Gems order updated successfully!' });
    }
  };

  const handleUploadPromo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `promos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file);

    if (uploadError) {
      setMessage({ type: 'error', text: 'Upload failed: ' + uploadError.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('promotions')
      .insert({
        image_url: urlData.publicUrl,
        is_active: true,
        order_index: promos.length
      });

    if (dbError) {
      setMessage({ type: 'error', text: 'DB Save failed: ' + dbError.message });
    } else {
      setMessage({ type: 'success', text: 'Promo uploaded successfully!' });
      fetchPromos();
    }
    setUploading(false);
  };

  const handleTogglePromo = async (id, isActive) => {
    const { error } = await supabase
      .from('promotions')
      .update({ is_active: !isActive })
      .eq('id', id);
    
    if (!error) fetchPromos();
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Delete this promo?')) return;

    const { error: dbError } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (!dbError) fetchPromos();
  };

  const handleAddPromoByUrl = async () => {
    const url = window.prompt('Enter Banner Image URL:');
    if (!url) return;
    const targetUrl = window.prompt('Enter Redirect / Destination URL (optional, e.g. https://...):', '') || '';

    let newId = null;
    const { data, error } = await supabase
      .from('promotions')
      .insert({
        image_url: url,
        target_url: targetUrl,
        is_active: true,
        order_index: promos.length
      })
      .select();

    if (error) {
      // Fallback if target_url column does not exist in promotions table yet
      const { data: fallbackData } = await supabase
        .from('promotions')
        .insert({
          image_url: url,
          is_active: true,
          order_index: promos.length
        })
        .select();
      if (fallbackData && fallbackData[0]) {
        newId = fallbackData[0].id;
      }
    } else if (data && data[0]) {
      newId = data[0].id;
    }

    if (targetUrl && newId) {
      try {
        const { data: existingSetting } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'promo_target_urls')
          .single();
        const existingMap = existingSetting && existingSetting.value ? JSON.parse(existingSetting.value) : {};
        existingMap[newId] = targetUrl;
        await supabase
          .from('site_settings')
          .upsert({
            key: 'promo_target_urls',
            value: JSON.stringify(existingMap),
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      } catch (err) {
        console.warn('Fallback promo_target_urls error:', err);
      }
    }

    fetchPromos();
  };

  const handleUpdatePromoUrl = async (id, newUrl) => {
    const { error } = await supabase
      .from('promotions')
      .update({ image_url: newUrl })
      .eq('id', id);
    
    if (!error) fetchPromos();
  };

  const handleUpdatePromoTargetUrl = async (id, targetUrl) => {
    // 1. Update state immediately for instant feedback
    setPromos(prev => prev.map(p => p.id === id ? { ...p, target_url: targetUrl } : p));

    // 2. Attempt updating promotions table
    try {
      await supabase
        .from('promotions')
        .update({ target_url: targetUrl })
        .eq('id', id);
    } catch (e) {
      console.warn('Direct promotions.target_url update skipped:', e);
    }

    // 3. Two-tier persistence in site_settings (guaranteed to persist even before SQL migration)
    try {
      const { data: existingSetting } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'promo_target_urls')
        .single();
      const existingMap = existingSetting && existingSetting.value ? JSON.parse(existingSetting.value) : {};
      existingMap[id] = targetUrl;
      await supabase
        .from('site_settings')
        .upsert({
          key: 'promo_target_urls',
          value: JSON.stringify(existingMap),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    } catch (err) {
      console.warn('Fallback promo_target_urls sync error:', err);
    }
  };

  const fetchArchives = async () => {
    setArchivesLoading(true);
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('status', 'published')
      .order('report_date', { ascending: false });

    if (!error) {
      setArchives(data);
    }
    setArchivesLoading(false);
  };

  const fetchDraft = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('report_date', today)
      .single();

    if (error) {
      console.log("No report found for today yet.");
    } else {
      setReport(data);
    }
    setLoading(false);
  };

  const handleUpdateField = (section, index, field, value) => {
    const updatedContent = { ...report.content_json };
    if (section === 'dailyReport') {
      updatedContent.dailyReport[index][field] = value;
    } else {
      updatedContent[section][index][field] = value;
    }
    setReport({ ...report, content_json: updatedContent });
  };

  const handleAddItem = (section) => {
    const updatedContent = { ...report.content_json };
    const newItem = {
      title: 'New Item',
      description: '',
      url: '',
      image: ''
    };
    if (section === 'phPicks' || section === 'aiTools') {
      newItem.name = 'New Product';
      newItem.thumbnail = '';
      delete newItem.title;
      delete newItem.image;
    }
    updatedContent[section] = [...(updatedContent[section] || []), newItem];
    setReport({ ...report, content_json: updatedContent });
  };

  const handleUpdateDailyReport = (key, field, value) => {
    const updatedContent = { ...report.content_json };
    updatedContent.dailyReport[key][field] = value;
    setReport({ ...report, content_json: updatedContent });
  };

  const handlePublish = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    console.log('Attempting to publish report for:', report.report_date);

    const { error } = await supabase
      .from('daily_reports')
      .update({
        content_json: report.content_json,
        content_md: report.content_md || '',
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .eq('report_date', report.report_date);

    if (error) {
      console.error('Publication error details:', JSON.stringify(error, null, 2), 'Message:', error.message, 'Code:', error.code, 'Details:', error.details);
      setMessage({ type: 'error', text: `Failed to publish: ${error.message} (Code: ${error.code}). Details: ${error.details || 'None'}` });
    } else {
      console.log('Publication successful!');
      
      try {
        localStorage.removeItem('builder_daily_report_cache');
        localStorage.removeItem('builder_daily_report_ts');
      } catch (e) {
        console.warn("Could not clear cache:", e);
      }

      setMessage({ type: 'success', text: 'Report published successfully!' });
      setReport({ ...report, status: 'published' });
      fetchArchives();
    }
    setSaving(false);
  };

  const value = {
    ADMIN_EMAIL,
    user,
    authLoading,
    report,
    setReport,
    loading,
    saving,
    message,
    setMessage,
    archives,
    archivesLoading,
    promos,
    setPromos,
    promosLoading,
    promosVisible,
    uploading,
    gems,
    setGems,
    gemsLoading,
    gemsVisible,
    spotlightBg,
    setSpotlightBg,
    spotlightBgHistory,
    cardBgs,
    gemBadges,
    heroFonts,
    savingFonts,
    toggleStyle,
    profiles,
    profilesLoading,
    allowedWriters,
    accessRequests,
    userEvents,
    eventsLoading,
    customAnalytics,
    setCustomAnalytics,
    subscribersCount,
    fetchSubscribersCount,
    draggedItemIdx,

    // Methods
    fetchDraft,
    fetchArchives,
    fetchPromos,
    fetchPromosVisibility,
    fetchGems,
    fetchGemsVisibility,
    fetchSpotlightBg,
    fetchSpotlightBgHistory,
    fetchCardBgs,
    fetchGemBadges,
    fetchHeroFonts,
    fetchToggleStyle,
    fetchProfiles,
    fetchAllowedWriters,
    fetchAccessRequests,
    fetchUserEvents,
    fetchCustomAnalytics,

    handleSaveCustomAnalytics,
    handleClearEvents,
    handleToggleWriterAccess,
    handleUpdateToggleStyle,
    handleUpdateGemBadge,
    handleUpdateHeroFont,
    handleAddHeroFont,
    handleRemoveHeroFont,
    handleSaveHeroFonts,
    handleTogglePromosVisibility,
    handleToggleGemsVisibility,
    handleUploadSpotlightBg,
    handleUpdateSpotlightBgUrl,
    handleUploadCardBg,
    handleUpdateCardBgUrl,
    handleAddGem,
    handleUpdateGemField,
    handleToggleGemActive,
    handleDeleteGem,
    handleUploadGemImage,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleMoveGem,
    handleReorderGems,
    handleUploadPromo,
    handleTogglePromo,
    handleDeletePromo,
    handleAddPromoByUrl,
    handleUpdatePromoUrl,
    handleUpdatePromoTargetUrl,
    handleUpdateField,
    handleAddItem,
    handleUpdateDailyReport,
    handlePublish
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
