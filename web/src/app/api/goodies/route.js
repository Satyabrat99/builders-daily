import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_GOODIES } from '@/lib/goodiesData';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isAdmin = searchParams.get('admin') === 'true';
    const status = searchParams.get('status');

    // 1. Fetch live order and custom image overrides from site_settings
    let liveOrder = [];
    let customImages = {};
    try {
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['goodies_live_order', 'goodies_custom_images']);
      if (settingsData) {
        for (const item of settingsData) {
          let parsedVal = item.value;
          if (typeof parsedVal === 'string') {
            try { parsedVal = JSON.parse(parsedVal); } catch (e) {}
          }
          if (item.key === 'goodies_live_order') {
            if (Array.isArray(parsedVal)) {
              liveOrder = parsedVal;
            }
          } else if (item.key === 'goodies_custom_images') {
            if (parsedVal && typeof parsedVal === 'object') {
              customImages = parsedVal;
            }
          }
        }
      }
    } catch (e) {
      console.warn('site_settings fetch warning in /api/goodies:', e);
    }

    let query = supabase
      .from('goodies')
      .select('*')
      .order('is_featured', { ascending: false });

    // Filter by status unless admin specifically asks for all
    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else if (!isAdmin) {
      query = query.eq('status', 'approved');
    }

    let data = null;
    let error = null;
    try {
      const res = await query
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });
      data = res.data;
      error = res.error;
      if (error && (error.code === '42703' || error.message?.toLowerCase().includes('order_index'))) {
        console.warn('goodies.order_index not present in database, ordering by created_at');
        const fallbackRes = await query.order('created_at', { ascending: false });
        data = fallbackRes.data;
        error = fallbackRes.error;
      }
    } catch (qErr) {
      console.warn('goodies query error, fallback to created_at:', qErr);
      const fallbackRes = await query.order('created_at', { ascending: false });
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    let list = data;

    if (error || !list || (list.length === 0 && !isAdmin)) {
      list = INITIAL_GOODIES;
      if (category && category !== 'All') {
        list = list.filter(g => g.category?.toLowerCase() === category.toLowerCase());
      }
    }

    // 2. Enrich with custom dominating images & OG fallback
    let enriched = (list || []).map((item) => {
      const overrides = customImages[item.id] || {};
      const customUrl = overrides.custom_image_url || item.custom_image_url || '';
      const ogUrl = overrides.og_image_url || item.og_image_url || item.thumbnail_url || item.image || '';
      const dominating = (customUrl && customUrl.trim()) ? customUrl.trim() : ogUrl;

      return {
        ...item,
        custom_image_url: customUrl,
        og_image_url: ogUrl,
        thumbnail_url: dominating,
        image: dominating
      };
    });

    // 3. Apply live order sequence if available
    if (liveOrder.length > 0) {
      const liveItems = [];
      const remainingItems = [];
      const itemMap = new Map(enriched.map(g => [g.id, g]));

      for (const id of liveOrder) {
        if (itemMap.has(id)) {
          liveItems.push({ ...itemMap.get(id), is_featured: true });
          itemMap.delete(id);
        }
      }

      for (const g of enriched) {
        if (itemMap.has(g.id)) {
          // If not in liveOrder, ensure it's marked as not featured for digest
          remainingItems.push({ ...g, is_featured: false });
        }
      }

      enriched = [...liveItems, ...remainingItems];
    } else {
      // Sort by order_index if no site_settings live_order
      enriched.sort((a, b) => (a.order_index ?? 99) - (b.order_index ?? 99));
    }

    return NextResponse.json({
      goodies: enriched,
      live_order: liveOrder,
      isFallback: !data || data.length === 0
    });
  } catch (err) {
    console.error('Error fetching goodies:', err);
    return NextResponse.json({ goodies: INITIAL_GOODIES, live_order: [], isFallback: true });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      resource_url, 
      description, 
      platform = 'tool', 
      category = 'SaaS Builders', 
      author_name = 'Curator', 
      author_handle, 
      thumbnail_url,
      custom_image_url,
      og_image_url,
      image,
      status = 'approved', 
      is_featured = false 
    } = body;

    if (!title || !resource_url) {
      return NextResponse.json({ error: 'Title and resource URL are required' }, { status: 400 });
    }

    // Resolve relevant fallback image: source data first, then OG
    let ogFallback = og_image_url || thumbnail_url || image || null;
    if (!ogFallback && resource_url) {
      const ghMatch = resource_url.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
      if (ghMatch && !['features', 'topics', 'trending'].includes(ghMatch[1])) {
        ogFallback = `https://opengraph.githubassets.com/1/${ghMatch[1]}/${ghMatch[2].replace(/\.git$/i, '')}`;
      } else {
        ogFallback = `/api/og-image?url=${encodeURIComponent(resource_url)}`;
      }
    }

    const dominating = (custom_image_url && custom_image_url.trim()) ? custom_image_url.trim() : ogFallback;

    const { data, error } = await supabase
      .from('goodies')
      .insert({
        title: title.trim(),
        resource_url: resource_url.trim(),
        description: description ? description.trim() : null,
        platform,
        category,
        author_name: author_name.trim(),
        author_handle: author_handle ? author_handle.trim() : null,
        thumbnail_url: dominating,
        status,
        is_featured: !!is_featured,
        click_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create goody:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If custom image provided, record in site_settings
    if (data && data.id && custom_image_url) {
      try {
        const { data: existingSettings } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'goodies_custom_images')
          .maybeSingle();

        const customMap = (existingSettings && existingSettings.value) || {};
        customMap[data.id] = { custom_image_url: custom_image_url.trim(), og_image_url: ogFallback };

        await supabase.from('site_settings').upsert({
          key: 'goodies_custom_images',
          value: customMap
        });
      } catch (e) {
        console.warn('Failed to persist custom image in site_settings:', e);
      }
    }

    return NextResponse.json({ success: true, goody: data });
  } catch (err) {
    console.error('Error in POST /api/goodies:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();

    // 1. Handle Bulk Live Order Reorder
    if (body.live_order && Array.isArray(body.live_order)) {
      const orderIds = body.live_order.slice(0, 6); // strictly cap at 6

      // Save to site_settings with JSON.stringify and onConflict
      try {
        const { error: upsertErr } = await supabase.from('site_settings').upsert({
          key: 'goodies_live_order',
          value: JSON.stringify(orderIds),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        if (upsertErr) {
          console.warn('site_settings upsert returned error:', upsertErr);
        }
      } catch (e) {
        console.warn('Failed to upsert goodies_live_order in site_settings:', e);
      }

      // Synchronize order_index and is_featured flag in database
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validUuids = orderIds.filter(id => typeof id === 'string' && uuidRegex.test(id));

      if (validUuids.length > 0) {
        try {
          const updates = orderIds.map(async (id, idx) => {
            if (uuidRegex.test(id)) {
              const res = await supabase
                .from('goodies')
                .update({ order_index: idx, is_featured: true })
                .eq('id', id);
              if (res.error && (res.error.code === '42703' || res.error.message?.includes('order_index'))) {
                // If column doesn't exist yet, update is_featured only
                await supabase
                  .from('goodies')
                  .update({ is_featured: true })
                  .eq('id', id);
              }
            }
          });
          await Promise.all(updates);
        } catch (dbErr) {
          console.warn('Failed to update order_index in database:', dbErr);
        }
      }

      if (body.unfeature_others && validUuids.length > 0) {
        try {
          await supabase
            .from('goodies')
            .update({ is_featured: false })
            .not('id', 'in', `(${validUuids.join(',')})`);
        } catch (e) {}
      }

      return NextResponse.json({ success: true, live_order: orderIds });
    }

    // 2. Handle Single Goody Updates
    const { id, live_order, custom_image_url, og_image_url, ...rawUpdates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Goody ID is required' }, { status: 400 });
    }

    // If live_order was passed alongside single update, save it
    if (live_order && Array.isArray(live_order)) {
      const orderIds = live_order.slice(0, 6);
      try {
        await supabase.from('site_settings').upsert({
          key: 'goodies_live_order',
          value: JSON.stringify(orderIds),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      } catch (e) {}
    }

    // Save custom cover image url & OG fallback in site_settings
    if (custom_image_url !== undefined || og_image_url !== undefined) {
      try {
        const { data: existingSettings } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'goodies_custom_images')
          .maybeSingle();

        let customMap = {};
        if (existingSettings && existingSettings.value) {
          try {
            customMap = typeof existingSettings.value === 'string' 
              ? JSON.parse(existingSettings.value) 
              : existingSettings.value;
          } catch (e) {}
        }

        customMap[id] = {
          custom_image_url: custom_image_url !== undefined ? custom_image_url.trim() : (customMap[id]?.custom_image_url || ''),
          og_image_url: og_image_url !== undefined ? og_image_url.trim() : (customMap[id]?.og_image_url || '')
        };

        await supabase.from('site_settings').upsert({
          key: 'goodies_custom_images',
          value: JSON.stringify(customMap),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      } catch (e) {
        console.warn('Failed to update goodies_custom_images in site_settings:', e);
      }
    }

    // Compute dominating image for thumbnail_url
    let dominatingThumb = rawUpdates.thumbnail_url;
    if (custom_image_url !== undefined) {
      dominatingThumb = custom_image_url.trim() ? custom_image_url.trim() : (og_image_url || rawUpdates.thumbnail_url || '');
    }

    // Allowed database columns
    const allowedColumns = [
      'title',
      'description',
      'resource_url',
      'platform',
      'category',
      'author_name',
      'author_handle',
      'author_avatar',
      'thumbnail_url',
      'status',
      'is_featured',
      'click_count'
    ];

    const cleanUpdates = {};
    for (const key of allowedColumns) {
      if (rawUpdates[key] !== undefined) {
        cleanUpdates[key] = rawUpdates[key];
      }
    }

    if (dominatingThumb) {
      cleanUpdates.thumbnail_url = dominatingThumb;
    }

    // Support aliases
    if (rawUpdates.url && !cleanUpdates.resource_url) {
      cleanUpdates.resource_url = rawUpdates.url;
    }
    if (rawUpdates.image && !cleanUpdates.thumbnail_url) {
      cleanUpdates.thumbnail_url = rawUpdates.image;
    }

    cleanUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('goodies')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase direct update warning in /api/goodies:', error.message);
      // Return success with cleanUpdates so optimistic client state functions even if column missing
      return NextResponse.json({ success: true, goody: { id, ...cleanUpdates, custom_image_url, og_image_url } });
    }

    return NextResponse.json({
      success: true,
      goody: {
        ...data,
        custom_image_url,
        og_image_url,
        thumbnail_url: dominatingThumb || data.thumbnail_url
      }
    });
  } catch (err) {
    console.error('Error in PATCH /api/goodies:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Goody ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('goodies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete goody:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('Error in DELETE /api/goodies:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
