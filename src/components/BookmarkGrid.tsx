import { Bookmark } from '@/types';
import { useAppStore } from '@/stores/appStore';
import BookmarkCard from './BookmarkCard';
import { Eye, EyeOff, Edit3 } from 'lucide-react';

interface BookmarkGridProps {
  bookmarks: Bookmark[];
}

export default function BookmarkGrid({ bookmarks }: BookmarkGridProps) {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const isRevealMode = useAppStore((state) => state.isRevealMode);
  const isEditMode = useAppStore((state) => state.isEditMode);
  const toggleEditMode = useAppStore((state) => state.toggleEditMode);
  const totalHidden = useAppStore((state) => 
    state.bookmarks.filter((b) => b.hidden).length
  );

  // Search filter
  const filteredBookmarks = searchQuery
    ? bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bookmarks;

  // Sort by order
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => a.order - b.order);

  if (sortedBookmarks.length === 0 && !searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="text-5xl mb-4">🚀</div>
        <p className="text-base font-medium">开始添加书签</p>
        <p className="text-xs mt-1">点击右上角编辑按钮添加</p>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Actions */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            const event = new CustomEvent('navpal:reveal-request');
            window.dispatchEvent(event);
          }}
          className="quick-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl"
        >
          <Eye className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-semibold text-gray-700">全量模式</span>
        </button>
        <button
          onClick={toggleEditMode}
          className={`quick-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${
            isEditMode ? 'primary' : ''
          }`}
        >
          {isEditMode ? (
            <>
              <span className="text-sm font-semibold">完成</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              <span className="text-sm font-semibold">编辑</span>
            </>
          )}
        </button>
      </div>

      {/* Hidden Count Badge */}
      {totalHidden > 0 && !isRevealMode && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
          <EyeOff className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-medium text-amber-700">
            {totalHidden} 个隐藏书签
          </span>
        </div>
      )}

      {/* Bookmark Grid */}
      {sortedBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">未找到匹配的书签</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {sortedBookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      )}
    </div>
  );
}
