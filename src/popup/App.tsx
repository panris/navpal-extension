import { useEffect, useState, useCallback } from 'react';
import { useAppStore, useVisibleGroups, useVisibleBookmarks, subscribeLang, getEffectiveLang } from '@/stores/appStore';
import Header from '@/components/Header';
import GroupTabs from '@/components/GroupTabs';
import BookmarkGrid from '@/components/BookmarkGrid';
import Footer from '@/components/Footer';
import EditModal from '@/components/EditModal';
import SecretModal from '@/components/SecretModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import ResizeHandle from '@/components/ResizeHandle';
import OnboardingTour from '@/components/OnboardingTour';
import { useCurrentLang, getText } from '@/utils/i18n';
import { useResizable } from '@/hooks/useResizable';

type ViewMode = 'default' | 'minimized';

function formatTime(): string {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Full-page 入口（manifest web_accessible_resources 配置）
const FULLPAGE_URL = chrome.runtime.getURL('index.html');

export default function App() {
  const isRevealMode = useAppStore((s) => s.isRevealMode);
  const exitRevealMode = useAppStore((s) => s.exitRevealMode);
  const activeGroupId = useAppStore((s) => s.activeGroupId);
  const setActiveGroup = useAppStore((s) => s.setActiveGroup);
  const toggleEditMode = useAppStore((s) => s.toggleEditMode);
  const revealMode = useAppStore((s) => s.revealMode);
  const groups = useVisibleGroups();
  const bookmarks = useVisibleBookmarks();
  const lang = useCurrentLang();

  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [currentTime, setCurrentTime] = useState(formatTime);

  // ── Resizable popup ─────────────────────────────────────────────
  const { width, height, isResizing, handleMouseDown } = useResizable({
    minWidth: 320,
    maxWidth: 800,
    minHeight: 400,
    maxHeight: 800,
  });

  // Initialize language from langPref on mount
  useEffect(() => {
    const langPref = useAppStore.getState().langPref;
    const effectiveLang = getEffectiveLang(langPref);
    import('@/stores/appStore').then(({ notifyLangChange }) => {
      notifyLangChange(effectiveLang);
    });
  }, []);

  // Default active group
  useEffect(() => {
    if (!activeGroupId && groups.length > 0) {
      setActiveGroup(groups[0].id);
    }
  }, [activeGroupId, groups, setActiveGroup]);

  // Clock: tick every 30s
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(formatTime()), 30000);
    return () => clearInterval(tick);
  }, []);

  // Close popup → exit reveal mode
  useEffect(() => {
    const handler = () => {
      if (isRevealMode) exitRevealMode();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [isRevealMode, exitRevealMode]);

  const filteredBookmarks = activeGroupId
    ? bookmarks.filter((b) => b.groupId === activeGroupId)
    : bookmarks;

  // ── Window controls ──────────────────────────────────────────
  /** 最小化：折叠内容区域，只显示状态栏+展开按钮 */
  const handleMinimize = () => setViewMode('minimized');

  /** 恢复正常（从最小化展开） */
  const handleRestore = () => setViewMode('default');

  /** 最大化：打开完整页面，关闭当前 popup */
  const handleMaximize = () => {
    window.open(FULLPAGE_URL, '_blank');
    window.close();
  };

  // ── Keyboard shortcuts ────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    switch (e.key) {
      case '/':
        if (e.ctrlKey || e.key === '/') {
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

  // I18n labels
  const appName = getText('appName', lang);

  const containerHeight = viewMode === 'minimized' ? '64px' : `${height}px`;

  return (
    <div
      className="flex flex-col bg-gray-50 relative overflow-hidden transition-all duration-300"
      style={{
        width: `${width}px`,
        height: containerHeight,
      }}
    >
      {/* Status Bar */}
      <div className="status-bar">
        <span className="font-semibold">{currentTime}</span>
        <div className="flex items-center gap-1">
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

      {/* ── Minimized: compact bar only ─────────────────────────── */}
      {viewMode === 'minimized' ? (
        <div className="flex items-center justify-center flex-1 px-4 gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-white/80">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <span>伴航 {appName}</span>
          </div>
          <button
            onClick={handleRestore}
            className="px-4 py-1.5 text-xs font-semibold text-violet-600 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            {getText('expand', lang)}
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <Header
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            isMinimized={viewMode === 'minimized'}
          />

          {/* Group Tabs */}
          <ErrorBoundary>
            <GroupTabs />
          </ErrorBoundary>

          {/* Main Content */}
          <main data-tour="edit" className="flex-1 overflow-y-auto p-4">
            <ErrorBoundary>
              <BookmarkGrid bookmarks={filteredBookmarks} />
            </ErrorBoundary>
          </main>

          {/* Footer */}
          <Footer />
        </>
      )}

      {/* Modals */}
      <ErrorBoundary><EditModal /></ErrorBoundary>
      <ErrorBoundary><SecretModal /></ErrorBoundary>

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Home Indicator */}
      {viewMode !== 'minimized' && <div className="home-indicator" />}

      {/* Resize Handle */}
      {viewMode !== 'minimized' && (
        <ResizeHandle onMouseDown={handleMouseDown} />
      )}

      {/* Resizing overlay */}
      {isResizing && (
        <div className="absolute inset-0 pointer-events-none z-50" />
      )}
    </div>
  );
}
