/**
 * S1 导入恢复书签 — 单元测试
 * 运行: node scripts/test-import.mjs
 */

const MOCK_EXPORT_DATA = {
  version: 1,
  exportedAt: Date.now(),
  groups: [
    { id: 'g1', name: 'AI Tools', nameI18n: { zh: 'AI 工具', en: 'AI Tools' }, icon: 'sparkles', hidden: false, order: 0, createdAt: 1, updatedAt: 1 },
    { id: 'g2', name: 'Dev', nameI18n: { zh: '开发', en: 'Dev' }, icon: 'code', hidden: false, order: 1, createdAt: 1, updatedAt: 1 },
  ],
  bookmarks: [
    { id: 'b1', title: 'ChatGPT', url: 'https://chat.openai.com', groupId: 'g1', order: 0, region: 'Global', hidden: false, deletedAt: null, groupHidden: {}, groupDeleted: {}, createdAt: 1, updatedAt: 1 },
    { id: 'b2', title: 'Claude', url: 'https://claude.ai', groupId: 'g1', order: 1, region: 'Global', hidden: false, deletedAt: null, groupHidden: {}, groupDeleted: {}, createdAt: 1, updatedAt: 1 },
    { id: 'b3', title: 'GitHub', url: 'https://github.com', groupId: 'g2', order: 0, region: 'Global', hidden: false, deletedAt: null, groupHidden: {}, groupDeleted: {}, createdAt: 1, updatedAt: 1 },
  ],
  settings: {
    secretCode: '000',
    theme: 'light',
    langPref: 'auto',
    triggerZone: 'right',
    lockDuration: 60000,
    showRegionLabels: false,
    compactMode: false,
    storageQuota: 5120,
    schemaVersion: 1,
    hasSeenOnboarding: true,
  },
};

// Minimal validateImportData (copy of src/utils/importExport.ts logic)
function validateImportData(raw) {
  if (!raw || typeof raw !== 'object') return { valid: false, error: '数据格式无效' };
  const obj = raw;
  if (!Array.isArray(obj.groups)) return { valid: false, error: '缺少 groups 字段' };
  if (!Array.isArray(obj.bookmarks)) return { valid: false, error: '缺少 bookmarks 字段' };
  if (!obj.settings || typeof obj.settings !== 'object') return { valid: false, error: '缺少 settings 字段' };
  return { valid: true, data: obj };
}

function assert(condition, msg) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`  ✓ ${msg}`);
}

console.log('\n=== S1 Import Restore Bookmarks — Unit Tests ===\n');

// T1: 验证正常数据
{
  const result = validateImportData(MOCK_EXPORT_DATA);
  assert(result.valid === true, 'valid import data passes validation');
  assert(result.data.bookmarks.length === 3, `has all 3 bookmarks: got ${result.data.bookmarks.length}`);
}

// T2: 缺少 bookmarks 字段
{
  const result = validateImportData({ groups: [], settings: {} });
  assert(result.valid === false, 'missing bookmarks field fails validation');
  assert(result.error.includes('bookmarks'), `error mentions bookmarks: "${result.error}"`);
}

// T3: 缺少 groups 字段
{
  const result = validateImportData({ bookmarks: [], settings: {} });
  assert(result.valid === false, 'missing groups field fails validation');
}

// T4: 缺少 settings 字段
{
  const result = validateImportData({ groups: [], bookmarks: [] });
  assert(result.valid === false, 'missing settings field fails validation');
}

// T5: bookmarks 是空数组
{
  const result = validateImportData({ ...MOCK_EXPORT_DATA, bookmarks: [] });
  assert(result.valid === true, 'empty bookmarks array is valid');
  assert(result.data.bookmarks.length === 0, 'empty bookmarks preserved');
}

// T6: 模拟 handleImport 合并逻辑（去重 + 追加）
{
  const existingBookmarks = [
    { id: 'b1', title: 'Existing', url: 'https://existing.com', groupId: 'g1', order: 0, region: 'Global', hidden: false, deletedAt: null, groupHidden: {}, groupDeleted: {}, createdAt: 1, updatedAt: 1 },
  ];
  const importedBookmarks = MOCK_EXPORT_DATA.bookmarks;

  const existingIds = new Set(existingBookmarks.map((b) => b.id));
  const filtered = importedBookmarks.filter((b) => !existingIds.has(b.id));
  const merged = [...existingBookmarks, ...filtered];

  assert(merged.length === 3, `merge keeps existing (1) + new unique (2) = 3: got ${merged.length}`);
  assert(merged[0].id === 'b1', 'existing bookmark preserved at index 0');
  assert(merged[1].id === 'b2', 'imported b2 added at index 1');
  assert(merged[2].id === 'b3', 'imported b3 added at index 2');
}

// T7: 导入数据全是重复 ID（不应覆盖现有）
{
  const existingBookmarks = MOCK_EXPORT_DATA.bookmarks;
  const importedBookmarks = MOCK_EXPORT_DATA.bookmarks; // same IDs

  const existingIds = new Set(existingBookmarks.map((b) => b.id));
  const filtered = importedBookmarks.filter((b) => !existingIds.has(b.id));

  assert(filtered.length === 0, 'no new bookmarks when all IDs duplicate');
  assert(existingBookmarks.length === 3, 'existing bookmarks unchanged');
}

// T8: 新书签与现有书签混合
{
  const existingBookmarks = [
    { id: 'b1', title: 'ChatGPT', url: 'https://chat.openai.com', groupId: 'g1', order: 0, region: 'Global', hidden: false, deletedAt: null, groupHidden: {}, groupDeleted: {}, createdAt: 1, updatedAt: 1 },
    { id: 'b99', title: 'Local', url: 'https://local.com', groupId: 'g1', order: 1, region: 'Global', hidden: false, deletedAt: null, groupHidden: {}, groupDeleted: {}, createdAt: 1, updatedAt: 1 },
  ];
  const importedBookmarks = MOCK_EXPORT_DATA.bookmarks;

  const existingIds = new Set(existingBookmarks.map((b) => b.id));
  const filtered = importedBookmarks.filter((b) => !existingIds.has(b.id));
  const merged = [...existingBookmarks, ...filtered];

  assert(merged.length === 4, `existing(2) + new unique(2) = 4: got ${merged.length}`);
  assert(merged[0].id === 'b1', 'existing b1 preserved');
  assert(merged[1].id === 'b99', 'existing b99 preserved');
  assert(merged[2].id === 'b2', 'new b2 added');
  assert(merged[3].id === 'b3', 'new b3 added');
}

// T9: 完全替换场景（现有书签为空）
{
  const existingBookmarks = [];
  const importedBookmarks = MOCK_EXPORT_DATA.bookmarks;

  const existingIds = new Set(existingBookmarks.map((b) => b.id));
  const filtered = importedBookmarks.filter((b) => !existingIds.has(b.id));
  const merged = [...existingBookmarks, ...filtered];

  assert(merged.length === 3, `all imported bookmarks restored when existing is empty: got ${merged.length}`);
}

console.log('\n✅ All tests passed!\n');
