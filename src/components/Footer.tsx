import { useAppStore } from '@/stores/appStore';
import { Eye, EyeOff } from 'lucide-react';

export default function Footer() {
  const isRevealMode = useAppStore((state) => state.isRevealMode);
  const bookmarks = useAppStore((state) => state.bookmarks);

  const visibleCount = bookmarks.filter((b) => !b.hidden).length;
  const hiddenCount = bookmarks.filter((b) => b.hidden).length;

  return (
    <footer className="bg-white border-t border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Status */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600">
            📌 {visibleCount} 个书签
          </span>
          {hiddenCount > 0 && !isRevealMode && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
              <EyeOff className="w-3.5 h-3.5" />
              {hiddenCount} 隐藏
            </span>
          )}
          {isRevealMode && (
            <span className="flex items-center gap-1 text-xs font-semibold text-violet-600">
              <Eye className="w-3.5 h-3.5" />
              全量模式
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
