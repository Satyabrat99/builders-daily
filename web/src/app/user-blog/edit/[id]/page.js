"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import BlogEditor from '@/components/Admin/BlogEditor';
import AccessDenied from '@/components/Admin/AccessDenied';
import { useParams } from 'next/navigation';

export default function EditUserBlogPage() {
  const { id } = useParams();
  const { user, loading: authLoading, isWriter } = useAuth();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwner, setCheckingOwner] = useState(true);

  useEffect(() => {
    if (id && user && isWriter) {
      checkOwnershipAndFetch();
    }
  }, [id, user, isWriter]);

  const checkOwnershipAndFetch = async () => {
    setCheckingOwner(true);
    try {
      // 1. Fetch author mapping
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

      // Check if user owns this post ID
      if (mapping[id] === user.id) {
        setIsOwner(true);
        
        // Fetch blog post data
        const { data, error } = await supabase
          .from('builder_blogs')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          setInitialData(data);
        } else {
          alert('Error fetching post data');
        }
      } else {
        setIsOwner(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingOwner(false);
      setLoading(false);
    }
  };

  if (authLoading || checkingOwner) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Verifying permissions...</div>;
  }

  if (!user || !isWriter) {
    return <AccessDenied user={user} />;
  }

  if (!isOwner) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        fontFamily: 'var(--font-article, "DM Sans", sans-serif)',
        padding: '24px',
        textAlign: 'center',
        gap: '16px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-heading)' }}>Access Denied</h2>
        <p style={{ fontSize: '15px', color: 'var(--color-body-text)', maxWidth: '420px', lineHeight: '1.6' }}>
          You do not have permission to edit this post because you are not the author.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading Editor...</div>;
  }

  return <BlogEditor initialData={initialData} />;
}
