import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Group, Bookmark, EditMode } from '@/types';
import { generateId, autoDetectRegion } from '@/utils';
import { DEFAULT_GROUPS, DEFAULT_BOOKMARKS, DEFAULT_SETTINGS } from '@/utils/seedData';
import { STORAGE_QUOTA_KB, STORAGE_WARN_RATIO, CURRENT_SCHEMA_VERSION } from '@/constants';
import type { LangPref } from '@/components/BookmarkCard';

// ─── Storage quota ───────────────────────────────────────────────
function checkStorageQuota(data: object): { allowed: boolean; usedKB: number; percent: number } {
  const usedKB = new Blob([JSON.stringify(data)]).size / 1024;
  const percent = (usedKB / STORAGE_QUOTA_KB) * 100;
  return { allowed: percent < 100, usedKB, percent };
}

// ─── Language event bus ──────────────────────────────────────────
type LangListener = (lang: 'zh' | 'en') => void;
const langListeners = new Set<LangListener>();
let currentLang: 'zh' | 'en' = 'zh';

// ─── Hydration event bus ────────────────────────────────────────
type HydrationListener = () => void;
const hydrationListeners = new Set<HydrationListener>();

export function subscribeHydration(listener: HydrationListener): () => void {
  hydrationListeners.add(listener);
  return () => hydrationListeners.delete(listener);
}

function notifyHydration() {
  hydrationListeners.forEach((l) => l());
}

export function subscribeLang(listener: LangListener): () => void {
  langListeners.add(listener);
  listener(currentLang);
  return () => langListeners.delete(listener);
}

function notifyLangChange(lang: 'zh' | 'en') {
  currentLang = lang;
  langListeners.forEach((l) => l(lang));
}

export { notifyLangChange };

export function getEffectiveLang(pref: LangPref): 'zh' | 'en' {
  if (pref === 'auto') {
    return typeof navigator !== 'undefined' && navigator.language.startsWith('zh') ? 'zh' : 'en';
  }
  return pref;
}

// ─── Data migration ───────────────────────────────────────────────
function migrateData(state: { groups: Group[]; bookmarks: Bookmark[]; settings: { schemaVersion?: number } }): typeof state {
  const version = state.settings?.schemaVersion ?? 0;
  if (version >= CURRENT_SCHEMA_VERSION) return state;

  // v0 → v1: add schemaVersion, lastAccessedAt, groupHidden, groupDeleted, deletedAt
  const migrated = {
    ...state,
    bookmarks: state.bookmarks.map((b) => ({
      ...b,
      lastAccessedAt: b.lastAccessedAt ?? 0,
      groupHidden: b.groupHidden ?? {},
      groupDeleted: b.groupDeleted ?? {},
      deletedAt: b.deletedAt ?? null,
    })),
    settings: { ...DEFAULT_SETTINGS, ...state.settings, schemaVersion: CURRENT_SCHEMA_VERSION },
  };

  console.info(`[NavPal] Data migrated from v${version} → v${CURRENT_SCHEMA_VERSION}`);
  return migrated;
}

// ─── Store ───────────────────────────────────────────────────────
export const useAppStore = create<
  AppState & { langPref: LangPref; setLangPref: (p: LangPref) => void }
>()(
  persist(
    (set, get) => ({
      groups: DEFAULT_GROUPS,
      bookmarks: DEFAULT_BOOKMARKS,
      settings: DEFAULT_SETTINGS,

      isRevealMode: false,
      activeGroupId: null,
      searchQuery: '',
      editMode: 'none',

      langPref: 'auto',
      setLangPref: (pref) => {
        const lang = getEffectiveLang(pref);
        set({ langPref: pref });
        notifyLangChange(lang);
      },

      // 模式切换
      revealMode: () => set({ isRevealMode: true }),
      exitRevealMode: () => set({ isRevealMode: false }),
      setActiveGroup: (id) => set({ activeGroupId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      // 编辑模式切换
      setEditMode: (mode: EditMode) => set({ editMode: mode }),
      toggleEditMode: () => set((state) => ({ editMode: state.editMode === 'none' ? 'group' : 'none' })),

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

      // 书签操作（分组级别 - 新增到某个分组）
      addBookmark: (bookmark) => {
        const state = get();
        const groupBookmarks = state.bookmarks.filter((b) => b.groupId === bookmark.groupId);
        const region = bookmark.region ?? null;  // 新书签默认不区分语言，用户可在编辑时手动设置

        const newBookmark: Bookmark = {
          ...bookmark,
          id: generateId(),
          region,
          regionManual: bookmark.regionManual ?? false,
          order: groupBookmarks.length,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastAccessedAt: 0,
          deletedAt: null,
          groupHidden: {},
          groupDeleted: {},
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
        console.log('[NavPal v022923d] addBookmark:', newBookmark.id, 'groupId:', newBookmark.groupId, 'title:', newBookmark.title, 'total:', newBookmarks.length);
        set({ bookmarks: newBookmarks });
        // Verify: log store state immediately after set
        setTimeout(() => {
          const afterState = get();
          console.log('[NavPal v022923d] after set, store bookmarks:', afterState.bookmarks.length, 'last bookmark:', afterState.bookmarks[afterState.bookmarks.length - 1]?.title);
          // Also check localStorage
          try {
            const stored = localStorage.getItem('navpal-storage');
            if (stored) {
              const parsed = JSON.parse(stored);
              console.log('[NavPal v022923d] localStorage bookmarks:', parsed.state?.bookmarks?.length);
            }
          } catch(e) { console.error('[NavPal v022923d] localStorage check failed', e); }
        }, 100);
      },

      updateBookmark: (id, updates) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: Date.now() } : b
          ),
        }));
      },

      // 从分组删除书签（仅在分组编辑模式时使用，不影响全局数据）
      deleteBookmarkFromGroup: (id, groupId) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id
              ? {
                  ...b,
                  groupDeleted: { ...b.groupDeleted, [groupId]: Date.now() },
                  updatedAt: Date.now(),
                }
              : b
          ),
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

      // 全局隐藏书签（全局编辑模式）
      hideBookmarkGlobally: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, hidden: true, updatedAt: Date.now() } : b
          ),
        }));
      },

      // 全局显示书签（全局编辑模式）
      showBookmarkGlobally: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, hidden: false, updatedAt: Date.now() } : b
          ),
        }));
      },

      // 全局软删除书签（全局编辑模式 - 标记为删除，可恢复）
      deleteBookmarkGlobally: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, deletedAt: Date.now(), updatedAt: Date.now() } : b
          ),
        }));
      },

      // 恢复删除的书签（全局编辑模式）
      restoreBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, deletedAt: null, updatedAt: Date.now() } : b
          ),
        }));
      },

      // 彻底删除书签（不可恢复）
      hardDeleteBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
      },

      // 记录访问时间（最近使用排序用）
      recordAccess: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, lastAccessedAt: Date.now() } : b
          ),
        }));
      },

      // 打开书签（记录访问 + 跳转）
      openBookmark: (id) => {
        const bookmark = get().bookmarks.find((b) => b.id === id);
        if (!bookmark) return;
        get().recordAccess(id);
        window.open(bookmark.url, '_blank');
        window.close();
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
      // 数据迁移入口
      onRehydrateStorage: () => (state) => {
        if (state) {
          const migrated = migrateData(state as unknown as { groups: Group[]; bookmarks: Bookmark[]; settings: { schemaVersion?: number } });
          state.groups = migrated.groups;
          state.bookmarks = migrated.bookmarks;
          state.settings = migrated.settings as AppState['settings'];
        }
        // Notify after hydration completes
        notifyHydration();
      },
    }
  )
);

// ─── Language-aware Selectors ──────────────────────────────────────
export const useVisibleGroups = () =>
  useAppStore((state) => {
    if (state.isRevealMode) return state.groups;
    return state.groups.filter((g) => !g.hidden);
  });

export const useVisibleBookmarks = () =>
  useAppStore((state) => {
    if (state.isRevealMode) return state.bookmarks;
    return state.bookmarks.filter((b) => !b.hidden);
  });

// 获取当前有效语言
function getCurrentLang(): 'zh' | 'en' {
  const pref = useAppStore.getState().langPref;
  return getEffectiveLang(pref);
}

// ─── Helper Functions ──────────────────────────────────────────────

// 判断书签在指定分组中是否可见
export function isBookmarkVisibleInGroup(bookmark: Bookmark, groupId: string, isRevealMode: boolean): boolean {
  // 全局软删除的书签：仅在全量模式可见
  if (bookmark.deletedAt !== null && bookmark.deletedAt !== undefined && !isRevealMode) {
    return false;
  }

  // 分组级别的删除状态
  const groupDeletedAt = bookmark.groupDeleted?.[groupId];
  if (groupDeletedAt && !isRevealMode) {
    return false;
  }

  // 分组级别的隐藏状态
  const groupHidden = bookmark.groupHidden?.[groupId];
  if (groupHidden && !isRevealMode) {
    return false;
  }

  // 全局隐藏状态
  if (bookmark.hidden && !isRevealMode) {
    return false;
  }

  return true;
}

// 语言感知的书签 Selector - 根据当前语言过滤分组和书签
export const useLangGroupBookmarks = (groupId: string | null) =>
  useAppStore((state) => {
    const lang = getCurrentLang();
    const isRevealMode = state.isRevealMode;

    // 过滤分组
    const visibleGroups = state.groups.filter((g) => !g.hidden || isRevealMode);

    // 过滤书签
    let filteredBookmarks = state.bookmarks.filter((b) => {
      // 如果指定了分组，只显示该分组的书签
      if (groupId !== null && b.groupId !== groupId) return false;

      // 检查可见性
      if (!isBookmarkVisibleInGroup(b, b.groupId, isRevealMode)) return false;

      // 语言过滤：Global 服务总是显示，CN 服务根据语言判断
      if (b.region === 'CN' && lang === 'en') {
        return false;
      }

      return true;
    });

    // 按 order 排序
    filteredBookmarks = filteredBookmarks.sort((a, b) => a.order - b.order);

    return { groups: visibleGroups, bookmarks: filteredBookmarks };
  });

// ─── Group Name Helper ────────────────────────────────────────────
// 根据语言获取分组显示名称
export function getGroupDisplayName(group: { name: string; nameI18n?: { zh: string; en: string } }, lang: 'zh' | 'en'): string {
  if (group.nameI18n) {
    return lang === 'en' ? group.nameI18n.en : group.nameI18n.zh;
  }
  return group.name;
}
