/**
 * S3 reorderGroups 安全性 — 单元测试
 * 运行: node scripts/test-reorder.mjs
 */

// 模拟修复后的 reorderGroups 逻辑
function reorderGroups(existingGroups, groupIds) {
  return existingGroups.map((group) => {
    const newOrder = groupIds.indexOf(group.id);
    if (newOrder === -1) return group;
    return { ...group, order: newOrder, updatedAt: Date.now() };
  });
}

const MOCK_GROUPS = [
  { id: 'g1', name: 'AI', order: 0 },
  { id: 'g2', name: 'Dev', order: 1 },
  { id: 'g3', name: 'Design', order: 2 },
];

let pass = 0, fail = 0;

function assert(condition, msg) {
  if (!condition) { console.error(`  ✗ FAIL: ${msg}`); fail++; }
  else { console.log(`  ✓ ${msg}`); pass++; }
}

console.log('\n=== S3 reorderGroups Safety — Unit Tests ===\n');

// T1: 正常重排
{
  const result = reorderGroups(MOCK_GROUPS, ['g3', 'g1', 'g2']);
  assert(result.length === 3, `preserves all groups: got ${result.length}`);
  assert(result.find(g => g.id === 'g1').order === 1, 'g1 moved to index 1');
  assert(result.find(g => g.id === 'g2').order === 2, 'g2 moved to index 2');
  assert(result.find(g => g.id === 'g3').order === 0, 'g3 moved to index 0');
}

// T2: 无效 ID 不破坏数据（旧逻辑：! 断言会静默产生 undefined 对象）
{
  const result = reorderGroups(MOCK_GROUPS, ['g1', 'g999', 'g3']);
  assert(result.length === 3, `preserves all groups despite invalid id: got ${result.length}`);
  assert(!result.some(g => g === undefined || g === null), 'no undefined/null groups');
  assert(!result.some(g => g.name === undefined), 'all groups have name fields');
  assert(result.find(g => g.id === 'g2').order === 1, 'g2 NOT in reorder list — preserved with original order 1');
}

// T3: 重复 ID 不导致数据丢失
{
  const result = reorderGroups(MOCK_GROUPS, ['g1', 'g1', 'g2', 'g3']);
  assert(result.length === 3, `deduplicates by group.id: got ${result.length}`);
  assert(result.find(g => g.id === 'g1').order === 0, 'g1 at index 0');
  assert(result.find(g => g.id === 'g2').order === 2, 'g2 at index 2');
}

// T4: 空数组保留原有顺序
{
  const result = reorderGroups(MOCK_GROUPS, []);
  assert(result.length === 3, `empty reorder preserves all groups: got ${result.length}`);
  assert(result.every(g => g.order === MOCK_GROUPS.find(m => m.id === g.id).order), 'original orders preserved');
}

// T5: 新增分组（ID 不在现有列表）应保留
{
  const groupsWithNew = [
    ...MOCK_GROUPS,
    { id: 'g4', name: 'New', order: 3 },
  ];
  const result = reorderGroups(groupsWithNew, ['g3', 'g1', 'g2']);
  assert(result.length === 4, `new group not lost: got ${result.length}`);
  assert(result.find(g => g.id === 'g4').order === 3, 'g4 preserved with original order 3');
}

// T6: 对比旧逻辑的漏洞（! 非空断言导致静默数据破坏）
{
  // 模拟旧逻辑的漏洞模式
  function oldReorderGroups(existingGroups, groupIds) {
    return groupIds.map((id, index) => {
      const group = existingGroups.find((g) => g.id === id);
      if (!group) return { id, order: index, updatedAt: Date.now() }; // g999幽灵组静默混入
      return { ...group, order: index, updatedAt: Date.now() };
    });
  }
  const oldResult = oldReorderGroups(MOCK_GROUPS, ['g1', 'g999', 'g3']);
  // 旧逻辑混入幽灵 g999，导致数据不一致
  assert(oldResult.length === 3, 'old logic: returns 3 items (includes phantom g999)');
  assert(oldResult.some(g => g.id === 'g999' && g.name === undefined), 'old logic: g999 IS a phantom with no name — DATA CORRUPTION');

  // 正确逻辑（修复后）：无效ID被跳过，不会混入幽灵组
  const fixedResult = reorderGroups(MOCK_GROUPS, ['g1', 'g999', 'g3']);
  assert(fixedResult.length === 3, 'fixed: all 3 original groups preserved, invalid g999 silently ignored');
  assert(!fixedResult.some(g => g.id === 'g999'), 'fixed: no phantom g999 in result');
}

console.log(`\n  Passed: ${pass} / ${pass + fail}`);
if (fail === 0) {
  console.log('\n✅ All tests passed!\n');
} else {
  console.log(`\n❌ ${fail} test(s) failed!\n`);
  process.exit(1);
}
