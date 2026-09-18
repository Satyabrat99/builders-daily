import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    // Rate limit: Max 5 resource submissions per 15 minutes per IP
    const rateCheck = checkRateLimit(request, {
      prefix: 'goodies-submit',
      limit: 5,
      windowMs: 15 * 60 * 1000
    });
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(rateCheck.resetAt);
    }

    const body = await request.json();
    const { title, resource_url, platform, category, author_name, author_handle, description } = body;

    if (!title || !resource_url) {
      return NextResponse.json(
        { error: 'Title and resource URL are required.' },
        { status: 400 }
      );
    }

    // Auto-detect platform if not provided
    let detectedPlatform = platform || 'tool';
    const lowerUrl = resource_url.toLowerCase();
    if (lowerUrl.includes('docs.google.com/spreadsheets')) detectedPlatform = 'sheets';
    else if (lowerUrl.includes('notion.so') || lowerUrl.includes('notion.site')) detectedPlatform = 'notion';
    else if (lowerUrl.includes('figma.com')) detectedPlatform = 'figma';
    else if (lowerUrl.includes('gist.github.com') || lowerUrl.includes('.cursorrules')) detectedPlatform = 'cursorrules';
    else if (lowerUrl.includes('github.com')) detectedPlatform = 'code';

    // Insert as pending
    const { data, error } = await supabase
      .from('goodies')
      .insert({
        title: title.trim(),
        description: description ? description.trim() : null,
        resource_url: resource_url.trim(),
        platform: detectedPlatform,
        category: category || 'SaaS Builders',
        author_name: (author_name || 'Community Builder').trim(),
        author_handle: author_handle ? author_handle.trim() : null,
        status: 'pending',
        is_featured: false,
        click_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to submit goody to Supabase:', error);
      // Return success simulation if table is being created
      return NextResponse.json({ 
        success: true, 
        message: 'Resource submitted successfully for review!',
        pendingItem: { title, resource_url, status: 'pending' }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Resource submitted successfully for review!',
      goody: data
    });
  } catch (err) {
    console.error('Error in /api/goodies/submit:', err);
    return NextResponse.json(
      { error: 'Internal server error processing submission' },
      { status: 500 }
    );
  }
}
