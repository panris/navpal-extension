import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Lock } from 'lucide-react';
import { Bookmark } from '@/types';
import { useAppStore, subscribeLang } from '@/stores/appStore';
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

// Re-export for SettingsMenu compatibility
export { subscribeLang };

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
  forceLang?: 'zh' | 'en'; // Optional: force a specific language display
}

function BookmarkCardInner({ bookmark, forceLang }: BookmarkCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Subscribe to language changes - but respect forceLang if set
  const lang = useCurrentLang();

  const isEditMode = useAppStore((s) => s.isEditMode);
  const isRevealMode = useAppStore((s) => s.isRevealMode);
  const updateBookmark = useAppStore((s) => s.updateBookmark);
  const deleteBookmark = useAppStore((s) => s.deleteBookmark);
  const openBookmark = useAppStore((s) => s.openBookmark);

  const iconStyle = getIconStyle(bookmark.id);
  const iconLetter = getIconLetter(bookmark.url, bookmark.title);
  const iconPattern = getIconPattern(bookmark.id);
  const description = bookmark.description || getDescription(bookmark.url);

  const handleClick = useCallback(() => {
    if (isEditMode) return;
    openBookmark(bookmark.id);
  }, [isEditMode, bookmark.id, openBookmark]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (!isEditMode && description) {
      setShowTooltip(true);
    }
  }, [isEditMode, description]);

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

  // 根据语言获取区域标签文本
  const getRegionLabel = () => {
    if (bookmark.region === 'CN') {
      return getText('chinaService', lang);
    }
    return getText('globalService', lang);
  };

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'bookmark-card flex flex-col items-center p-3 w-full relative',
          bookmark.hidden && !isRevealMode && 'hidden-card opacity-40 pointer-events-none',
          isEditMode && 'ring-2 ring-blue-400 ring-offset-1'
        )}
      >
        {/* Lock Indicator */}
        {bookmark.hidden && isRevealMode && (
          <div className="lock-indicator">
            <Lock className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Icon Container with Glow Effect */}
        <div className="relative mb-2">
          <div
            className={cn(
              'absolute inset-0 rounded-2xl blur-md opacity-0 transition-opacity duration-300 bg-gradient-to-br',
              iconStyle.bg,
              isHovered && 'opacity-50'
            )}
          />

          <div
            className={cn(
              'relative w-12 h-12 rounded-2xl flex items-center justify-center',
              'bg-gradient-to-br shadow-lg',
              iconStyle.bg,
              iconStyle.border,
              isHovered && 'scale-110 shadow-xl'
            )}
            style={{
              boxShadow: isHovered
                ? `0 8px 24px var(--tw-shadow-color, rgba(0,0,0,0.15))`
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

      {/* Tooltip */}
      {showTooltip && description && (
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
          {/* 根据语言显示对应介绍 - 只显示当前语言的介绍 */}
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

      {/* Context Menu for Edit Mode */}
      {isEditMode && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 context-menu z-10 min-w-[120px]">
          <button
            onClick={() => updateBookmark(bookmark.id, { hidden: !bookmark.hidden })}
            className="context-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-600"
          >
            <Lock className="w-4 h-4" />
            {bookmark.hidden ? getText('show', lang) : getText('hide', lang)}
          </button>
          <button
            onClick={() => deleteBookmark(bookmark.id)}
            className="context-menu-item danger flex items-center gap-2 w-full px-3 py-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {getText('delete', lang)}
          </button>
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
    prev.bookmark.hidden === next.bookmark.hidden &&
    prev.forceLang === next.forceLang;
});

export default BookmarkCard;
