import React, { useState, useRef, useCallback, useMemo, memo } from 'react';
import { Lock, EyeOff, Trash2, RotateCcw } from 'lucide-react';
import type { Bookmark, EditMode } from '@/types';
import type { LangPref } from '@/types';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/utils/cn';
import { getDescription } from '@/utils/descriptions';
import { getIconStyle, getIconPattern, getIconLetter, getDomain } from '@/utils/iconHash';
import { useCurrentLang, getText } from '@/utils/i18n';

export function getLangPref(): LangPref {
  return useAppStore.getState().langPref;
}

export function setLangPref(pref: LangPref) {
  useAppStore.getState().setLangPref(pref);
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  groupId: string;
  editMode: EditMode;
  isKeyboardSelected?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

function BookmarkCardInner({ bookmark, groupId, editMode, isKeyboardSelected, isSelected, onToggleSelect }: BookmarkCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const lang = useCurrentLang();

  // Store actions (editMode is now passed as prop from parent)
  const updateBookmark = useAppStore((s) => s.updateBookmark);
  const hideBookmarkGlobally = useAppStore((s) => s.hideBookmarkGlobally);
  const showBookmarkGlobally = useAppStore((s) => s.showBookmarkGlobally);
  const deleteBookmarkGlobally = useAppStore((s) => s.deleteBookmarkGlobally);
  const deleteBookmarkFromGroup = useAppStore((s) => s.deleteBookmarkFromGroup);
  const restoreBookmark = useAppStore((s) => s.restoreBookmark);
  const openBookmark = useAppStore((s) => s.openBookmark);

  // Memoized: hash/id-based computations run once per bookmark identity change
  const iconStyle = useMemo(() => getIconStyle(bookmark.id), [bookmark.id]);
  const iconPattern = useMemo(() => getIconPattern(bookmark.id), [bookmark.id]);
  const iconLetter = useMemo(() => getIconLetter(bookmark.url, bookmark.title), [bookmark.url, bookmark.title]);
  const description = useMemo(
    () => bookmark.description || getDescription(bookmark.url) || { zh: bookmark.title, en: bookmark.title },
    [bookmark.description, bookmark.url, bookmark.title]
  );

  // Check states
  const isGroupHidden = bookmark.groupHidden?.[groupId];
  const isGroupDeleted = bookmark.groupDeleted?.[groupId];
  const isGloballyHidden = bookmark.hidden;
  const isGloballyDeleted = bookmark.deletedAt !== null && bookmark.deletedAt !== undefined;
  const isDeleted = isGloballyDeleted;
  const isCardHidden = isGloballyHidden || isGroupHidden;

  // Card opacity based on state
  const cardOpacity = isGloballyDeleted || isGroupDeleted ? 'opacity-40' : '';

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (editMode !== 'none') return;
    // Ctrl/Cmd + click to toggle selection
    if ((e.ctrlKey || e.metaKey) && onToggleSelect) {
      e.preventDefault();
      onToggleSelect();
      return;
    }
    openBookmark(bookmark.id);
  }, [editMode, bookmark.id, openBookmark, onToggleSelect]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (description && editMode === 'none') {
      setShowTooltip(true);
    }
  }, [description, editMode]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowTooltip(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (showTooltip && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      let x = e.clientX - rect.width / 2;
      let y = e.clientY - rect.height - 12;

      const padding = 10;
      if (x < padding) x = padding;
      if (x + rect.width > window.innerWidth - padding) {
        x = window.innerWidth - rect.width - padding;
      }
      if (y < padding) {
        y = e.clientY + 20;
      }

      setTooltipPos({ x, y });
    }
  }, [showTooltip]);

  // Keyboard/selection focused state
  const isFocused = (isKeyboardSelected || isSelected) && editMode === 'none';

  // Region label — plain const, no function overhead
  const regionLabel = bookmark.region === 'CN'
    ? getText('chinaService', lang)
    : getText('globalService', lang);

  // Action handlers based on edit mode — stable references for renderEditActions
  const handleHide = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (editMode === 'group') {
      updateBookmark(bookmark.id, {
        groupHidden: { ...bookmark.groupHidden, [groupId]: true }
      });
    } else if (editMode === 'global') {
      hideBookmarkGlobally(bookmark.id);
    }
  }, [editMode, bookmark.id, groupId, bookmark.groupHidden, updateBookmark, hideBookmarkGlobally]);

  const handleShow = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (editMode === 'group') {
      const newGroupHidden = { ...bookmark.groupHidden };
      delete newGroupHidden[groupId];
      updateBookmark(bookmark.id, { groupHidden: newGroupHidden });
    } else if (editMode === 'global') {
      showBookmarkGlobally(bookmark.id);
    }
  }, [editMode, bookmark.id, groupId, bookmark.groupHidden, updateBookmark, showBookmarkGlobally]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (editMode === 'group') {
      deleteBookmarkFromGroup(bookmark.id, groupId);
    } else if (editMode === 'global') {
      deleteBookmarkGlobally(bookmark.id);
    }
  }, [editMode, bookmark.id, groupId, deleteBookmarkFromGroup, deleteBookmarkGlobally]);

  const handleRestore = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (editMode === 'global') {
      restoreBookmark(bookmark.id);
    }
  }, [editMode, bookmark.id, restoreBookmark]);

  // Edit mode action buttons
  const renderEditActions = () => {
    if (editMode === 'none') return null;

    return (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 context-menu z-10 min-w-[140px]">
        {/* Show/Hide */}
        {isCardHidden || isGloballyDeleted ? (
          <button
            onClick={isGloballyDeleted ? handleRestore : handleShow}
            className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm"
              style={{ color: 'var(--success-color)' }}
          >
            <RotateCcw className="w-4 h-4" />
            {isGloballyDeleted ? getText('restore', lang) : getText('showInGroup', lang)}
          </button>
        ) : (
          <button
            onClick={handleHide}
            className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm"
            style={{ color: 'var(--warning-color)' }}
          >
            {editMode === 'group' ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {editMode === 'group' ? getText('hideFromGroup', lang) : getText('hideAction', lang)}
          </button>
        )}

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="context-menu-item danger flex items-center gap-2 w-full px-3 py-2 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          {editMode === 'group' ? getText('removeFromGroup', lang) : getText('deleteAction', lang)}
        </button>
      </div>
    );
  };

  return (
    <div className="relative group/bookmark" onMouseMove={handleMouseMove}>
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'bookmark-card flex flex-col items-center p-3 w-full relative',
          cardOpacity,
          editMode !== 'none' && 'ring-2 ring-blue-400 ring-offset-1 cursor-pointer',
          editMode === 'none' && !isDeleted && 'hover:scale-105 transition-transform',
          isFocused && 'ring-2 ring-violet-400 ring-offset-2'
        )}
      >
        {/* Selection checkbox — always visible when selected, otherwise on hover */}
        {editMode === 'none' && !isDeleted && (
          <div
            className={cn(
              'absolute top-1 right-1 z-10 transition-opacity',
              isSelected ? 'opacity-100' : 'opacity-0 group-hover/bookmark:opacity-100'
            )}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleSelect?.();
            }}
          >
            <div className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
              isSelected
                ? 'bg-violet-500 border-violet-500'
                :               'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-400'
            )}>
              {isSelected && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}
        {/* Status Badges */}
        {(isGloballyDeleted || isGroupDeleted) && (
          <div className="absolute top-1 right-1 z-10">
            <span className="px-1.5 py-0.5 text-[8px] font-bold rounded" style={{ background: 'var(--danger-color)', color: 'white' }}>
              {getText('deletedBadge', lang)}
            </span>
          </div>
        )}
        {isGloballyHidden && !isGloballyDeleted && (
          <div className="absolute top-1 right-1 z-10">
            <Lock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
        {isGroupHidden && !isGloballyHidden && !isGroupDeleted && (
          <div className="absolute top-1 right-1 z-10">
            <EyeOff className="w-3 h-3" style={{ color: 'var(--warning-color)' }} />
          </div>
        )}

        {/* Icon Container with Glow Effect */}
        <div className="relative mb-2">
          <div
            className={cn(
              'absolute inset-0 rounded-2xl blur-md opacity-0 transition-opacity duration-300 bg-gradient-to-br',
              iconStyle.bg,
              isHovered && editMode === 'none' && 'opacity-50'
            )}
          />

          <div
            className={cn(
              'relative w-12 h-12 rounded-2xl flex items-center justify-center',
              'bg-gradient-to-br shadow-lg',
              iconStyle.bg,
              iconStyle.border,
              isHovered && editMode === 'none' && 'scale-110 shadow-xl'
            )}
            style={{
              boxShadow: isHovered && editMode === 'none'
                ? `0 8px 24px rgba(0,0,0,0.15)`
                : '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <span
              className="absolute inset-0 flex items-center justify-center text-white/10 text-2xl font-bold select-none pointer-events-none"
              aria-hidden="true"
            >
              {iconPattern}
            </span>

            <span className="text-lg font-bold text-white relative z-10 drop-shadow-md">
              {iconLetter}
            </span>

            {/* Region Indicator */}
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
              style={{
                background: bookmark.region === 'CN' ? 'var(--region-cn)' : 'var(--region-global)',
              }}
            />
          </div>
        </div>

        {/* Title */}
        <span className="text-xs font-semibold text-center truncate w-full mb-0.5" style={{ color: 'var(--text-primary)' }}>
          {bookmark.title}
        </span>

        {/* Domain Subtle */}
        <span className="text-[10px] truncate max-w-full px-1" style={{ color: 'var(--text-muted)' }}>
          {getDomain(bookmark.url)}
        </span>
      </button>

      {/* Edit Actions */}
      {editMode !== 'none' && !isDeleted && renderEditActions()}

      {/* Tooltip (only in non-edit mode) */}
      {showTooltip && description && editMode === 'none' && (
        <div
          ref={tooltipRef}
          className="fixed z-50 p-4 max-w-[260px] pointer-events-none rounded-lg shadow-xl"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {bookmark.title}
          </div>
          <div className="text-xs mb-3 break-all" style={{ color: 'var(--text-muted)' }}>
            {getDomain(bookmark.url)}
          </div>
          <div className="h-px my-3" style={{ background: 'var(--border-color)' }} />
          {lang === 'zh' && description.zh && (
            <div className="text-sm leading-relaxed border-l-2 pl-3" style={{ color: 'var(--text-primary)', borderColor: 'var(--accent-color)' }}>
              {description.zh}
            </div>
          )}
          {lang === 'en' && description.en && (
            <div className="text-sm leading-relaxed border-l-2 pl-3 mt-2" style={{ color: 'var(--text-secondary)', borderColor: 'var(--accent-color)' }}>
              {description.en}
            </div>
          )}
          <div className="flex items-center gap-2 mt-3 px-2.5 py-1.5 text-xs font-semibold rounded-lg" style={{
            background: bookmark.region === 'CN' ? 'var(--region-cn-bg)' : 'var(--region-global-bg)',
            color: bookmark.region === 'CN' ? 'var(--region-cn)' : 'var(--region-global)',
          }}>
            <span>{bookmark.region === 'CN' ? getText('regionCN', lang) : getText('regionGlobal', lang)}</span>
            <span>{regionLabel}</span>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-[var(--bg-primary)]" />
          </div>
        </div>
      )}
    </div>
  );
}

// Stable reference via memo — id is the single source of truth for bookmark identity
const BookmarkCard = memo(BookmarkCardInner, (prev, next) => {
  return prev.bookmark.id === next.bookmark.id &&
    prev.groupId === next.groupId &&
    prev.isSelected === next.isSelected &&
    prev.isKeyboardSelected === next.isKeyboardSelected &&
    prev.editMode === next.editMode;
});

export default BookmarkCard;
