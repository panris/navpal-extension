// 数据类型定义

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  region: 'CN' | 'Global' | null;
  regionManual: boolean;
  hidden: boolean;
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

export interface AppState {
  // 数据
  groups: Group[];
  bookmarks: Bookmark[];
  settings: AppSettings;

  // 运行时状态
  isRevealMode: boolean;           // 全量无痕模式
  isEditMode: boolean;
  activeGroupId: string | null;
  searchQuery: string;

  // 动作
  revealMode: () => void;
  exitRevealMode: () => void;
  toggleEditMode: () => void;
  setActiveGroup: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  // 分组操作
  addGroup: (name: string, icon?: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  reorderGroups: (groupIds: string[]) => void;

  // 书签操作
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
  reorderBookmarks: (groupId: string, bookmarkIds: string[]) => void;
  moveBookmark: (bookmarkId: string, targetGroupId: string) => void;

  // 设置操作
  updateSettings: (updates: Partial<AppSettings>) => void;
}

export type RegionType = 'CN' | 'Global';
