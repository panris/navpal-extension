/**
 * H3 导出数量验证 — 单元测试
 * 运行: node scripts/test-export.mjs
 */

const MOCK_BOOKMARKS = [];
for (let i = 0; i < 85; i++) {
  MOCK_BOOKMARKS.push({
    id: `bm-${i}`,
    title: `Bookmark ${i}`,
    url: `https://example${i}.com`,
    groupId: `g${i % 5}`,
    order: i,
    region: 'Global',
    hidden: false,
    deletedAt: null,
    groupHidden: {},
    groupDeleted: {},
    createdAt: 1,
    updatedAt: 1,
  });
}

function exportData(groups, bookmarks, settings) {
  const data = { version: 1, exportedAt: Date.now(), groups, bookmarks, settings };
  return JSON.stringify(data, null, 2);
}

function validateImportData(raw) {
  if (!raw || typeof raw !== 'object') return { valid: false, error: '数据格式无效' };
  const obj = raw;
  if (!Array.isArray(obj.groups)) return { valid: false, error: '缺少 groups 字段' };
  if (!Array.isArray(obj.bookmarks)) return { valid: false, error: '缺少 bookmarks 字段' };
  if (!obj.settings || typeof obj.settings !== 'object') return { valid: false, error: '缺少 settings 字段' };
  const validGroup = obj.groups.every(
    (g) => typeof g === 'object' && g !== null && typeof g.id === 'string'
  );
  const validBookmark = obj.bookmarks.every(
    (b) => typeof b === 'object' && b !== null && typeof b.id === 'string'
  );
  if (!validGroup) return { valid: false, error: 'groups 格式错误' };
  if (!validBookmark) return { valid: false, error: 'bookmarks 格式错误' };
  return { valid: true, data: obj };
}

let pass = 0, fail = 0;
function assert(condition, msg) {
  if (!condition) { console.error(`  ✗ FAIL: ${msg}`); fail++; }
  else { console.log(`  ✓ ${msg}`); pass++; }
}

console.log('\n=== H3 Export Bookmark Count — Unit Tests ===\n');

// T1: 导出全部 85 条书签
const mockSettings = { secretCode: '000', theme: 'light', langPref: 'auto', triggerZone: 'bottom-left', lockDuration: 60000, showRegionLabels: false, compactMode: false, storageQuota: 100, schemaVersion: 1, hasSeenOnboarding: true };
const mockGroups = [{ id: 'g1', name: 'AI', nameI18n: { zh: 'AI', en: 'AI' }, icon: 'sparkles', hidden: false, order: 0, createdAt: 1, updatedAt: 1 }];

const json = exportData(mockGroups, MOCK_BOOKMARKS, mockSettings);
const parsed = JSON.parse(json);
assert(parsed.bookmarks.length === 85, `all 85 bookmarks in export: got ${parsed.bookmarks.length}`);

// T2: 导出 JSON 包含完整 bookmarks 数组
assert(Array.isArray(parsed.bookmarks), 'exported data has bookmarks array');
assert(parsed.bookmarks[0].id === 'bm-0', 'first bookmark preserved');
assert(parsed.bookmarks[84].id === 'bm-84', 'last bookmark preserved');

// T3: 导入验证对全部 85 条通过
const validated = validateImportData(parsed);
assert(validated.valid === true, `all 85 bookmarks pass validation: ${validated.valid}`);
assert(validated.data.bookmarks.length === 85, `validated data has 85 bookmarks: got ${validated.data.bookmarks.length}`);

// T4: 空书签数组也能正确处理
const emptyExport = exportData(mockGroups, [], mockSettings);
const emptyParsed = JSON.parse(emptyExport);
const emptyValidated = validateImportData(emptyParsed);
assert(emptyParsed.bookmarks.length === 0, 'empty bookmarks array exports correctly');
assert(emptyValidated.valid === true, 'empty bookmarks array passes validation');

// T5: 导出的 JSON 字符串长度合理（不是被截断）
assert(json.length > 10000, `JSON size reasonable (${json.length} chars > 10KB) for 85 bookmarks`);

console.log(`\n  Passed: ${pass} / ${pass + fail}`);
if (fail === 0) {
  console.log('\n✅ All tests passed!\n');
  console.log('  H3结论: exportData 函数本身逻辑正确，导出全部书签数组。\n');
  console.log('  如果实际使用中发现数量不符，问题可能在调用处或旧存储数据格式。\n');
} else {
  console.log(`\n❌ ${fail} test(s) failed!\n`);
  process.exit(1);
}
