"use client";
import { AdminBlogProvider } from '@/components/AdminBlog/AdminBlogContext';
import AdminBlogLayout from '@/components/AdminBlog/AdminBlogLayout';

export default function BlogAdminDashboardLayout({ children }) {
  return (
    <AdminBlogProvider>
      <AdminBlogLayout>
        {children}
      </AdminBlogLayout>
    </AdminBlogProvider>
  );
}
