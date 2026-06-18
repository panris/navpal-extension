import { useEffect, useCallback } from 'react';
import { useAppStore, useVisibleGroups, useVisibleBookmarks, getEffectiveLang } from '@/stores/appStore';
import Header from '@/components/Header';
import GroupTabs from '@/components/GroupTabs';
import BookmarkGrid from '@/components/BookmarkGrid';
import Footer from '@/components/Footer';
import EditModal from '@/components/EditModal';
import SecretModal from '@/components/SecretModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import OnboardingTour from '@/components/OnboardingTour';
import { useCurrentLang, getText } from '@/utils/i18n';

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

  // Side panel mode - no window management needed

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

  return (
    <div
      className="flex flex-col relative overflow-hidden"
      style={{ width: '360px', minHeight: '600px' }}
    >
      {/* Header */}
      <Header />

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

      {/* Modals */}
      <ErrorBoundary><EditModal /></ErrorBoundary>
      <ErrorBoundary><SecretModal /></ErrorBoundary>

      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
}
