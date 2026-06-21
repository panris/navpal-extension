import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { useAppStore, isBookmarkVisibleInGroup, getGroupDisplayName } from '@/stores/appStore';
import { CONTEXT_MENU_HEIGHT } from '@/constants';
import SortableBookmarkCard from './SortableBookmarkCard';
import { Copy, ExternalLink, Trash2, EyeOff, ArrowLeft, Plus } from 'lucide-react';
import { useCurrentLang, getText } from '@/utils/i18n';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

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
    <div className="empty-state">
      <div className="empty-state-icon">🔖</div>
      <p className="empty-state-title">{l.title}</p>
      <p className="empty-state-desc">{l.desc}</p>
      <button
        onClick={onAdd}
        className="settings-btn-full primary"
        style={{ padding: '10px 20px' }}
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
    bookmarkGroupId: string | null; // snapshot — avoids recomputing visibleGroups on every bookmark mutation
    activeGroupId: string | null; // snapshot at time of open — prevents race on tab switch
    x: number;
    y: number;
    flipped: boolean;
    maxHeight: number;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [showBatchBar, setShowBatchBar] = useState(false);
  const [batchActionMenu, setBatchActionMenu] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_focusedContextIdx, setFocusedContextIdx] = useState(-1);

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

  const filteredBookmarks = useMemo(() => {
    const result = bookmarks.filter((b) => {
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
    return result;
  }, [bookmarks, lang, editMode, activeGroupId, isRevealMode, searchQuery]);

  const sortedBookmarks = useMemo(() => [...filteredBookmarks].sort((a, b) => a.order - b.order), [filteredBookmarks]);
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
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const menuHeight = CONTEXT_MENU_HEIGHT; // approximate total height of context menu items
    const flipped = e.clientY + menuHeight > window.innerHeight - 8;
    const availableBelow = flipped ? e.clientY : window.innerHeight - e.clientY;
    const maxHeight = Math.min(menuHeight, availableBelow - 8);
    const bookmarkGroupId = bookmarksState.find((b) => b.id === bookmarkId)?.groupId ?? null;
    setContextMenu({ bookmarkId, bookmarkGroupId, activeGroupId, x, y: e.clientY, flipped, maxHeight: Math.max(120, maxHeight) });
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

  // Count all menu items (copy, open, move-to groups, hide, delete)
  const visibleGroups = useMemo(() =>
    groups.filter((g) => {
      const excludeId = contextMenu?.activeGroupId ?? contextMenu?.bookmarkGroupId ?? null;
      return g.id !== excludeId;
    }), [groups, contextMenu?.activeGroupId, contextMenu?.bookmarkGroupId]);
  const menuItemCount = useMemo(() => 2 + visibleGroups.length + 2, [visibleGroups.length]); // copy + open + groups + hide + delete

  // Context menu keyboard navigation — useCallback to keep identity stable for useEffect dep
  const handleContextKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!contextMenu) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedContextIdx((i) => Math.min(i + 1, menuItemCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedContextIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setContextMenu(null);
      setFocusedContextIdx(-1);
    }
  }, [contextMenu, menuItemCount]);

  // Context menu keyboard listener
  useEffect(() => {
    const el = contextMenuRef.current;
    if (!el) return;
    const handler = (e: Event) => handleContextKeyDown(e as unknown as React.KeyboardEvent);
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [contextMenu, handleContextKeyDown]);

  // Focus first menu item when context menu opens
  useEffect(() => {
    if (!contextMenu) return;
    const el = contextMenuRef.current;
    if (!el) return;
    const buttons = el.querySelectorAll<HTMLElement>('button');
    if (buttons[0]) buttons[0].focus();
  }, [contextMenu]);

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

    const targetGroupId = activeGroupId;

    const oldIndex = bookmarkIds.indexOf(String(active.id));
    const newIndex = bookmarkIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1 || !targetGroupId) return;

    const newOrder = arrayMove(bookmarkIds, oldIndex, newIndex);
    reorderBookmarks(targetGroupId, newOrder);
  };

  return (
    <div>
      {/* Batch Action Bar */}
      {showBatchBar && (
        <div className="batch-bar">
          <span className="batch-count">
            {selectedIds.size} {getText('selectedCount', lang)}
          </span>
          <div className="batch-actions">
            <button
              onClick={() => setBatchActionMenu(batchActionMenu ? null : 'move')}
              className="batch-btn"
            >
              {getText('moveTo', lang)}
            </button>
            <button
              onClick={handleBatchHide}
              className="batch-btn"
            >
              {getText('hide', lang)}
            </button>
            <button
              onClick={handleBatchDelete}
              className="batch-btn danger"
            >
              {getText('deleteAction', lang)}
            </button>
            <button
              onClick={handleClearSelection}
              className="batch-btn"
              aria-label="Clear selection"
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
                    <span className="truncate">{getGroupDisplayName(g, lang)}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Remove Bar */}
      {editMode === 'none' && !searchQuery && selectedIds.size > 0 && (
        <div className="batch-bar">
          <span className="text-xs text-gray-500 font-medium">
            {getText('quickRemove', lang)}
          </span>
          <div className="batch-actions">
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
              className={`batch-btn ${!activeGroupId ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!activeGroupId}
            >
              <ArrowLeft size={12} className="inline mr-1" />
              {getText('removeFromGroup', lang)}
            </button>
            <button
              onClick={() => {
                selectedIds.forEach((id) => hideBookmarkGlobally(id));
                setSelectedIds(new Set());
              }}
              className="batch-btn"
            >
              <EyeOff size={12} className="inline mr-1" />
              {getText('hideAll', lang)}
            </button>
            <button
              onClick={() => {
                selectedIds.forEach((id) => deleteBookmarkGlobally(id));
                setSelectedIds(new Set());
              }}
              className="batch-btn danger"
            >
              <Trash2 size={12} className="inline mr-1" />
              {getText('permanentlyDelete', lang)}
            </button>
          </div>
        </div>
      )}

      {/* Edit Mode Indicator */}
      {editMode !== 'none' && (
        <div className="edit-mode-banner">
          <div className="flex items-center gap-2">
            <span className="edit-mode-title">
              {editMode === 'group' ? (
                <>{currentGroupName} - {getText('groupEditMode', lang)}</>
              ) : (
                getText('globalEditMode', lang)
              )}
            </span>
          </div>
          <p className="edit-mode-hint">
            {editMode === 'group' ? getText('groupEditHint', lang) : getText('globalEditHint', lang)}
          </p>
        </div>
      )}

      {/* Hidden Count Badge */}
      {totalHidden > 0 && activeGroupId === null && editMode === 'none' && !isRevealMode && (
        <div className="hidden-badge">
          <EyeOff size={12} />
          {totalHidden} {getText('hiddenBookmarks', lang)}
        </div>
      )}

      {/* Content */}
      {sortedBookmarks.length === 0 && !searchQuery ? (
        <EmptyState lang={lang} onAdd={() => setEditMode(activeGroupId ? 'group' : 'global')} mode={editMode} />
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
                  onToggleSelect={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(bookmark.id)) next.delete(bookmark.id);
                      else next.add(bookmark.id);
                      return next;
                    });
                  }}
                />
              ))}
              {/* Add bookmark button — hidden in edit mode since EditModal is already open */}
              {editMode === 'none' && (
              <button
                onClick={() => setEditMode(activeGroupId ? 'group' : 'global')}
                className="bookmark-card flex flex-col items-center p-3 w-full hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-dashed border-violet-200 shadow-sm">
                  <Plus className="w-5 h-5 text-violet-400" />
                </div>
                <span className="mt-2 text-xs font-medium text-violet-400 truncate w-full text-center">
                  {getText('add', lang)}
                </span>
              </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          role="menu"
          aria-label="Bookmark actions"
          style={{
            left: contextMenu.x,
            top: contextMenu.flipped ? undefined : contextMenu.y,
            bottom: contextMenu.flipped ? window.innerHeight - contextMenu.y : undefined,
            maxHeight: contextMenu.maxHeight,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseLeave={() => setFocusedContextIdx(-1)}
        >
          {/* Top actions */}
          <div role="none">
            <button
              role="menuitem"
              onClick={handleContextCopyUrl}
              className="context-menu-item"
            >
              <Copy size={14} className="text-indigo-500" />
              {getText('copyUrl', lang)}
            </button>
            <button
              role="menuitem"
              onClick={handleContextOpenNewTab}
              className="context-menu-item"
            >
              <ExternalLink size={14} className="text-blue-500" />
              {getText('openInNewTab', lang)}
            </button>
          </div>

          <div className="context-menu-divider" />

          {/* Groups */}
          <div className="context-submenu-header" role="menuitem" aria-hidden="true">
            {getText('moveTo', lang)}
          </div>
          <div className="context-group-list" role="none">
            {groups
              .filter((g) => {
                const excludeId = contextMenu.activeGroupId ?? contextMenu.bookmarkGroupId ?? null;
                return g.id !== excludeId;
              })
              .map((g) => (
                <button
                  key={g.id}
                  role="menuitem"
                  onClick={() => handleContextMoveTo(g.id)}
                  className="context-menu-item"
                >
                  <span>{g.icon || '📁'}</span>
                  <span className="truncate">{getGroupDisplayName(g, lang)}</span>
                </button>
              ))}
          </div>

          <div className="context-menu-divider" />

          {/* Bottom actions */}
          <div role="none">
            <button
              role="menuitem"
              onClick={handleContextHide}
              className="context-menu-item"
            >
              <EyeOff size={14} />
              {getText('hideBookmark', lang)}
            </button>
            <button
              role="menuitem"
              onClick={handleContextDelete}
              className="context-menu-item danger"
            >
              <Trash2 size={14} />
              {getText('deleteAction', lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
