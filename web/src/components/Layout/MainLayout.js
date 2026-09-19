"use client";
import Sidebar from './Sidebar';
import ReachUsModal from './ReachUsModal';

export default function MainLayout({ children }) {
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.contentArea}>
        {children}
      </div>
      <ReachUsModal />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100vw',
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },
  contentArea: {
    marginLeft: 'var(--content-margin-left, 90px)',
    flex: 1,
    padding: 'var(--content-padding, 40px 60px)',
    display: 'flex',
    justifyContent: 'center',
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  }
};
