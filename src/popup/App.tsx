import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore, useVisibleGroups, useVisibleBookmarks, getEffectiveLang } from '@/stores/appStore';
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
  const prevSizeRef = useRef<{ w: number; h: number } | null>(null);

  // ── Resizable popup ─────────────────────────────────────────────
  const { width, height, isResizing, handleMouseDown, resizeTo } = useResizable({
    minWidth: 320,
    maxWidth: 800,
    minHeight: 400,
    maxHeight: 800,
  });

  // Initialize language and theme from stored preferences on mount
  useEffect(() => {
    const langPref = useAppStore.getState().langPref;
    const theme = useAppStore.getState().theme;
    const effectiveLang = getEffectiveLang(langPref);
    import('@/stores/appStore').then(({ notifyLangChange, notifyThemeChange }) => {
      notifyLangChange(effectiveLang);
      notifyThemeChange(theme);
    });
  }, []);

  // Default active group - only reset if activeGroupId is invalid (not in groups)
  // Do NOT override when activeGroupId is null (user selected "All")
  useEffect(() => {
    if (groups.length > 0 && activeGroupId && !groups.find((g) => g.id === activeGroupId)) {
      setActiveGroup(groups[0].id);
    }
  }, [activeGroupId, groups, setActiveGroup]);

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
  console.log('[NavPal DBG] App: visibleBookmarks:', bookmarks.length, 'filteredByGroup:', filteredBookmarks.length, 'activeGroupId:', activeGroupId);

  // ── Window controls ──────────────────────────────────────────
  /** 最小化：折叠内容区域，只显示状态栏+展开按钮 */
  const handleMinimize = () => setViewMode('minimized');

  /** 恢复正常：从最小化展开，或从最大化回到之前尺寸 */
  const handleRestore = () => {
    if (prevSizeRef.current && width >= 800 && height >= 800) {
      resizeTo(prevSizeRef.current.w, prevSizeRef.current.h);
      prevSizeRef.current = null;
    }
    setViewMode('default');
  };

  /** 最大化：记录当前尺寸，将弹窗扩展到最大尺寸（800x800） */
  const handleMaximize = () => {
    prevSizeRef.current = { w: width, h: height };
    resizeTo(800, 800);
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
      className="flex flex-col relative overflow-hidden transition-all duration-300"
      style={{
        width: `${width}px`,
        height: containerHeight,
      }}
    >
      {/* ── Minimized: compact bar only ─────────────────────────── */}
      {viewMode === 'minimized' ? (
        <div className="flex items-center justify-center flex-1 px-4 gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-white/80">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <span>{appName}</span>
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
            onRestore={handleRestore}
            isMinimized={false}
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
