import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Group, Bookmark } from '@/types';
import { generateId, autoDetectRegion } from '@/utils';
import { DEFAULT_GROUPS, DEFAULT_BOOKMARKS, DEFAULT_SETTINGS } from '@/utils/seedData';
import type { LangPref } from '@/components/BookmarkCard';

// Storage quota check
export const STORAGE_QUOTA_KB = 100;
export const STORAGE_WARN_RATIO = 0.9;

function checkStorageQuota(data: object): { allowed: boolean; usedKB: number; percent: number } {
  const usedKB = new Blob([JSON.stringify(data)]).size / 1024;
  const percent = (usedKB / STORAGE_QUOTA_KB) * 100;
  return { allowed: percent < 100, usedKB, percent };
}

// Language preference store (for cross-component subscription)
type LangListener = (lang: 'zh' | 'en') => void;
const langListeners = new Set<LangListener>();
let currentLang: 'zh' | 'en' = 'zh';

export function subscribeLang(listener: LangListener): () => void {
  langListeners.add(listener);
  listener(currentLang);
  return () => langListeners.delete(listener);
}

function notifyLangChange(lang: 'zh' | 'en') {
  currentLang = lang;
  langListeners.forEach((l) => l(lang));
}

export function getEffectiveLang(pref: LangPref): 'zh' | 'en' {
  if (pref === 'auto') {
    return typeof navigator !== 'undefined' && navigator.language.startsWith('zh') ? 'zh' : 'en';
  }
  return pref;
}

export const useAppStore = create<AppState & { langPref: LangPref; setLangPref: (p: LangPref) => void }>()(
  persist(
    (set, get) => ({
      // 初始数据
      groups: DEFAULT_GROUPS,
      bookmarks: DEFAULT_BOOKMARKS,
      settings: DEFAULT_SETTINGS,

      // 运行时状态
      isRevealMode: false,
      isEditMode: false,
      activeGroupId: null,
      searchQuery: '',

      // 语言偏好
      langPref: 'auto',
      setLangPref: (pref) => {
        const lang = getEffectiveLang(pref);
        set({ langPref: pref });
        notifyLangChange(lang);
      },

      // 模式切换
      revealMode: () => set({ isRevealMode: true }),
      exitRevealMode: () => set({ isRevealMode: false }),
      toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
      setActiveGroup: (id) => set({ activeGroupId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      // 分组操作
      addGroup: (name, icon) => {
        const { groups } = get();
        const newGroup: Group = {
          id: generateId(),
          name,
          icon,
          hidden: false,
          order: groups.length,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({ groups: [...groups, newGroup] });
      },

      updateGroup: (id, updates) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: Date.now() } : g
          ),
        }));
      },

      deleteGroup: (id) => {
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
          bookmarks: state.bookmarks.filter((b) => b.groupId !== id),
        }));
      },

      reorderGroups: (groupIds) => {
        set((state) => ({
          groups: groupIds.map((id, index) => {
            const group = state.groups.find((g) => g.id === id)!;
            return { ...group, order: index, updatedAt: Date.now() };
          }),
        }));
      },

      // 书签操作
      addBookmark: (bookmark) => {
        const state = get();
        const groupBookmarks = state.bookmarks.filter((b) => b.groupId === bookmark.groupId);
        const region = bookmark.region ?? autoDetectRegion(bookmark.url);

        const newBookmark: Bookmark = {
          ...bookmark,
          id: generateId(),
          region,
          regionManual: bookmark.regionManual ?? false,
          order: groupBookmarks.length,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const newBookmarks = [...state.bookmarks, newBookmark];
        const quota = checkStorageQuota({ groups: state.groups, bookmarks: newBookmarks, settings: state.settings });
        if (!quota.allowed) {
          console.warn(`[NavPal] Storage quota exceeded: ${quota.usedKB.toFixed(1)}KB / ${STORAGE_QUOTA_KB}KB`);
          alert(`存储空间不足 (${quota.percent.toFixed(0)}%)，请清理部分书签后重试。`);
          return;
        }
        if (quota.percent >= STORAGE_WARN_RATIO * 100) {
          console.warn(`[NavPal] Storage warning: ${quota.percent.toFixed(0)}% used`);
        }
        set({ bookmarks: newBookmarks });
      },

      updateBookmark: (id, updates) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: Date.now() } : b
          ),
        }));
      },

      deleteBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
      },

      reorderBookmarks: (groupId, bookmarkIds) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) => {
            if (b.groupId === groupId) {
              const newOrder = bookmarkIds.indexOf(b.id);
              return newOrder !== -1 ? { ...b, order: newOrder, updatedAt: Date.now() } : b;
            }
            return b;
          }),
        }));
      },

      moveBookmark: (bookmarkId, targetGroupId) => {
        set((state) => {
          const targetGroupBookmarks = state.bookmarks.filter((b) => b.groupId === targetGroupId);
          return {
            bookmarks: state.bookmarks.map((b) =>
              b.id === bookmarkId
                ? { ...b, groupId: targetGroupId, order: targetGroupBookmarks.length, updatedAt: Date.now() }
                : b
            ),
          };
        });
      },

      // 设置操作
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },
    }),
    {
      name: 'navpal-storage',
    }
  )
);

// 选择器
export const useVisibleGroups = () =>
  useAppStore((state) => {
    if (state.isRevealMode) {
      return state.groups;
    }
    return state.groups.filter((g) => !g.hidden);
  });

export const useVisibleBookmarks = () =>
  useAppStore((state) => {
    if (state.isRevealMode) {
      return state.bookmarks;
    }
    return state.bookmarks.filter((b) => !b.hidden);
  });

export const useGroupBookmarks = (groupId: string) =>
  useAppStore((state) =>
    state.bookmarks
      .filter((b) => b.groupId === groupId && (!b.hidden || state.isRevealMode))
      .sort((a, b) => a.order - b.order)
  );
