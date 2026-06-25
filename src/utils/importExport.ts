import type { Group, Bookmark, AppSettings } from '@/types';
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

  // Thorough type checks for groups
  const validGroup = obj.groups.every(
    (g: unknown) => {
      if (typeof g !== 'object' || g === null) return false;
      const group = g as Record<string, unknown>;
      if (typeof group.id !== 'string' || !group.id) return false;
      if (typeof group.name !== 'string') return false;
      if (typeof group.hidden !== 'boolean') return false;
      if (typeof group.order !== 'number') return false;
      if (typeof group.createdAt !== 'number') return false;
      if (typeof group.updatedAt !== 'number') return false;
      if (group.nameI18n !== undefined) {
        if (typeof group.nameI18n !== 'object' || group.nameI18n === null) return false;
        const n = group.nameI18n as Record<string, unknown>;
        if (typeof n.zh !== 'string' || typeof n.en !== 'string') return false;
      }
      return true;
    }
  );
  // Thorough type checks for bookmarks
  const validBookmark = obj.bookmarks.every(
    (b: unknown) => {
      if (typeof b !== 'object' || b === null) return false;
      const bm = b as Record<string, unknown>;
      if (typeof bm.id !== 'string' || !bm.id) return false;
      if (typeof bm.title !== 'string' || !bm.title) return false;
      if (typeof bm.url !== 'string' || !bm.url) return false;
      try { new URL(bm.url as string); } catch { return false; }
      if (typeof bm.groupId !== 'string' || !bm.groupId) return false;
      if (typeof bm.order !== 'number') return false;
      if (typeof bm.hidden !== 'boolean') return false;
      if (bm.region !== null && bm.region !== 'CN' && bm.region !== 'Global') return false;
      if (typeof bm.regionManual !== 'boolean') return false;
      if (typeof bm.createdAt !== 'number') return false;
      if (typeof bm.updatedAt !== 'number') return false;
      if (bm.deletedAt != null && typeof bm.deletedAt !== 'number') return false;
      if (bm.description !== undefined) {
        if (typeof bm.description !== 'object' || bm.description === null) return false;
        const d = bm.description as Record<string, unknown>;
        if (typeof d.zh !== 'string' || typeof d.en !== 'string') return false;
      }
      return true;
    }
  );

  if (!validGroup) return { valid: false, error: 'groups 格式错误' };
  if (!validBookmark) return { valid: false, error: 'bookmarks 格式错误' };

  // Validate groupId references (prevent orphan bookmarks)
  const groupIds = new Set(obj.groups.map((g: Record<string, unknown>) => g.id as string));
  const orphanGroupIds = new Set<string>();
  obj.bookmarks.forEach((b: Record<string, unknown>) => {
    const groupId = b.groupId as string;
    if (!groupIds.has(groupId)) {
      orphanGroupIds.add(groupId);
    }
  });
  if (orphanGroupIds.size > 0) {
    return { valid: false, error: `发现孤立书签：groupId ${[...orphanGroupIds].join(', ')} 不存在` };
  }

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
