import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Bookmark } from '@/types';
import { useAppStore } from '@/stores/appStore';
import SortableBookmarkCard from './SortableBookmarkCard';
import { Eye, EyeOff, Edit3 } from 'lucide-react';

// Skeleton loading state
function BookmarkSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 animate-pulse"
        >
          <div className="w-12 h-12 rounded-2xl bg-gray-700/40 mb-2" />
          <div className="h-3 w-16 rounded bg-gray-700/40 mb-1" />
          <div className="h-2 w-12 rounded bg-gray-700/30" />
        </div>
      ))}
    </div>
  );
}

// Empty state with illustration
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-violet-500/60">
            <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4zm0 35c-8.3 0-15-6.7-15-15S15.7 9 24 9s15 6.7 15 15-6.7 15-15 15zm0-25c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z" fill="currentColor" opacity="0.4"/>
            <circle cx="24" cy="24" r="5" fill="currentColor" opacity="0.6"/>
            <path d="M24 12v4M24 32v4M12 24h4M32 24h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-500/30 flex items-center justify-center">
          <span className="text-xs">🚀</span>
        </div>
      </div>
      <p className="text-base font-medium text-gray-500 mb-1">还没有书签</p>
      <p className="text-xs text-gray-400 mb-6">添加你的第一个书签，开始高效导航</p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl hover:shadow-lg transition-all"
      >
        添加第一个书签
      </button>
    </div>
  );
}

interface BookmarkGridProps {
  bookmarks: Bookmark[];
}

export default function BookmarkGrid({ bookmarks }: BookmarkGridProps) {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const isRevealMode = useAppStore((s) => s.isRevealMode);
  const isEditMode = useAppStore((s) => s.isEditMode);
  const toggleEditMode = useAppStore((s) => s.toggleEditMode);
  const reorderBookmarks = useAppStore((s) => s.reorderBookmarks);
  const activeGroupId = useAppStore((s) => s.activeGroupId);
  const totalHidden = useAppStore((s) =>
    s.bookmarks.filter((b) => b.hidden).length
  );

  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
  const bookmarkIds = sortedBookmarks.map((b) => b.id);

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id || !activeGroupId) return;

    const oldIndex = bookmarkIds.indexOf(String(active.id));
    const newIndex = bookmarkIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(bookmarkIds, oldIndex, newIndex);
    reorderBookmarks(activeGroupId, newOrder);
  };

  const handleRevealRequest = () => {
    const event = new CustomEvent('navpal:reveal-request');
    window.dispatchEvent(event);
  };

  return (
    <div>
      {/* Quick Actions */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleRevealRequest}
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

      {/* Content */}
      {sortedBookmarks.length === 0 && !searchQuery ? (
        <EmptyState onAdd={toggleEditMode} />
      ) : sortedBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">未找到匹配的书签</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={bookmarkIds} strategy={rectSortingStrategy}>
            <div className={`grid grid-cols-3 gap-3 ${isDragging ? 'select-none' : ''}`}>
              {sortedBookmarks.map((bookmark) => (
                <SortableBookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  isDragging={isDragging}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}