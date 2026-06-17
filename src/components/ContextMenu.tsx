import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Sparkles, Code, Palette, Briefcase, Wrench, Music, Gamepad2 } from 'lucide-react';
import { Bookmark } from '@/types';
import { useAppStore, getGroupDisplayName } from '@/stores/appStore';
import { useCurrentLang, getText } from '@/utils/i18n';

function getGroupIcon(icon: string | undefined): React.ReactNode {
  switch (icon) {
    case 'sparkles': return <Sparkles size={14} />;
    case 'code': return <Code size={14} />;
    case 'palette': return <Palette size={14} />;
    case 'briefcase': return <Briefcase size={14} />;
    case 'wrench': return <Wrench size={14} />;
    case 'music': return <Music size={14} />;
    case 'gamepad-2': return <Gamepad2 size={14} />;
    default: return '📁';
  }
}

interface ContextMenuProps {
  bookmark: Bookmark;
  x: number;
  y: number;
  onClose: () => void;
}

function ContextMenuInner({ bookmark, x, y, onClose }: ContextMenuProps) {
  const lang = useCurrentLang();
  const hideBookmarkGlobally = useAppStore((s) => s.hideBookmarkGlobally);
  const showBookmarkGlobally = useAppStore((s) => s.showBookmarkGlobally);
  const deleteBookmarkGlobally = useAppStore((s) => s.deleteBookmarkGlobally);
  const restoreBookmark = useAppStore((s) => s.restoreBookmark);
  const groups = useAppStore((s) => s.groups);
  const moveBookmark = useAppStore((s) => s.moveBookmark);

  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let px = x;
    let py = y;

    if (px + rect.width > vw - 8) px = vw - rect.width - 8;
    if (py + rect.height > vh - 8) py = vh - rect.height - 8;
    if (px < 8) px = 8;
    if (py < 8) py = 8;

    setPosition({ x: px, y: py });
  }, [x, y]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(bookmark.url).catch(() => {});
    onClose();
  }, [bookmark.url, onClose]);

  const handleOpenNewTab = useCallback(() => {
    window.open(bookmark.url, '_blank');
    onClose();
  }, [bookmark.url, onClose]);

  const handleMoveToGroup = useCallback(
    (targetGroupId: string) => {
      if (targetGroupId !== bookmark.groupId) {
        moveBookmark(bookmark.id, targetGroupId);
      }
      onClose();
    },
    [bookmark.id, bookmark.groupId, moveBookmark, onClose]
  );

  const handleHide = useCallback(() => {
    hideBookmarkGlobally(bookmark.id);
    onClose();
  }, [bookmark.id, hideBookmarkGlobally, onClose]);

  const handleShow = useCallback(() => {
    showBookmarkGlobally(bookmark.id);
    onClose();
  }, [bookmark.id, showBookmarkGlobally, onClose]);

  const handleDelete = useCallback(() => {
    deleteBookmarkGlobally(bookmark.id);
    onClose();
  }, [bookmark.id, deleteBookmarkGlobally, onClose]);

  const handleRestore = useCallback(() => {
    restoreBookmark(bookmark.id);
    onClose();
  }, [bookmark.id, restoreBookmark, onClose]);

  const isDeleted = bookmark.deletedAt != null;
  const isHidden = bookmark.hidden;

  // Available groups for move (exclude current group)
  const moveableGroups = groups.filter((g) => g.id !== bookmark.groupId);

  return (
    <div
      ref={menuRef}
      className="context-menu fixed z-[9999] min-w-[180px]"
      style={{ left: position.x, top: position.y }}
    >
      {/* Open in new tab */}
      <button
        onClick={handleOpenNewTab}
        className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        {getText('openInNewTabShort', lang)}
      </button>

      {/* Copy link */}
      <button
        onClick={handleCopyLink}
        className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {getText('copyLink', lang)}
      </button>

      <div className="h-px bg-gray-200 my-1" />

      {/* Move to group (with submenu) */}
      {moveableGroups.length > 0 && (
        <div className="relative">
          <button
            onMouseEnter={() => setShowMoveSubmenu(true)}
            onMouseLeave={() => setShowMoveSubmenu(false)}
            className="context-menu-item flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-gray-700"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {getText('moveToGroup', lang)}
            </span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Submenu */}
          {showMoveSubmenu && (
            <div
              className="context-menu absolute left-full top-0 ml-1 min-w-[160px]"
              onMouseEnter={() => setShowMoveSubmenu(true)}
              onMouseLeave={() => setShowMoveSubmenu(false)}
            >
              {moveableGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleMoveToGroup(group.id)}
                  className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700"
                >
                  {group.icon && <span>{getGroupIcon(group.icon)}</span>}
                  <span>{getGroupDisplayName(group, lang)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="h-px bg-gray-200 my-1" />

      {/* Hide / Show */}
      {!isHidden && !isDeleted ? (
        <button onClick={handleHide} className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          {getText('hide', lang)}
        </button>
      ) : isDeleted ? (
        <button onClick={handleRestore} className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm text-emerald-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {getText('restore', lang)}
        </button>
      ) : (
        <button onClick={handleShow} className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {getText('show', lang)}
        </button>
      )}

      {/* Delete */}
      {!isDeleted && (
        <button onClick={handleDelete} className="context-menu-item danger flex items-center gap-2 w-full px-3 py-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {getText('deleteAction', lang)}
        </button>
      )}
    </div>
  );
}

export const ContextMenu = memo(ContextMenuInner, (prev, next) =>
  prev.bookmark.id === next.bookmark.id && prev.x === next.x && prev.y === next.y
);
