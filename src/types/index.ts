// 数据类型定义

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  region: 'CN' | 'Global' | null;
  regionManual: boolean;
  hidden: boolean;  // 全局隐藏状态
  groupId: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  lastAccessedAt?: number; // 最近访问时间戳（ms）
  // 中英文介绍
  description?: {
    en: string;
    zh: string;
  };
  // 软删除时间戳（null = 未删除）
  deletedAt?: number | null;
  // 分组级别的隐藏状态（用于分组编辑时独立隐藏，不影响全局）
  groupHidden?: Record<string, boolean>;  // { [groupId]: true }
  // 分组级别的软删除状态（用于分组编辑时删除，不影响全局）
  groupDeleted?: Record<string, number>;  // { [groupId]: deletedTimestamp }
}

// 分组名称支持中英文
export interface GroupName {
  zh: string;
  en: string;
}

export interface Group {
  id: string;
  name: string;           // 兼容旧数据，直接使用字符串时视为中文
  nameI18n?: GroupName;  // 新格式的中英文名称
  icon?: string;
  color?: string;
  hidden: boolean;                  // 整个分组隐藏
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  // 无痕模式设置
  secretCode: string;              // 暗号，默认 "000"
  triggerZone: 'bottom-left' | 'bottom-right';  // 触发区域
  lockDuration: number;            // 失败锁定时长(ms)

  // 界面设置
  showRegionLabels: boolean;
  compactMode: boolean;

  // 数据设置
  storageQuota: number;            // 100KB 限制

  // Schema 版本（用于数据迁移）
  schemaVersion: number;
}

// 编辑模式类型
export type EditMode = 'none' | 'group' | 'global';

// 全局书签状态（用于全局编辑）
export interface GlobalBookmarkState {
  hidden: boolean;
  deletedAt: number | null;
}

export interface AppState {
  // 数据
  groups: Group[];
  bookmarks: Bookmark[];
  settings: AppSettings;

  // 运行时状态
  isRevealMode: boolean;           // 全量无痕模式
  activeGroupId: string | null;
  searchQuery: string;

  // 编辑模式：none = 无编辑模式, group = 分组编辑, global = 全局编辑
  editMode: EditMode;

  // 动作
  revealMode: () => void;
  exitRevealMode: () => void;
  setActiveGroup: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  // 编辑模式切换
  setEditMode: (mode: EditMode) => void;

  // 分组操作
  addGroup: (name: string, icon?: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  reorderGroups: (groupIds: string[]) => void;

  // 书签操作（分组级别）
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  deleteBookmarkFromGroup: (id: string, groupId: string) => void;  // 从分组删除（仅在分组编辑时）
  reorderBookmarks: (groupId: string, bookmarkIds: string[]) => void;
  moveBookmark: (bookmarkId: string, targetGroupId: string) => void;

  // 全局书签操作（全局编辑模式）
  hideBookmarkGlobally: (id: string) => void;
  showBookmarkGlobally: (id: string) => void;
  deleteBookmarkGlobally: (id: string) => void;  // 全局软删除
  restoreBookmark: (id: string) => void;  // 恢复删除

  // 设置操作
  updateSettings: (updates: Partial<AppSettings>) => void;
}

export type RegionType = 'CN' | 'Global';
