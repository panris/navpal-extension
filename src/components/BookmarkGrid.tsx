import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Eye, Edit3, Copy, ExternalLink, ChevronRight, Trash2, EyeOff, ArrowLeft, UserX } from 'lucide-react';
import { useCurrentLang, getText } from '@/utils/i18n';
import type { LangPref } from '@/components/BookmarkCard';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

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
  const lang = useCurrentLang();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    bookmarkId: string;
    x: number;
    y: number;
  } | null>(null);
  const [showBatchBar, setShowBatchBar] = useState(false);
  const [batchActionMenu, setBatchActionMenu] = useState<string | null>(null);

  const openBookmark = useAppStore((s) => s.openBookmark);
  const moveBookmark = useAppStore((s) => s.moveBookmark);
  const deleteBookmarkGlobally = useAppStore((s) => s.deleteBookmarkGlobally);
  const hideBookmarkGlobally = useAppStore((s) => s.hideBookmarkGlobally);
  const deleteBookmarkFromGroup = useAppStore((s) => s.deleteBookmarkFromGroup);
  const groups = useAppStore((s) => s.groups);
  const activeGroupId = useAppStore((s) => s.activeGroupId);

  // ── Compute filtered/sorted bookmarks first (before hook) ────────
  const searchQuery = useAppStore((s) => s.searchQuery);
  const isRevealMode = useAppStore((s) => s.isRevealMode);
  const editMode = useAppStore((s) => s.editMode);
  const setEditMode = useAppStore((s) => s.setEditMode);
  const bookmarksState = useAppStore((s) => s.bookmarks);
  const reorderBookmarks = useAppStore((s) => s.reorderBookmarks);

  const filteredBookmarks = bookmarks.filter((b) => {
    if (!isBookmarkVisible(b.region, lang)) return false;
    if (editMode === 'group' && activeGroupId) {
      if (b.groupId !== activeGroupId) return false;
    }
    if (editMode === 'global') {
      if (b.deletedAt === null || b.deletedAt === undefined) return true;
      if (isRevealMode) return true;
      return false;
    }
    if (!isBookmarkVisibleInGroup(b, b.groupId, isRevealMode)) return false;
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

  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => a.order - b.order);
  const bookmarkIds = sortedBookmarks.map((b) => b.id);

  // ── Keyboard navigation ─────────────────────────────────────────
  const COLUMNS = 3;

  const { selectedIndex, containerRef } = useKeyboardNavigation({
    columns: COLUMNS,
    totalItems: sortedBookmarks.length,
    enabled: editMode === 'none' && !searchQuery,
    onEnter: (index) => {
      const bookmark = sortedBookmarks[index];
      if (bookmark) openBookmark(bookmark.id);
    },
  });

  // Batch selection: Space key toggles the focused bookmark
  const handleSpaceKey = useCallback(
    (index: number) => {
      const bookmark = sortedBookmarks[index];
      if (!bookmark) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(bookmark.id)) {
          next.delete(bookmark.id);
        } else {
          next.add(bookmark.id);
        }
        return next;
      });
    },
    [sortedBookmarks]
  );

  // Sync Space handler into keyboard nav hook
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === ' ' && !e.ctrlKey && !e.metaKey && editMode === 'none' && !searchQuery) {
        e.preventDefault();
        if (selectedIndex >= 0) handleSpaceKey(selectedIndex);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIndex, handleSpaceKey, editMode, searchQuery]);

  // Show/hide batch bar based on selection
  useEffect(() => {
    setShowBatchBar(selectedIds.size > 0);
  }, [selectedIds]);

  // Close context menu on outside click
  useEffect(() => {
    const handler = () => setContextMenu(null);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Batch actions
  const handleBatchDelete = () => {
    const { deleteBookmarkGlobally } = useAppStore.getState();
    const ids = Array.from(selectedIds);
    ids.forEach((id) => deleteBookmarkGlobally(id));
    setSelectedIds(new Set());
    setBatchActionMenu(null);
  };

  const handleBatchHide = () => {
    const { hideBookmarkGlobally } = useAppStore.getState();
    const ids = Array.from(selectedIds);
    ids.forEach((id) => hideBookmarkGlobally(id));
    setSelectedIds(new Set());
    setBatchActionMenu(null);
  };

  const handleBatchMove = (targetGroupId: string) => {
    const { moveBookmark } = useAppStore.getState();
    const ids = Array.from(selectedIds);
    ids.forEach((id) => moveBookmark(id, targetGroupId));
    setSelectedIds(new Set());
    setBatchActionMenu(null);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleContextMenu = (e: React.MouseEvent, bookmarkId: string) => {
    e.preventDefault();
    setContextMenu({ bookmarkId, x: e.clientX, y: e.clientY });
  };

  // Context menu actions
  const handleContextCopyUrl = () => {
    if (!contextMenu) return;
    const bookmark = bookmarksState.find((b) => b.id === contextMenu.bookmarkId);
    if (bookmark) navigator.clipboard.writeText(bookmark.url);
    setContextMenu(null);
  };

  const handleContextOpenNewTab = () => {
    if (!contextMenu) return;
    const bookmark = bookmarksState.find((b) => b.id === contextMenu.bookmarkId);
    if (bookmark) window.open(bookmark.url, '_blank');
    setContextMenu(null);
  };

  const handleContextMoveTo = (targetGroupId: string) => {
    if (!contextMenu) return;
    moveBookmark(contextMenu.bookmarkId, targetGroupId);
    setContextMenu(null);
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    deleteBookmarkGlobally(contextMenu.bookmarkId);
    setContextMenu(null);
  };

  const handleContextHide = () => {
    if (!contextMenu) return;
    hideBookmarkGlobally(contextMenu.bookmarkId);
    setContextMenu(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Get current group name
  const currentGroupName = activeGroupId
    ? groups.find((g) => g.id === activeGroupId)?.name || ''
    : '';

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
      {/* Batch Action Bar */}
      {showBatchBar && (
        <div className="mb-3 px-3 py-2 bg-violet-50 border border-violet-200 rounded-xl flex items-center gap-2">
          <span className="text-sm font-semibold text-violet-700">
            {selectedIds.size} {lang === 'zh' ? '已选中' : 'selected'}
          </span>
          <div className="ml-auto flex gap-1.5">
            <button
              onClick={() => setBatchActionMenu(batchActionMenu ? null : 'move')}
              className="px-3 py-1 text-xs font-semibold bg-white text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50"
            >
              {lang === 'zh' ? '移动到' : 'Move to'}
            </button>
            <button
              onClick={handleBatchHide}
              className="px-3 py-1 text-xs font-semibold bg-white text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50"
            >
              {lang === 'zh' ? '隐藏' : 'Hide'}
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1 text-xs font-semibold bg-white text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
            >
              {lang === 'zh' ? '删除' : 'Delete'}
            </button>
            <button
              onClick={handleClearSelection}
              className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {/* Move-to submenu */}
          {batchActionMenu === 'move' && (
            <div className="absolute right-0 mt-2 mr-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
              {groups
                .filter((g) => g.id !== activeGroupId)
                .map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleBatchMove(g.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span>{g.icon || '📁'}</span>
                    <span className="truncate">{g.name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Remove Bar */}
      <div className="mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">
            {lang === 'zh' ? '快速移除' : 'Quick Remove'}
          </span>
          <div className="ml-auto flex gap-1.5">
            {/* Remove from group */}
            <button
              onClick={() => {
                selectedIds.forEach((id) => {
                  const bookmark = bookmarksState.find((b) => b.id === id);
                  if (bookmark && activeGroupId) {
                    deleteBookmarkFromGroup(id, activeGroupId);
                  }
                });
                setSelectedIds(new Set());
              }}
              className="px-3 py-1 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
              title={lang === 'zh' ? '移出当前分组' : 'Remove from current group'}
            >
              <ArrowLeft className="w-3 h-3" />
              {lang === 'zh' ? '移出分组' : 'From Group'}
            </button>
            {/* Remove from all groups */}
            <button
              onClick={() => {
                selectedIds.forEach((id) => hideBookmarkGlobally(id));
                setSelectedIds(new Set());
              }}
              className="px-3 py-1 text-xs font-medium bg-white text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1"
              title={lang === 'zh' ? '从所有分组移除（隐藏）' : 'Remove from all groups (hide)'}
            >
              <EyeOff className="w-3 h-3" />
              {lang === 'zh' ? '全部隐藏' : 'Hide All'}
            </button>
            {/* Delete completely */}
            <button
              onClick={() => {
                selectedIds.forEach((id) => deleteBookmarkGlobally(id));
                setSelectedIds(new Set());
              }}
              className="px-3 py-1 text-xs font-medium bg-white text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
              title={lang === 'zh' ? '彻底删除' : 'Delete permanently'}
            >
              <Trash2 className="w-3 h-3" />
              {lang === 'zh' ? '彻底删除' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions - Hidden for release */}
      {/* <div className="flex gap-2 mb-4">
        ...revealAll & globalEdit buttons...
      </div> */}

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
            <div
              ref={containerRef}
              className={`grid grid-cols-3 gap-3 ${isDragging ? 'select-none' : ''}`}
            >
              {sortedBookmarks.map((bookmark, index) => (
                <SortableBookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  groupId={activeGroupId || bookmark.groupId}
                  isDragging={isDragging}
                  isKeyboardSelected={selectedIndex === index}
                  isSelected={selectedIds.has(bookmark.id)}
                  dataCardIndex={index}
                  dataCardId={bookmark.id}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleContextCopyUrl}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4 text-violet-500" />
            {getText('copyUrl', lang)}
          </button>
          <button
            onClick={handleContextOpenNewTab}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-blue-500" />
            {getText('openInNewTab', lang)}
          </button>
          <div className="h-px bg-gray-100 my-1.5" />
          <div className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {getText('moveTo', lang)}
          </div>
          {groups
            .filter((g) => g.id !== (activeGroupId || bookmarksState.find((b) => b.id === contextMenu.bookmarkId)?.groupId))
            .map((g) => (
              <button
                key={g.id}
                onClick={() => handleContextMoveTo(g.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>{g.icon || '📁'}</span>
                <span className="truncate">{g.name}</span>
              </button>
            ))}
          <div className="h-px bg-gray-100 my-1.5" />
          <button
            onClick={handleContextHide}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <EyeOff className="w-4 h-4" />
            {getText('hideBookmark', lang)}
          </button>
          <button
            onClick={handleContextDelete}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {getText('deleteAction', lang)}
          </button>
        </div>
      )}
    </div>
  );
}
