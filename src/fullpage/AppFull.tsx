import { useEffect, useState, useCallback, memo, useRef, useMemo } from 'react';
import { Globe } from 'lucide-react';
import { useAppStore, useVisibleGroups, useVisibleBookmarks, getEffectiveLang } from '@/stores/appStore';
import Header from '@/components/Header';
import GroupTabs from '@/components/GroupTabs';
import BookmarkGrid from '@/components/BookmarkGrid';
import Footer from '@/components/Footer';
import EditModal from '@/components/EditModal';
import SecretModal from '@/components/SecretModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { cn } from '@/utils/cn';
import { useCurrentLang, LANG_OPTIONS } from '@/utils/i18n';

function formatTime(): string {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

const FullpageLangSwitch = memo(() => {
  const langPref = useAppStore((s) => s.langPref);
  const setLangPref = useAppStore((s) => s.setLangPref);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const lang = useCurrentLang();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentOption = LANG_OPTIONS.find(o => o.value === langPref) || LANG_OPTIONS[0];
  const currentLabel = lang === 'en' ? currentOption.label.en : currentOption.label.zh;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-lg border border-white/20 transition-all"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentOption.icon} {currentLabel}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {LANG_OPTIONS.map((opt) => {
            const optLabel = lang === 'en' ? opt.label.en : opt.label.zh;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setLangPref(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all',
                  langPref === opt.value
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span>{opt.icon}</span>
                <span className="font-medium">{optLabel}</span>
                {langPref === opt.value && (
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default function AppFull() {
  const isRevealMode = useAppStore((s) => s.isRevealMode);
  const exitRevealMode = useAppStore((s) => s.exitRevealMode);
  const activeGroupId = useAppStore((s) => s.activeGroupId);
  const setActiveGroup = useAppStore((s) => s.setActiveGroup);
  const toggleEditMode = useAppStore((s) => s.toggleEditMode);
  const revealMode = useAppStore((s) => s.revealMode);
  const groups = useVisibleGroups();
  const bookmarks = useVisibleBookmarks();

  const [currentTime, setCurrentTime] = useState(formatTime);

  // Initialize language from langPref on mount
  useEffect(() => {
    const langPref = useAppStore.getState().langPref;
    const effectiveLang = getEffectiveLang(langPref);
    // Import and call notifyLangChange to set up the event bus
    import('@/stores/appStore').then(({ notifyLangChange }) => {
      notifyLangChange(effectiveLang);
    });
  }, []);

  // Default active group — sync with popup logic: only auto-select when current activeGroupId points to a deleted/missing group
  // Do NOT override when activeGroupId is null (user selected "All")
  useEffect(() => {
    if (groups.length > 0 && activeGroupId && !groups.find((g) => g.id === activeGroupId)) {
      setActiveGroup(groups[0].id);
    }
  }, [activeGroupId, groups, setActiveGroup]);

  // Clock
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(formatTime()), 30000);
    return () => clearInterval(tick);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    switch (e.key) {
      case '/':
      case 'k':
        if (e.ctrlKey || e.key === '/' || e.key === 'k') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('navpal:focus', { detail: { focus: 'search' } }));
        }
        break;
      case 'Escape':
        if (isRevealMode) exitRevealMode();
        break;
      case 'e':
        if (!e.ctrlKey && !e.metaKey) toggleEditMode();
        break;
      case 'r':
        if (!e.ctrlKey && !e.metaKey) revealMode();
        break;
    }
  }, [isRevealMode, exitRevealMode, toggleEditMode, revealMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const filteredBookmarks = useMemo(() =>
    activeGroupId
      ? bookmarks.filter((b) => b.groupId === activeGroupId)
      : bookmarks,
    [activeGroupId, bookmarks]
  );

  return (
    <div className="flex flex-col bg-gray-50 relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Status Bar */}
      <div className="status-bar">
        <span className="font-semibold">{currentTime}</span>
        <div className="flex items-center gap-2">
          <FullpageLangSwitch />
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" className="opacity-80">
            <path d="M8 2.4C10.5 2.4 12.5 3.6 13.5 5.4C14 4.4 14.5 3.2 14.5 2C14.5 0.9 13.9 0 13 0H3C2.1 0 1.5 0.9 1.5 2C1.5 3.2 2 4.4 2.5 5.4C3.5 3.6 5.5 2.4 8 2.4Z"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" className="opacity-80">
            <path d="M8 9.6C9.2 9.6 10 8.8 10 7.6C10 6.4 9.2 5.6 8 5.6C6.8 5.6 6 6.4 6 7.6C6 8.8 6.8 9.6 8 9.6Z"/>
            <path d="M8 11C10.5 11 12.5 9.3 13.3 7.1C12.9 7.4 12.4 7.6 11.8 7.6C10.3 7.6 9.1 6.4 9.1 4.9C9.1 3.4 10.3 2.2 11.8 2.2C12.4 2.2 12.9 2.4 13.3 2.7C12.5 0.5 10.5-0.3 8-0.3C5.5-0.3 3.5 0.5 2.7 2.7C3.1 2.4 3.6 2.2 4.2 2.2C5.7 2.2 6.9 3.4 6.9 4.9C6.9 6.4 5.7 7.6 4.2 7.6C3.6 7.6 3.1 7.4 2.7 7.1C3.5 9.3 5.5 11 8 11Z" opacity="0.6"/>
          </svg>
          <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor" className="opacity-80">
            <rect x="0" y="2" width="16" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
            <rect x="16" y="4" width="2" height="4" rx="0.5"/>
            <rect x="1.5" y="3" width="11" height="6" rx="1" fill="white" opacity="0.8"/>
          </svg>
        </div>
      </div>

      {/* Header — no window controls in full-page mode */}
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>

      {/* Group Tabs */}
      <ErrorBoundary>
        <GroupTabs />
      </ErrorBoundary>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <ErrorBoundary>
          <BookmarkGrid bookmarks={filteredBookmarks} />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>

      {/* Modals */}
      <ErrorBoundary><EditModal /></ErrorBoundary>
      <ErrorBoundary><SecretModal /></ErrorBoundary>
    </div>
  );
}