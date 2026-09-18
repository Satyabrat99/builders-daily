"use client";
import Link from 'next/link';

export default function TabNav({ tabs = [], activeTab, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px',
      backgroundColor: 'var(--bgCard)',
      borderRadius: '16px',
      border: '1px solid var(--borderDark)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
      overflowX: 'auto',
      maxWidth: '100%',
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        const content = (
          <>
            {Icon && <Icon size={16} color={isActive ? 'var(--primary)' : 'currentColor'} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count !== null && (
              <span style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '10px',
                fontWeight: '800',
                lineHeight: '1.2',
                backgroundColor: tab.alert 
                  ? 'rgba(245, 158, 11, 0.15)' 
                  : isActive 
                  ? 'var(--primary)' 
                  : 'var(--borderDark)',
                color: tab.alert 
                  ? '#f59e0b' 
                  : isActive 
                  ? '#ffffff' 
                  : 'var(--textMuted)',
              }}>
                {tab.count}
              </span>
            )}
          </>
        );

        const tabStyles = {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '12px',
          border: '1px solid transparent',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          whiteSpace: 'nowrap',
          textDecoration: 'none',
          backgroundColor: isActive ? 'var(--bgCardHover)' : 'transparent',
          color: isActive ? 'var(--textMain)' : 'var(--textMuted)',
          borderColor: isActive ? 'var(--borderDark)' : 'transparent',
          boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
        };

        if (tab.href) {
          return (
            <Link key={tab.id} href={tab.href} style={tabStyles}>
              {content}
            </Link>
          );
        }

        return (
          <button 
            key={tab.id} 
            onClick={() => onChange?.(tab.id)} 
            style={tabStyles}
            type="button"
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
