import { useEffect, useRef } from 'react';
import { Search, Settings } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import SettingsMenu from './SettingsMenu';
import { useCurrentLang, getText } from '@/utils/i18n';

interface HeaderProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
  isMinimized?: boolean;
}

export default function Header({ onMinimize, onMaximize, onRestore, isMinimized }: HeaderProps) {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const isRevealMode = useAppStore((state) => state.isRevealMode);
  const lang = useCurrentLang();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.focus === 'search') {
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener('navpal:focus', handler);
    return () => window.removeEventListener('navpal:focus', handler);
  }, []);

  return (
    <header className="header">
      {/* Top bar */}
      <div className="header-top">
        {/* Brand */}
        <div className="header-brand">
          <div className="header-logo">N</div>
          <span className="header-title">{getText('appName', lang)}</span>
        </div>

        {/* Actions */}
        <div className="header-actions">
          <SettingsMenu
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onRestore={onRestore}
            isMinimized={isMinimized}
          />
        </div>
      </div>

      {/* Search */}
      <div className="header-search" data-tour="search">
        <Search className="search-icon" size={16} />
        <input
          ref={searchRef}
          type="text"
          placeholder={getText('searchPlaceholder', lang)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="search-clear"
          >
            ×
          </button>
        )}
      </div>
    </header>
  );
}
