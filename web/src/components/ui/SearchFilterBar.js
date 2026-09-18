"use client";
import { Search, X, LayoutGrid, List } from 'lucide-react';

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  placeholder = "Search...",
  viewMode,
  onViewModeChange,
  showViewToggle = false,
  filterPills = [],
  activeFilter,
  onFilterChange
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
      margin: '20px 0'
    }}>
      {/* Search Input Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'var(--bgCard)',
        border: '1px solid var(--borderDark)',
        borderRadius: '12px',
        padding: '8px 14px',
        flex: 1,
        minWidth: '240px',
        maxWidth: '440px',
        transition: 'border-color 0.2s ease'
      }}>
        <Search size={16} color="var(--textMuted)" />
        <input 
          type="text"
          value={searchQuery || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={placeholder}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--textMain)',
            fontSize: '13px',
            width: '100%'
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange?.('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--textMuted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Filter Pills */}
        {filterPills.length > 0 && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {filterPills.map((pill) => {
              const isActive = activeFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => onFilterChange?.(pill.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--primary)' : 'var(--borderDark)',
                    backgroundColor: isActive ? 'rgba(249, 115, 22, 0.12)' : 'var(--bgCard)',
                    color: isActive ? 'var(--primary)' : 'var(--textMuted)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pill.label}
                  {pill.count !== undefined && (
                    <span style={{ marginLeft: '6px', opacity: 0.75 }}>({pill.count})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* View Toggle */}
        {showViewToggle && onViewModeChange && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bgCard)',
            border: '1px solid var(--borderDark)',
            borderRadius: '10px',
            padding: '2px'
          }}>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--bgCardHover)' : 'none',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                color: viewMode === 'grid' ? 'var(--textMain)' : 'var(--textMuted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              style={{
                background: viewMode === 'list' ? 'var(--bgCardHover)' : 'none',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                color: viewMode === 'list' ? 'var(--textMain)' : 'var(--textMuted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
