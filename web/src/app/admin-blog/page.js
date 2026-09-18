import { redirect } from 'next/navigation';

export default function AdminBlogIndexPage() {
  redirect('/admin-blog/stories');
}
