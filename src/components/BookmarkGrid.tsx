import { useState, useEffect } from 'react';
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
import { useAppStore, isBookmarkVisibleInGroup, subscribeLang, getEffectiveLang } from '@/stores/appStore';
import SortableBookmarkCard from './SortableBookmarkCard';
import { Eye, Edit3 } from 'lucide-react';
import { useCurrentLang, getText } from '@/utils/i18n';
import type { LangPref } from '@/components/BookmarkCard';

// Get current effective language
function useCurrentLang(): 'zh' | 'en' {
  const [lang, setLang] = useState<'zh' | 'en'>(() => {
    const pref = useAppStore.getState().langPref;
    return getEffectiveLang(pref as LangPref);
  });

  useEffect(() => {
    const unsubscribe = subscribeLang((newLang) => {
      setLang(newLang);
    });
    return unsubscribe;
  }, []);

  return lang;
}

// Check if bookmark should be visible based on language
function isBookmarkVisible(region: 'CN' | 'Global' | null, lang: 'zh' | 'en'): boolean {
  if (region === 'CN' && lang === 'en') return false;
  return true;
}

// Empty state with illustration
function EmptyState({ lang, onAdd, mode }: { lang: 'zh' | 'en'; onAdd: () => void; mode: 'none' | 'group' | 'global' }) {
  const labels = {
    none: {
      zh: { title: '还没有书签', desc: '按 E 键添加书签', button: '添加第一个书签' },
      en: { title: 'No bookmarks yet', desc: 'Press E to add bookmarks', button: 'Add First Bookmark' },
    },
    group: {
      zh: { title: '该分组暂无书签', desc: '按 E 键添加书签', button: '添加书签' },
      en: { title: 'No bookmarks in this group', desc: 'Press E to add bookmarks', button: 'Add Bookmark' },
    },
    global: {
      zh: { title: '暂无书签', desc: '按 E 键添加书签', button: '添加书签' },
      en: { title: 'No bookmarks yet', desc: 'Press E to add bookmarks', button: 'Add Bookmark' },
    },
  };
  const l = labels[mode][lang];

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
      </div>
      <p className="text-base font-medium text-gray-500 mb-1">{l.title}</p>
      <p className="text-xs text-gray-400 mb-6">{l.desc}</p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl hover:shadow-lg transition-all"
      >
        {l.button}
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
  const editMode = useAppStore((s) => s.editMode);
  const setEditMode = useAppStore((s) => s.setEditMode);
  const activeGroupId = useAppStore((s) => s.activeGroupId);
  const bookmarksState = useAppStore((s) => s.bookmarks);
  const reorderBookmarks = useAppStore((s) => s.reorderBookmarks);
  const groups = useAppStore((s) => s.groups);

  const lang = useCurrentLang();

  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Get current group name
  const currentGroupName = activeGroupId
    ? groups.find((g) => g.id === activeGroupId)?.name || ''
    : '';

  // Filter bookmarks based on mode and language
  const filteredBookmarks = bookmarks.filter((b) => {
    // Language filter
    if (!isBookmarkVisible(b.region, lang)) return false;

    // In group edit mode, only show bookmarks from current group
    if (editMode === 'group' && activeGroupId) {
      if (b.groupId !== activeGroupId) return false;
    }

    // In global edit mode, show all bookmarks (including deleted ones)
    if (editMode === 'global') {
      if (b.deletedAt === null || b.deletedAt === undefined) return true;
      if (isRevealMode) return true;
      return false;
    }

    // Normal mode: check visibility
    if (!isBookmarkVisibleInGroup(b, b.groupId, isRevealMode)) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(query);
      const matchUrl = b.url.toLowerCase().includes(query);
      const matchDescZh = b.description?.zh?.toLowerCase().includes(query);
      const matchDescEn = b.description?.en?.toLowerCase().includes(query);
      if (!matchTitle && !matchUrl && !matchDescZh && !matchDescEn) return false;
    }

    return true;
  });

  // Sort by order
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => a.order - b.order);
  const bookmarkIds = sortedBookmarks.map((b) => b.id);

  // Calculate hidden count - ONLY for "All" tab (activeGroupId === null)
  const totalHidden = activeGroupId === null ? bookmarksState.filter((b) => {
    if (b.hidden && !isRevealMode) return true;
    if (b.region === 'CN' && lang === 'en' && !isRevealMode) return true;
    return false;
  }).length : 0;

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const targetGroupId = editMode === 'group' && activeGroupId ? activeGroupId : activeGroupId;

    const oldIndex = bookmarkIds.indexOf(String(active.id));
    const newIndex = bookmarkIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1 || !targetGroupId) return;

    const newOrder = arrayMove(bookmarkIds, oldIndex, newIndex);
    reorderBookmarks(targetGroupId, newOrder);
  };

  const handleRevealRequest = () => {
    const event = new CustomEvent('navpal:reveal-request');
    window.dispatchEvent(event);
  };

  // Edit mode handlers
  const handleExitEditMode = () => {
    setEditMode('none');
  };

  const handleEnterGroupEdit = () => {
    if (activeGroupId) {
      setEditMode('group');
    }
  };

  const handleEnterGlobalEdit = () => {
    setEditMode('global');
  };

  // Check if group edit is available (needs active group)
  const canEnterGroupEdit = activeGroupId !== null;
  const isInGroupEdit = editMode === 'group';
  const isInGlobalEdit = editMode === 'global';

  return (
    <div>
      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        {/* Reveal Mode Button */}
        <button
          onClick={handleRevealRequest}
          className="quick-btn flex items-center justify-center gap-2 py-3 px-4 rounded-xl"
          style={{ flex: '0 0 auto' }}
        >
          <Eye className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-semibold text-gray-700">{getText('revealModeBtn', lang)}</span>
        </button>

        {/* Edit Mode Button */}
        <button
          onClick={isInGroupEdit || isInGlobalEdit ? handleExitEditMode : canEnterGroupEdit ? handleEnterGroupEdit : handleEnterGlobalEdit}
          className={`quick-btn flex items-center justify-center gap-2 py-3 px-4 rounded-xl ${
            isInGroupEdit || isInGlobalEdit ? 'primary' : ''
          }`}
          style={{ flex: '1 1 auto' }}
        >
          {isInGroupEdit || isInGlobalEdit ? (
            <>
              <span className="text-sm font-semibold">{getText('done', lang)}</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-semibold text-gray-700">{getText('globalEditMode', lang)}</span>
            </>
          )}
        </button>
      </div>

      {/* Edit Mode Indicator */}
      {editMode !== 'none' && (
        <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${editMode === 'group' ? 'text-blue-700' : 'text-violet-700'}`}>
              {editMode === 'group' ? (
                <>{currentGroupName} - {getText('groupEditMode', lang)}</>
              ) : (
                getText('globalEditMode', lang)
              )}
            </span>
          </div>
          <p className={`text-xs mt-1 ${editMode === 'group' ? 'text-blue-600' : 'text-violet-600'}`}>
            {editMode === 'group' ? getText('groupEditHint', lang) : getText('globalEditHint', lang)}
          </p>
        </div>
      )}

      {/* Hidden Count Badge - ONLY for All tab */}
      {totalHidden > 0 && activeGroupId === null && editMode === 'none' && !isRevealMode && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
          <span className="text-xs font-medium text-amber-700">
            {totalHidden} {getText('hiddenBookmarks', lang)}
          </span>
        </div>
      )}

      {/* Content */}
      {sortedBookmarks.length === 0 && !searchQuery ? (
        <EmptyState lang={lang} onAdd={() => {}} mode={editMode} />
      ) : sortedBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">{getText('noMatchFound', lang)}</p>
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
                  groupId={activeGroupId || bookmark.groupId}
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
