// i18n 翻译系统

export type Lang = 'zh' | 'en';

// UI 文本翻译
export const i18n = {
  // 品牌
  brand: { zh: '伴航', en: 'NavPal' },
  brandSubtitle: { zh: '快捷导航工作台', en: 'Quick Navigation Hub' },

  // 搜索
  searchPlaceholder: { zh: '搜索书签...', en: 'Search bookmarks...' },

  // 分组标签
  allTab: { zh: '全部', en: 'All' },
  editMode: { zh: '编辑中', en: 'Editing' },

  // 书签数量
  bookmarks: { zh: '个书签', en: 'bookmarks' },
  hidden: { zh: '隐藏', en: 'hidden' },

  // 地区标签
  regionCN: { zh: '中国服务', en: 'China Service' },
  regionGlobal: { zh: '全球服务', en: 'Global Service' },

  // 全量模式
  revealAll: { zh: '全量', en: 'All' },
  revealMode: { zh: '全量模式', en: 'Reveal Mode' },

  // Header 操作
  minimize: { zh: '最小化', en: 'Minimize' },
  maximize: { zh: '最大化', en: 'Maximize' },
  expand: { zh: '展开', en: 'Expand' },

  // 设置菜单
  window: { zh: '窗口', en: 'Window' },
  groups: { zh: '分组', en: 'Groups' },
  data: { zh: '数据', en: 'Data' },

  // 语言选项
  followSystem: { zh: '跟随系统', en: 'Follow System' },
  chinese: { zh: '中文', en: '中文' },
  english: { zh: 'English', en: 'English' },
  interfaceLang: { zh: '界面语言', en: 'Interface Language' },

  // 窗口控制
  windowControl: { zh: '窗口控制', en: 'Window Control' },

  // 分组管理
  groupManagement: { zh: '分组管理', en: 'Group Management' },
  add: { zh: '新增', en: 'Add' },
  edit: { zh: '编辑', en: 'Edit' },
  delete: { zh: '删除', en: 'Delete' },
  save: { zh: '保存', en: 'Save' },
  cancel: { zh: '取消', en: 'Cancel' },
  groupName: { zh: '分组名称', en: 'Group Name' },
  groupNamePlaceholder: { zh: '分组名称', en: 'Group name' },

  // 数据管理
  dataManagement: { zh: '数据管理', en: 'Data Management' },
  storageUsage: { zh: '存储使用', en: 'Storage Used' },
  exportBackup: { zh: '导出数据备份', en: 'Export Backup' },
  importRestore: { zh: '导入数据恢复', en: 'Import & Restore' },

  // 导入导出提示
  importSuccess: { zh: '导入成功！', en: 'Import successful!' },
  importFailed: { zh: '导入失败', en: 'Import failed' },
  importFailedFormat: { zh: '导入失败，请检查文件格式', en: 'Import failed, check file format' },

  // 删除确认
  deleteGroupConfirm: { zh: '确定删除？', en: 'Confirm delete?' },
  hasBookmarks: { zh: '个书签', en: 'bookmarks' },

  // 编辑模态框
  editBookmark: { zh: '编辑书签', en: 'Edit Bookmark' },
  addBookmark: { zh: '添加书签', en: 'Add Bookmark' },
  title: { zh: '标题', en: 'Title' },
  url: { zh: '网址', en: 'URL' },
  region: { zh: '地区', en: 'Region' },
  introEN: { zh: '英文介绍', en: 'English Intro' },
  introZH: { zh: '中文介绍', en: 'Chinese Intro' },
  introPlaceholderEN: { zh: '输入英文介绍...', en: 'Enter English intro...' },
  introPlaceholderZH: { zh: '输入中文介绍...', en: 'Enter Chinese intro...' },

  // Footer 状态
  status: { zh: '📌', en: '📌' },

  // 空状态
  noBookmarks: { zh: '暂无书签', en: 'No bookmarks' },

  // 快捷键提示
  shortcutTip: { zh: '按 E 编辑 · 按 R 全量 · 按 / 搜索', en: 'Press E to edit · R for reveal · / to search' },
} as const;

export type I18nKey = keyof typeof i18n;

// 获取翻译文本
export function t(key: I18nKey, lang: Lang): string {
  const text = i18n[key];
  if (typeof text === 'string') return text;
  return text[lang] || text.zh;
}

// 通用翻译获取器
export function getText<T extends Record<string, { zh: string; en: string }>>(
  obj: T,
  lang: Lang
): string {
  return obj[lang] || obj.zh;
}
