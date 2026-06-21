import { Group, Bookmark, AppSettings } from '@/types';
import { CURRENT_SCHEMA_VERSION } from '@/constants';

export interface ExportData {
  version: number;
  exportedAt: number;
  groups: Group[];
  bookmarks: Bookmark[];
  settings: AppSettings;
}

/** 导出全部数据为 JSON 字符串 */
export function exportData(
  groups: Group[],
  bookmarks: Bookmark[],
  settings: AppSettings
): string {
  const data: ExportData = {
    version: CURRENT_SCHEMA_VERSION,
    exportedAt: Date.now(),
    groups,
    bookmarks,
    settings,
  };
  return JSON.stringify(data, null, 2);
}

/** 验证导入数据格式 */
export function validateImportData(raw: unknown): { valid: boolean; data?: ExportData; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: '数据格式无效' };
  }
  const obj = raw as Record<string, unknown>;

  if (!Array.isArray(obj.groups)) {
    return { valid: false, error: '缺少 groups 字段' };
  }
  if (!Array.isArray(obj.bookmarks)) {
    return { valid: false, error: '缺少 bookmarks 字段' };
  }
  if (!obj.settings || typeof obj.settings !== 'object') {
    return { valid: false, error: '缺少 settings 字段' };
  }

  // Basic type checks
  const validGroup = obj.groups.every(
    (g: unknown) =>
      typeof g === 'object' && g !== null && typeof (g as Group).id === 'string'
  );
  const validBookmark = obj.bookmarks.every(
    (b: unknown) =>
      typeof b === 'object' && b !== null && typeof (b as Bookmark).id === 'string'
  );

  if (!validGroup) return { valid: false, error: 'groups 格式错误' };
  if (!validBookmark) return { valid: false, error: 'bookmarks 格式错误' };

  // Validate critical settings fields to prevent migration crashes
  const settings = obj.settings as Record<string, unknown>;
  if (typeof settings.schemaVersion !== 'number') {
    return { valid: false, error: 'settings.schemaVersion 必须是数字' };
  }
  if (typeof settings.secretCode !== 'string') {
    return { valid: false, error: 'settings.secretCode 必须是字符串' };
  }

  return { valid: true, data: obj as unknown as ExportData };
}

/** 生成下载 */
export function downloadJson(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 从文件读取 JSON */
export async function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch {
        reject(new Error('文件解析失败，请确认是有效的 JSON 文件'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

/** 搜索文本转义（用于搜索高亮或正则匹配） */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Favicon URL 生成（可选 Google Favicon API） */
export function getFaviconUrl(url: string, size = 32): string {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=${size}`;
  } catch {
    return '';
  }
}