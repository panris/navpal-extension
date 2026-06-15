import { useAppStore } from '@/stores/appStore';
import { Eye, EyeOff } from 'lucide-react';
import { useCurrentLang, getText } from '@/utils/i18n';

export default function Footer() {
  const isRevealMode = useAppStore((state) => state.isRevealMode);
  const bookmarks = useAppStore((state) => state.bookmarks);
  const lang = useCurrentLang();

  const visibleCount = bookmarks.filter((b) => !b.hidden).length;
  const hiddenCount = bookmarks.filter((b) => b.hidden).length;

  return (
    <footer data-tour="reveal" className="bg-white border-t border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Status */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600">
            📌 {visibleCount} {getText('bookmarks', lang)}
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
