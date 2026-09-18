"use client";
import { useState, useRef, useEffect } from 'react';
import { Home, Bookmark, Archive, Sun, Moon, Menu, X, MessageCircle, LogOut, Edit3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import UserDropdown from './UserDropdown';
import ThemeToggleSwitch from '@/components/ui/ThemeToggleSwitch';
import { theme } from '@/theme';
import { requestWriterAccess } from '@/lib/requestAccess';

import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user, logout, isWriter } = useAuth();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);
  
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === '/bookmarks') return 'bookmark';
    if (pathname === '/archive') return 'archive';
    return 'home';
  };
  
  const activeTab = getActiveTab();

  const handleWriteClick = async () => {
    setIsOpen(false);
    setShowDropdown(false);
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

  const [imgError, setImgError] = useState(false);

  const rawAvatarUrl = (
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    user?.identities?.find(i => i?.identity_data?.avatar_url || i?.identity_data?.picture)?.identity_data?.avatar_url ||
    user?.identities?.find(i => i?.identity_data?.avatar_url || i?.identity_data?.picture)?.identity_data?.picture ||
    user?.identities?.[0]?.identity_data?.avatar_url ||
    user?.identities?.[0]?.identity_data?.picture ||
    null
  );

  useEffect(() => {
    setImgError(false);
  }, [user?.id, rawAvatarUrl]);

  const avatarUrl = !imgError ? rawAvatarUrl : null;

  const initial = user?.email?.charAt(0).toUpperCase() || 'U';

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'bookmark', icon: Bookmark, label: 'Saved', path: '/bookmarks' },
    { id: 'archive', icon: Archive, label: 'Archive', path: '/archive' },
  ];

  if (isMobile) {
    return (
      <>
        {/* Hamburger Toggle Button */}
        <button 
          style={styles.hamburgerBtn} 
          onClick={() => setIsOpen(true)}
          aria-label="Open Menu"
          className="click-effect"
        >
          <Menu size={24} />
        </button>

        {/* Overlay Backdrop */}
        {isOpen && (
          <div 
            style={styles.mobileBackdrop} 
            onClick={() => setIsOpen(false)} 
          />
        )}

        {/* Sliding Menu Drawer */}
        <div style={{
          ...styles.mobileDrawer,
          backgroundColor: currentTheme === 'dark' ? '#1A1B1E' : '#FFFFFF',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}>
          {/* Close button */}
          <button style={styles.closeButton} onClick={() => setIsOpen(false)} className="click-effect">
            <X size={24} />
          </button>

          {/* Menu Items */}
          <div style={styles.mobileMenu}>
            {menuItems.map((item) => (
              <div
                key={item.id}
                style={{
                  ...styles.mobileMenuItem,
                  color: activeTab === item.id ? theme.colors.primary : theme.colors.textMain,
                  backgroundColor: activeTab === item.id ? 'rgba(0,0,0,0.04)' : 'transparent'
                }}
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false);
                }}
                className="click-effect"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Theme toggle & User Section */}
          <div style={styles.mobileFooter}>
            <div style={styles.mobileThemeToggle}>
              <span style={styles.footerLabel}>Theme</span>
              <ThemeToggleSwitch />
            </div>
            
            {user && (
              <div style={styles.mobileUserSection}>
                <div style={styles.mobileUserInfo} onClick={() => setShowDropdown(!showDropdown)}>
                  <div style={styles.avatar}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.email || 'Profile'}
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                        style={styles.avatarImg}
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <div style={styles.mobileEmail}>{user.email}</div>
                </div>
                {showDropdown && (
                  <div style={styles.mobileUserDropdown}>
                    <div style={styles.dropdownItem} onClick={handleWriteClick}>
                      <Edit3 size={16} />
                      <span>Write on Builders</span>
                    </div>
                    <div style={styles.dropdownDivider}></div>
                    <div 
                      style={styles.dropdownItem} 
                      onClick={() => { 
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-reach-us', { detail: { tab: 'goody' } }));
                        }
                        setIsOpen(false); 
                      }}
                    >
                      <MessageCircle size={16} />
                      <span>Reach us</span>
                    </div>
                    <div style={styles.dropdownDivider}></div>
                    <div style={{...styles.dropdownItem, color: '#ef4444'}} onClick={async () => { await logout(); setIsOpen(false); }}>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Desktop View (default)
  return (
    <aside style={styles.sidebar}>
      <div style={styles.topSection}>
        <div style={styles.logo}>
          <img 
            src="/builders daily-webp.webp" 
            alt="Builders Daily" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.2)' }} 
          />
        </div>
      </div>

      <div style={styles.iconsContainer}>
        {menuItems.map((item) => (
          <div 
            key={item.id}
            style={{ 
              ...styles.iconWrapper, 
              backgroundColor: activeTab === item.id ? 'rgba(0,0,0,0.04)' : 'transparent',
              color: activeTab === item.id ? theme.colors.primary : theme.colors.textMain
            }}
            onClick={() => router.push(item.path)}
            className="sidebar-item click-effect"
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            {activeTab === item.id && <div style={styles.activeIndicator}></div>}
          </div>
        ))}
      </div>

      {user && (
        <div
          ref={dropdownRef}
          style={styles.userSection}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {showDropdown && (
            <UserDropdown 
              onClose={() => setShowDropdown(false)} 
              onReachUs={() => { 
                setShowDropdown(false); 
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-reach-us', { detail: { tab: 'goody' } }));
                }
              }}
            />
          )}
          <div style={styles.avatar}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.email || 'Profile'}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                style={styles.avatarImg}
              />
            ) : (
              initial
            )}
          </div>
        </div>
      )}
      <div style={styles.themeToggleWrapper}>
        <ThemeToggleSwitch />
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: '24px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '72px',
    height: 'auto',
    maxHeight: '80vh',
    backgroundColor: theme.colors.bgSidebar,
    backdropFilter: theme.colors.glass.blur,
    WebkitBackdropFilter: theme.colors.glass.blur,
    border: `1px solid ${theme.colors.glass.border}`,
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 0',
    zIndex: 1000,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02)',
  },
  topSection: {
    marginBottom: '32px',
  },
  logo: {
    width: '40px',
    height: '40px',
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  iconsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
    justifyContent: 'center',
  },
  iconWrapper: {
    cursor: 'pointer',
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    left: '-12px',
    width: '4px',
    height: '16px',
    backgroundColor: theme.colors.primary,
    borderRadius: '0 4px 4px 0',
  },
  userSection: {
    position: 'relative',
    marginTop: '32px',
    cursor: 'pointer',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: theme.typography.fontSans,
    color: theme.colors.textMain,
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  themeToggleWrapper: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px 0',
  },
  hamburgerBtn: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: theme.colors.bgSidebar,
    backdropFilter: theme.colors.glass.blur,
    WebkitBackdropFilter: theme.colors.glass.blur,
    border: `1px solid ${theme.colors.glass.border}`,
    color: theme.colors.textMain,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  mobileBackdrop: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1001,
  },
  mobileDrawer: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    right: 0,
    width: '280px',
    height: '100dvh',
    backgroundColor: 'var(--mobile-drawer-bg, var(--bgCard))',
    borderLeft: `1px solid ${theme.colors.border}`,
    boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
    zIndex: 1002,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    boxSizing: 'border-box',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  closeButton: {
    alignSelf: 'flex-end',
    background: 'none',
    border: 'none',
    color: theme.colors.textMain,
    cursor: 'pointer',
    padding: '8px',
    marginBottom: '32px',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  },
  mobileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 16px',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  mobileFooter: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    borderTop: `1px solid ${theme.colors.border}`,
    paddingTop: '24px',
  },
  mobileThemeToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  mobileUserSection: {
    position: 'relative',
  },
  mobileUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  mobileEmail: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.textMain,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '180px',
  },
  mobileUserDropdown: {
    position: 'absolute',
    bottom: '50px',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    boxShadow: '0 -10px 25px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    padding: '6px 0',
    zIndex: 1003,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: theme.colors.border,
    margin: '4px 0',
  }
};
