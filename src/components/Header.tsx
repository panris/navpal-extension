import { useEffect, useRef, useCallback } from 'react';
import { Search, Compass } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import SettingsMenu from './SettingsMenu';
import { useCurrentLang, getText } from '@/utils/i18n';

interface HeaderProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMinimized?: boolean;
}

export default function Header({ onMinimize, onMaximize, isMinimized }: HeaderProps) {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const isRevealMode = useAppStore((state) => state.isRevealMode);
  const lang = useCurrentLang();
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(value);
    }, 200);
  }, [setSearchQuery]);

  // Expose search focus for keyboard shortcut
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if ((e as any).detail?.focus === 'search') {
        searchRef.current?.focus();
      }
    };
    window.addEventListener('navpal:focus', handler);
    return () => window.removeEventListener('navpal:focus', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className="app-header">
      <div className="flex items-center justify-between mb-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">{getText('appName', lang)}</div>
            <div className="text-[10px] opacity-80">{getText('appTagline', lang)}</div>
          </div>
          {isRevealMode && (
            <span className="reveal-badge inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full ml-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {getText('revealMode', lang)}
            </span>
          )}
        </div>

        {/* Settings Menu */}
        <SettingsMenu
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isMinimized={isMinimized}
        />
      </div>

      {/* Search */}
      <div data-tour="search" className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
        <input
          ref={searchRef}
          type="text"
          placeholder={getText('searchPlaceholder', lang)}
          defaultValue={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm search-glass rounded-xl placeholder-white/60"
        />
      </div>
    </div>
  );
}
