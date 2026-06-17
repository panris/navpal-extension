import { useAppStore, isBookmarkVisibleInGroup } from '@/stores/appStore';
import { Eye, EyeOff } from 'lucide-react';
import { useCurrentLang, getText } from '@/utils/i18n';

// Build timestamp — bump this to confirm extension reload
const BUILD_TS = 'b487c48';

function isBookmarkVisible(region: 'CN' | 'Global' | null, lang: 'zh' | 'en'): boolean {
  if (region === 'CN' && lang === 'en') return false;
  return true;
}

export default function Footer() {
  const isRevealMode = useAppStore((state) => state.isRevealMode);
  const bookmarks = useAppStore((state) => state.bookmarks);
  const lang = useCurrentLang();

  // Use same filter logic as GroupTabs "All" count for consistency
  const visibleCount = bookmarks.filter((b) => {
    if (!isBookmarkVisibleInGroup(b, b.groupId, isRevealMode)) return false;
    if (!isBookmarkVisible(b.region, lang)) return false;
    return true;
  }).length;

  const hiddenCount = bookmarks.filter((b) => {
    if (b.hidden && !b.deletedAt) return true;
    if (b.deletedAt) return false;
    const groupHidden = Object.values(b.groupHidden || {}).some(v => v);
    if (groupHidden && !b.hidden && !b.deletedAt) return true;
    return false;
  }).length;

  return (
    <footer data-tour="reveal" className="bg-white border-t border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Status */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600">
            📌 {visibleCount} {getText('bookmarks', lang)} <span className="text-gray-300">v{BUILD_TS}</span>
          </span>
          {hiddenCount > 0 && !isRevealMode && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
              <EyeOff className="w-3.5 h-3.5" />
              {hiddenCount} {getText('hidden', lang)}
            </span>
          )}
          {isRevealMode && (
            <span className="flex items-center gap-1 text-xs font-semibold text-violet-600">
              <Eye className="w-3.5 h-3.5" />
              {getText('revealModeLabel', lang)}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
