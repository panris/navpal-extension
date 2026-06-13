import React, { useState, useRef, useCallback, memo } from 'react';
import { Lock, EyeOff, Trash2, RotateCcw } from 'lucide-react';
import { Bookmark } from '@/types';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/utils/cn';
import { getDescription } from '@/utils/descriptions';
import { useCurrentLang, getText } from '@/utils/i18n';

// Color palette for icons - extracted to shared constant
export const ICON_GRADIENTS = [
  { bg: 'from-violet-500 to-purple-600', border: 'border-violet-400', glow: 'shadow-violet-500/30' },
  { bg: 'from-pink-500 to-rose-500', border: 'border-pink-400', glow: 'shadow-pink-500/30' },
  { bg: 'from-cyan-500 to-blue-500', border: 'border-cyan-400', glow: 'shadow-cyan-500/30' },
  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', glow: 'shadow-emerald-500/30' },
  { bg: 'from-orange-500 to-amber-500', border: 'border-orange-400', glow: 'shadow-orange-500/30' },
  { bg: 'from-rose-400 to-pink-500', border: 'border-rose-400', glow: 'shadow-rose-500/30' },
  { bg: 'from-indigo-500 to-violet-500', border: 'border-indigo-400', glow: 'shadow-indigo-500/30' },
  { bg: 'from-fuchsia-500 to-purple-500', border: 'border-fuchsia-400', glow: 'shadow-fuchsia-500/30' },
  { bg: 'from-sky-500 to-cyan-500', border: 'border-sky-400', glow: 'shadow-sky-500/30' },
  { bg: 'from-lime-500 to-emerald-500', border: 'border-lime-400', glow: 'shadow-lime-500/30' },
];

export type LangPref = 'auto' | 'zh' | 'en';

export function getLangPref(): LangPref {
  return useAppStore.getState().langPref;
}

export function setLangPref(pref: LangPref) {
  useAppStore.getState().setLangPref(pref);
}

function getIconStyle(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  return ICON_GRADIENTS[Math.abs(hash) % ICON_GRADIENTS.length];
}

function getIconLetter(url: string, title: string): string {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const secondLevel = parts[parts.length - 2];
      if (secondLevel.length > 1) {
        return secondLevel.charAt(0).toUpperCase();
      }
    }
  } catch {
    // ignore
  }
  return title.charAt(0).toUpperCase();
}

function getIconPattern(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  const patterns = ['●', '■', '▲', '★', '◆'];
  return patterns[Math.abs(hash) % patterns.length];
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  groupId: string;
  forceLang?: 'zh' | 'en';
  isKeyboardSelected?: boolean;
  isSelected?: boolean;
}

function BookmarkCardInner({ bookmark, groupId, forceLang, isKeyboardSelected, isSelected }: BookmarkCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const lang = useCurrentLang();

  // Store state
  const editMode = useAppStore((s) => s.editMode);
  const updateBookmark = useAppStore((s) => s.updateBookmark);
  const hideBookmarkGlobally = useAppStore((s) => s.hideBookmarkGlobally);
  const showBookmarkGlobally = useAppStore((s) => s.showBookmarkGlobally);
  const deleteBookmarkGlobally = useAppStore((s) => s.deleteBookmarkGlobally);
  const deleteBookmarkFromGroup = useAppStore((s) => s.deleteBookmarkFromGroup);
  const restoreBookmark = useAppStore((s) => s.restoreBookmark);
  const openBookmark = useAppStore((s) => s.openBookmark);

  const iconStyle = getIconStyle(bookmark.id);
  const iconLetter = getIconLetter(bookmark.url, bookmark.title);
  const iconPattern = getIconPattern(bookmark.id);
  const description = bookmark.description || getDescription(bookmark.url);

  // Check states
  const isGroupHidden = bookmark.groupHidden?.[groupId];
  const isGroupDeleted = bookmark.groupDeleted?.[groupId];
  const isGloballyHidden = bookmark.hidden;
  const isGloballyDeleted = bookmark.deletedAt !== null && bookmark.deletedAt !== undefined;
  const isDeleted = isGloballyDeleted;
  const isCardHidden = isGloballyHidden || isGroupHidden;

  // Card opacity based on state
  const cardOpacity = isGloballyDeleted || isGroupDeleted ? 'opacity-40' : '';

  const handleClick = useCallback(() => {
    if (editMode !== 'none') return;
    openBookmark(bookmark.id);
  }, [editMode, bookmark.id, openBookmark]);

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

  // Get region label
  const getRegionLabel = () => {
    if (bookmark.region === 'CN') {
      return getText('chinaService', lang);
    }
    return getText('globalService', lang);
  };

  // Action handlers based on edit mode
  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editMode === 'group') {
      updateBookmark(bookmark.id, {
        groupHidden: { ...bookmark.groupHidden, [groupId]: true }
      });
    } else if (editMode === 'global') {
      hideBookmarkGlobally(bookmark.id);
    }
  };

  const handleShow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editMode === 'group') {
      const newGroupHidden = { ...bookmark.groupHidden };
      delete newGroupHidden[groupId];
      updateBookmark(bookmark.id, { groupHidden: newGroupHidden });
    } else if (editMode === 'global') {
      showBookmarkGlobally(bookmark.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editMode === 'group') {
      deleteBookmarkFromGroup(bookmark.id, groupId);
    } else if (editMode === 'global') {
      deleteBookmarkGlobally(bookmark.id);
    }
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editMode === 'global') {
      restoreBookmark(bookmark.id);
    }
  };

  // Edit mode action buttons
  const renderEditActions = () => {
    if (editMode === 'none') return null;

    return (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 context-menu z-10 min-w-[140px]">
        {/* Show/Hide */}
        {isCardHidden || isGloballyDeleted ? (
          <button
            onClick={isGloballyDeleted ? handleRestore : handleShow}
            className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm text-emerald-600"
          >
            <RotateCcw className="w-4 h-4" />
            {isGloballyDeleted ? getText('restore', lang) : getText('showInGroup', lang)}
          </button>
        ) : (
          <button
            onClick={handleHide}
            className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-600"
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
    <div className="relative" onMouseMove={handleMouseMove}>
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
        {/* Status Badges */}
        {(isGloballyDeleted || isGroupDeleted) && (
          <div className="absolute top-1 right-1 z-10">
            <span className="px-1.5 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded">
              {getText('deletedBadge', lang)}
            </span>
          </div>
        )}
        {isGloballyHidden && !isGloballyDeleted && (
          <div className="absolute top-1 right-1 z-10">
            <Lock className="w-3 h-3 text-gray-400" />
          </div>
        )}
        {isGroupHidden && !isGloballyHidden && !isGroupDeleted && (
          <div className="absolute top-1 right-1 z-10">
            <EyeOff className="w-3 h-3 text-amber-400" />
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
              className={cn(
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                bookmark.region === 'CN' ? 'bg-red-500' : 'bg-blue-500'
              )}
            />
          </div>
        </div>

        {/* Title */}
        <span className="text-xs font-semibold text-gray-900 text-center truncate w-full mb-0.5">
          {bookmark.title}
        </span>

        {/* Domain Subtle */}
        <span className="text-[10px] text-gray-400 truncate max-w-full px-1">
          {getDomain(bookmark.url)}
        </span>
      </button>

      {/* Edit Actions */}
      {editMode !== 'none' && !isDeleted && renderEditActions()}

      {/* Tooltip (only in non-edit mode) */}
      {showTooltip && description && editMode === 'none' && (
        <div
          ref={tooltipRef}
          className="tooltip-dark fixed z-50 p-4 max-w-[260px] pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="text-base font-bold text-white mb-1">
            {bookmark.title}
          </div>
          <div className="text-xs text-gray-400 mb-3 break-all">
            {getDomain(bookmark.url)}
          </div>
          <div className="h-px bg-gray-700/30 my-3" />
          {lang === 'zh' && description.zh && (
            <div className="text-sm text-white leading-relaxed border-l-2 border-emerald-500 pl-3">
              {description.zh}
            </div>
          )}
          {lang === 'en' && description.en && (
            <div className="text-xs text-gray-300 leading-relaxed border-l-2 border-blue-500 pl-3">
              {description.en}
            </div>
          )}
          <div className={cn(
            'inline-flex items-center gap-2 mt-3 px-2.5 py-1.5 text-xs font-semibold rounded-lg',
            bookmark.region === 'CN'
              ? 'bg-red-500/20 text-red-300'
              : 'bg-blue-500/20 text-blue-300'
          )}>
            <span>{bookmark.region === 'CN' ? getText('regionCN', lang) : getText('regionGlobal', lang)}</span>
            <span>{getRegionLabel()}</span>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-[#0f172a]" />
          </div>
        </div>
      )}
    </div>
  );
}

// Stable reference via memo
const BookmarkCard = memo(BookmarkCardInner, (prev, next) => {
  return prev.bookmark.id === next.bookmark.id &&
    prev.bookmark.title === next.bookmark.title &&
    prev.bookmark.url === next.bookmark.url &&
    prev.groupId === next.groupId &&
    prev.isSelected === next.isSelected;
});

export default BookmarkCard;
