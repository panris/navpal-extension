import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Group, Bookmark } from '@/types';
import { generateId, autoDetectRegion } from '@/utils';
import { DEFAULT_GROUPS, DEFAULT_BOOKMARKS, DEFAULT_SETTINGS } from '@/utils/seedData';

export const useAppStore = create<AppState>()(
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
        const { bookmarks } = get();
        const groupBookmarks = bookmarks.filter((b) => b.groupId === bookmark.groupId);
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
        set({ bookmarks: [...bookmarks, newBookmark] });
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
