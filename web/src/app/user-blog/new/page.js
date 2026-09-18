"use client";
import BlogEditor from '@/components/Admin/BlogEditor';
import { useAuth } from '@/context/AuthContext';
import AccessDenied from '@/components/Admin/AccessDenied';

export default function NewUserBlogPage() {
  const { user, loading, isWriter } = useAuth();

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Editor...</div>;
  if (!user || !isWriter) return <AccessDenied user={user} />;

  return <BlogEditor />;
}
