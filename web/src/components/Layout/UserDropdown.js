"use client";
import { Settings, MessageCircle, LogOut, Edit3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { requestWriterAccess } from '@/lib/requestAccess';

export default function UserDropdown({ onClose, onReachUs }) {
  const { logout, isWriter, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
  };

  const handleReachUsClick = () => {
    if (onClose) onClose();
    if (onReachUs) {
      onReachUs();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-reach-us', { detail: { tab: 'goody' } }));
    }
  };

  const handleWriteClick = async () => {
    if (onClose) onClose();
    if (isWriter) {
      if (user?.email === 'admin@test.com') {
        router.push('/admin-blog');
      } else {
        router.push('/user-blog');
      }
    } else {
      const confirmRequest = window.confirm(
        "To write articles or share stories on Builders Daily, you need writer access. Would you like to request access from the admin?"
      );
      if (confirmRequest) {
        const res = await requestWriterAccess(user?.id);
        if (res.error) {
          alert('Failed to request access: ' + res.error);
        } else if (res.alreadyRequested) {
          alert('You have already requested access. Please wait for admin approval.');
        } else {
          alert('Access request submitted successfully to admin!');
        }
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.arrow}></div>
      <div style={styles.menu}>
        <div style={styles.item} onClick={handleWriteClick}>
          <Edit3 size={16} />
          <span>Write on Builders</span>
        </div>
        <div style={styles.divider}></div>
        <div style={styles.item} onClick={handleReachUsClick}>
          <MessageCircle size={16} />
          <span>Reach us</span>
        </div>
        <div style={styles.divider}></div>
        <div style={{...styles.item, color: '#ef4444'}} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    bottom: '60px', 
    left: '-10px',
    zIndex: 1000,
    animation: 'fadeInSlideUp 0.2s ease-out',
  },
  arrow: {
    position: 'absolute',
    bottom: '-6px',
    left: '30px',
    transform: 'rotate(45deg)',
    width: '12px',
    height: '12px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
  },
  menu: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    width: '160px',
    overflow: 'hidden',
    padding: '8px 0',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  divider: {
    height: '1px',
    backgroundColor: '#f3f4f6',
    margin: '4px 0',
  }
};

// Add global CSS animation if not already present
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes fadeInSlideUp {
      from { opacity: 0; transform: translate(-50%, 10px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    .user-dropdown-item:hover { background-color: #f9fafb; }
  `;
  document.head.appendChild(styleTag);
}
