"use client";
import Sidebar from '@/components/Layout/Sidebar';
import { AdminProvider } from '@/components/Admin/AdminContext';
import AdminLayoutShell from '@/components/Admin/AdminLayout';

export default function AdminLayout({ children }) {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        <AdminProvider>
          <AdminLayoutShell>
            {children}
          </AdminLayoutShell>
        </AdminProvider>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bgApp)',
    color: 'var(--textMain)',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  main: {
    flex: 1,
    marginLeft: '90px', // Matches Sidebar width
    padding: '40px 32px 80px',
    maxWidth: '1440px',
    width: '100%',
    boxSizing: 'border-box',
  }
};
