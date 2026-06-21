import { useMemo } from 'react';
import { useAppStore, isBookmarkVisibleInGroup } from '@/stores/appStore';
import { Eye, EyeOff } from 'lucide-react';
import { useCurrentLang, getText } from '@/utils/i18n';
import { isBookmarkVisible } from '@/utils/bookmarkVisibility';

const BUILD_TS = 'b487c48';

export default function Footer() {
  const isRevealMode = useAppStore((state) => state.isRevealMode);
  const bookmarks = useAppStore((state) => state.bookmarks);
  const lang = useCurrentLang();

  const visibleCount = useMemo(() =>
    bookmarks.filter((b) => {
      if (!isBookmarkVisibleInGroup(b, b.groupId, isRevealMode)) return false;
      if (!isBookmarkVisible(b.region, lang)) return false;
      return true;
    }).length,
    [bookmarks, isRevealMode, lang]
  );

  const hiddenCount = useMemo(() =>
    bookmarks.filter((b) => {
      if (b.deletedAt) return false;
      return b.hidden || Object.values(b.groupHidden || {}).some(v => v);
    }).length,
    [bookmarks]
  );

  return (
    <footer className="footer">
      <div className="flex items-center justify-between">
        <div className="footer-stats" data-tour="reveal">
          📌 {visibleCount} {getText('bookmarks', lang)}
          {hiddenCount > 0 && !isRevealMode && (
            <span className="ml-2" style={{ color: 'var(--warning-color)' }}>
              <EyeOff size={12} className="inline mr-1" />
              {hiddenCount} {getText('hidden', lang)}
            </span>
          )}
          {isRevealMode && (
            <span className="ml-2" style={{ color: 'var(--accent-color)' }}>
              <Eye size={12} className="inline mr-1" />
              {getText('revealModeLabel', lang)}
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>v{BUILD_TS}</span>
      </div>
    </footer>
  );
}
