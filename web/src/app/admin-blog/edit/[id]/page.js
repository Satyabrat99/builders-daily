"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import BlogEditor from '@/components/Admin/BlogEditor';
import { useParams } from 'next/navigation';
import AccessDenied from '@/components/Admin/AccessDenied';

export default function EditBlogPage() {
  const { id } = useParams();
  const { user, loading: authLoading, isWriter } = useAuth();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user && isWriter) {
      fetchBlog();
    }
  }, [id, user, isWriter]);

  const fetchBlog = async () => {
    if (!initialData) setLoading(true);
    const { data, error } = await supabase.from('builder_blogs').select('*').eq('id', id).single();
    if (!error && data) {
      setInitialData(data);
    } else {
      alert('Error fetching post');
    }
    setLoading(false);
  };

  if (authLoading || loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Editor...</div>;
  if (!user || !isWriter) return <AccessDenied user={user} />;

  return <BlogEditor initialData={initialData} />;
}
