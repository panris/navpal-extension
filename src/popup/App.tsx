import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore, useVisibleGroups, useVisibleBookmarks } from '@/stores/appStore';
import Header from '@/components/Header';
import GroupTabs from '@/components/GroupTabs';
import BookmarkGrid from '@/components/BookmarkGrid';
import Footer from '@/components/Footer';
import EditModal from '@/components/EditModal';
import SecretModal from '@/components/SecretModal';

type ViewMode = 'default' | 'minimized' | 'maximized';

function formatTime(): string {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function App() {
  const isRevealMode = useAppStore((state) => state.isRevealMode);
  const exitRevealMode = useAppStore((state) => state.exitRevealMode);
  const activeGroupId = useAppStore((state) => state.activeGroupId);
  const setActiveGroup = useAppStore((state) => state.setActiveGroup);
  const toggleEditMode = useAppStore((state) => state.toggleEditMode);
  const revealMode = useAppStore((state) => state.revealMode);
  const groups = useVisibleGroups();
  const bookmarks = useVisibleBookmarks();

  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [currentTime, setCurrentTime] = useState(formatTime);

  // 设置默认选中的分组
  useEffect(() => {
    if (!activeGroupId && groups.length > 0) {
      setActiveGroup(groups[0].id);
    }
  }, [activeGroupId, groups, setActiveGroup]);

  // Real-time clock
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(formatTime()), 30000);
    return () => clearInterval(tick);
  }, []);

  // 关闭 Popup 时退出全量模式
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRevealMode) {
        exitRevealMode();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRevealMode, exitRevealMode]);

  // 按分组过滤书签
  const filteredBookmarks = activeGroupId
    ? bookmarks.filter((b) => b.groupId === activeGroupId)
    : bookmarks;

  const handleMinimize = () => {
    setViewMode('minimized');
  };

  const handleMaximize = () => {
    setViewMode('maximized');
    // 最大化时打开新标签页显示完整内容
    window.open(chrome.runtime.getURL('index.html'), '_blank');
    window.close();
  };

  const handleRestore = () => {
    setViewMode('default');
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    // Don't intercept when typing in inputs
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    switch (e.key) {
      case '/':
      case 'k':
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

  return (
    <div className={`flex flex-col bg-gray-50 relative overflow-hidden transition-all duration-300 ${
    viewMode === 'minimized' ? 'h-16' : viewMode === 'maximized' ? 'h-screen' : 'h-screen'
    }`}>
      {/* Status Bar */}
      <div className="status-bar">
        <span className="font-semibold">{currentTime}</span>
        <div className="flex items-center gap-1">
          {/* Signal */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" className="opacity-80">
            <path d="M8 2.4C10.5 2.4 12.5 3.6 13.5 5.4C14 4.4 14.5 3.2 14.5 2C14.5 0.9 13.9 0 13 0H3C2.1 0 1.5 0.9 1.5 2C1.5 3.2 2 4.4 2.5 5.4C3.5 3.6 5.5 2.4 8 2.4Z"/>
          </svg>
          {/* WiFi */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" className="opacity-80">
            <path d="M8 9.6C9.2 9.6 10 8.8 10 7.6C10 6.4 9.2 5.6 8 5.6C6.8 5.6 6 6.4 6 7.6C6 8.8 6.8 9.6 8 9.6Z"/>
            <path d="M8 11C10.5 11 12.5 9.3 13.3 7.1C12.9 7.4 12.4 7.6 11.8 7.6C10.3 7.6 9.1 6.4 9.1 4.9C9.1 3.4 10.3 2.2 11.8 2.2C12.4 2.2 12.9 2.4 13.3 2.7C12.5 0.5 10.5-0.3 8-0.3C5.5-0.3 3.5 0.5 2.7 2.7C3.1 2.4 3.6 2.2 4.2 2.2C5.7 2.2 6.9 3.4 6.9 4.9C6.9 6.4 5.7 7.6 4.2 7.6C3.6 7.6 3.1 7.4 2.7 7.1C3.5 9.3 5.5 11 8 11Z" opacity="0.6"/>
          </svg>
          {/* Battery */}
          <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor" className="opacity-80">
            <rect x="0" y="2" width="16" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
            <rect x="16" y="4" width="2" height="4" rx="0.5"/>
            <rect x="1.5" y="3" width="11" height="6" rx="1" fill="white" opacity="0.8"/>
          </svg>
        </div>
      </div>

      {/* Header - Always visible */}
      <Header
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onRestore={handleRestore}
        isMaximized={viewMode === 'maximized'}
      />

      {/* Minimized Bar - Only show when minimized */}
      {viewMode === 'minimized' ? (
        <div className="flex items-center justify-center h-12 bg-white border-t border-gray-100">
          <button
            onClick={handleRestore}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <span>展开</span>
          </button>
        </div>
      ) : (
        <>
          {/* Group Tabs */}
          <GroupTabs />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4">
            <BookmarkGrid bookmarks={filteredBookmarks} />
          </main>
          
          {/* Footer */}
          <Footer />
        </>
      )}

      {/* Modals */}
      <EditModal />
      <SecretModal />

      {/* Home Indicator */}
      {viewMode !== 'minimized' && <div className="home-indicator" />}
    </div>
  );
}
