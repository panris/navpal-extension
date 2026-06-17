// 集中式国际化工具
// 所有 UI 文本在此定义，根据当前语言自动切换

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, subscribeLang, getEffectiveLang } from '@/stores/appStore';
import type { LangPref } from '@/components/BookmarkCard';

// ─── 静态翻译文本 ───────────────────────────────────────────────
const UI_TEXT = {
  // Header
  appName: { zh: '伴航', en: 'NavPal' },
  appTagline: { zh: '快捷导航工作台', en: 'Quick Navigation Hub' },
  searchPlaceholder: { zh: '搜索书签...', en: 'Search bookmarks...' },
  revealMode: { zh: '全量', en: 'All' },
  revealModeLabel: { zh: '全量模式', en: 'All Mode' },

  // Footer
  bookmarks: { zh: '个书签', en: 'bookmarks' },
  hidden: { zh: '隐藏', en: 'hidden' },

  // Group Tabs
  all: { zh: '全部', en: 'All' },
  editing: { zh: '编辑中', en: 'Editing' },
  countSuffix: { zh: '个', en: '' },

  // Settings Menu
  settings: { zh: '设置', en: 'Settings' },
  window: { zh: '窗口', en: 'Window' },
  groups: { zh: '分组', en: 'Groups' },
  data: { zh: '数据', en: 'Data' },
  appearance: { zh: '外观', en: 'Appearance' },
  theme: { zh: '主题', en: 'Theme' },
  expand: { zh: '展开', en: 'Expand' },
  minimize: { zh: '最小化', en: 'Minimize' },
  maximize: { zh: '最大化', en: 'Maximize' },
  interfaceLanguage: { zh: '界面语言', en: 'Interface Language' },
  followSystem: { zh: '跟随系统', en: 'Follow System' },
  windowControls: { zh: '窗口控制', en: 'Window Controls' },
  groupManagement: { zh: '分组管理', en: 'Group Management' },
  newGroup: { zh: '新增', en: 'New' },
  save: { zh: '保存', en: 'Save' },
  cancel: { zh: '取消', en: 'Cancel' },
  add: { zh: '添加', en: 'Add' },
  groupName: { zh: '分组名称', en: 'Group Name' },
  groupCount: { zh: '个书签', en: 'bookmarks' },
  dataManagement: { zh: '数据管理', en: 'Data Management' },
  storageUsage: { zh: '存储使用', en: 'Storage Used' },
  exportBackup: { zh: '导出数据备份', en: 'Export Backup' },
  importRestore: { zh: '导入数据恢复', en: 'Import & Restore' },
  importSuccess: { zh: '导入成功！', en: 'Import successful!' },
  importFailed: { zh: '导入失败', en: 'Import failed' },
  delete: { zh: '删除', en: 'Delete' },
  edit: { zh: '编辑', en: 'Edit' },

  // Edit Modal
  editBookmarks: { zh: '编辑书签', en: 'Edit Bookmarks' },
  addHideDelete: { zh: '添加、隐藏或删除书签', en: 'Add, hide, or delete bookmarks' },
  addBookmark: { zh: '添加新书签', en: 'Add Bookmark' },
  bookmarkTitle: { zh: '书签标题', en: 'Title' },
  url: { zh: '网址', en: 'URL' },
  urlPlaceholder: { zh: '网址 https://...', en: 'URL https://...' },
  pleaseEnterUrl: { zh: '请输入网址', en: 'Please enter URL' },
  unsupportedProtocol: { zh: '仅支持 http/https 链接', en: 'Only http/https supported' },
  invalidUrlFormat: { zh: '网址格式不正确', en: 'Invalid URL format' },
  addInProgress: { zh: '添加中...', en: 'Adding...' },
  hideAction: { zh: '隐藏', en: 'Hide' },
  showAction: { zh: '显示', en: 'Show' },
  deleteAction: { zh: '删除', en: 'Delete' },
  chineseDesc: { zh: '中文介绍（可选）', en: 'Chinese description (optional)' },
  englishDesc: { zh: 'English description (optional)', en: 'English description (optional)' },

  // Bookmark Card
  chinaService: { zh: '中国服务', en: 'China Service' },
  globalService: { zh: '全球服务', en: 'Global Service' },

  // Bookmark Grid / Edit Modes
  noBookmarks: { zh: '暂无书签', en: 'No bookmarks yet' },
  addBookmarkHint: { zh: '按 E 键添加书签', en: 'Press E to add bookmarks' },
  revealModeBtn: { zh: '全量模式', en: 'Reveal All' },
  groupEditMode: { zh: '分组编辑', en: 'Group Edit' },
  globalEditMode: { zh: '全局编辑', en: 'Global Edit' },
  done: { zh: '完成', en: 'Done' },
  hiddenBookmarks: { zh: '个隐藏书签', en: 'hidden bookmarks' },
  noMatchFound: { zh: '未找到匹配的书签', en: 'No matching bookmarks' },
  groupEditHint: { zh: '此模式下编辑仅影响当前分组', en: 'Edits only affect this group' },
  globalEditHint: { zh: '此模式下编辑将影响所有分组', en: 'Edits affect all groups' },
  switchToGlobalEdit: { zh: '全局操作请切换至「全量编辑」', en: 'Switch to All Edit for global operations' },

  // Bookmark Actions
  restore: { zh: '恢复', en: 'Restore' },
  removeFromGroup: { zh: '从分组移除', en: 'Remove from Group' },
  hideFromGroup: { zh: '在分组隐藏', en: 'Hide in Group' },
  showInGroup: { zh: '在分组显示', en: 'Show in Group' },
  deletedBadge: { zh: '已删除', en: 'Deleted' },
  groupHiddenBadge: { zh: '组内隐藏', en: 'Hidden in Group' },

  // Secret Modal
  enterSecret: { zh: '输入暗号', en: 'Enter Secret Code' },
  secretHint: { zh: '请输入暗号进入全量模式', en: 'Enter secret code to enter all mode' },
  wrongSecret: { zh: '暗号错误', en: 'Wrong code' },
  tryAgain: { zh: '重试', en: 'Try Again' },

  // Region labels
  regionAuto:  { zh: '自动（不区分语言）', en: 'Auto (all languages)' },
  regionCN:    { zh: '🇨🇳', en: '🇨🇳' },
  regionGlobal: { zh: '🌐', en: '🌐' },
  descZhPlaceholder: { zh: '简介（中文，选填）', en: 'Description (Chinese, optional)' },
  descEnPlaceholder: { zh: '简介（英文，选填）', en: 'Description (English, optional)' },

  // Context menu / Bookmark grid
  copyUrl: { zh: '复制网址', en: 'Copy URL' },
  openInNewTab: { zh: '在新标签页打开', en: 'Open in New Tab' },
  openInNewTabShort: { zh: '新标签页打开', en: 'Open in new tab' },
  copyLink: { zh: '复制链接', en: 'Copy link' },
  moveTo: { zh: '移动到', en: 'Move to' },
  moveToGroup: { zh: '移动到分组', en: 'Move to group' },
  hideBookmark: { zh: '隐藏书签', en: 'Hide Bookmark' },
  hide: { zh: '隐藏', en: 'Hide' },
  show: { zh: '显示', en: 'Show' },
} as const;

// ─── 类型定义 ─────────────────────────────────────────────────
export type UILabel = keyof typeof UI_TEXT;

export function getText(label: UILabel, lang: 'zh' | 'en'): string {
  return UI_TEXT[label][lang];
}

// ─── Hook: 获取当前语言 ────────────────────────────────────────
export function useCurrentLang(): 'zh' | 'en' {
  const [lang, setLang] = useState<'zh' | 'en'>(() => {
    const pref = useAppStore.getState().langPref;
    return getEffectiveLang(pref as LangPref);
  });

  useEffect(() => {
    const unsubscribe = subscribeLang((newLang) => {
      setLang(newLang);
    });
    return unsubscribe;
  }, []);

  return lang;
}

// ─── Hook: 获取翻译文本 ────────────────────────────────────────
export function useT(): (label: UILabel) => string {
  const lang = useCurrentLang();
  return useCallback((label: UILabel) => getText(label, lang), [lang]);
}

// ─── 数字格式化（根据语言）──────────────────────────────────────
export function formatCount(count: number, lang: 'zh' | 'en'): string {
  return lang === 'zh' ? `${count} 个` : `${count}`;
}

// ─── 语言选项 ──────────────────────────────────────────────────
export const LANG_OPTIONS: Array<{ value: LangPref; label: { zh: string; en: string }; icon: string }> = [
  { value: 'auto', label: { zh: '跟随系统', en: 'Follow System' }, icon: '🔄' },
  { value: 'zh', label: { zh: '中文', en: 'Chinese' }, icon: '🇨🇳' },
  { value: 'en', label: { zh: 'English', en: 'English' }, icon: '🇺🇸' },
];

export function getLangOptionLabel(opt: typeof LANG_OPTIONS[number], lang: 'zh' | 'en'): string {
  return opt.label[lang];
}
