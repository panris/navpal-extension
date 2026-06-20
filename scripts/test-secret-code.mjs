/**
 * S2 默认 PIN 码生成 — 单元测试
 * 运行: node scripts/test-secret-code.mjs
 */

const PREV = '000';

function generateDefaultSecretCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

let pass = 0;
let fail = 0;

function assert(condition, msg) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${msg}`);
    fail++;
  } else {
    console.log(`  ✓ ${msg}`);
    pass++;
  }
}

console.log('\n=== S2 Secret Code Generation — Unit Tests ===\n');

// T1: 生成的是字符串
const code1 = generateDefaultSecretCode();
assert(typeof code1 === 'string', `code is a string: got "${code1}"`);

// T2: 长度为 4
assert(code1.length === 4, `code length is 4: got ${code1.length}`);

// T3: 全是数字
assert(/^\d{4}$/.test(code1), `code is exactly 4 digits: got "${code1}"`);

// T4: 范围在 1000-9999
const n = parseInt(code1, 10);
assert(n >= 1000 && n <= 9999, `code is in range [1000,9999]: got ${n}`);

// T5: 不等于旧的 '000'
assert(code1 !== PREV, `code is NOT the weak default '000': got "${code1}"`);

// T6: 多次生成不全部相同（有一定随机性）
const codes = new Set();
for (let i = 0; i < 10; i++) codes.add(generateDefaultSecretCode());
assert(codes.size > 1, `multiple calls produce different codes: ${codes.size} unique out of 10`);

// T7: 无前导零（最后一位可以）
const lastCode = generateDefaultSecretCode();
assert(!lastCode.startsWith('0'), `no leading zero: got "${lastCode}"`);

console.log(`\n  Passed: ${pass} / ${pass + fail}`);
if (fail === 0) {
  console.log('\n✅ All tests passed!\n');
} else {
  console.log(`\n❌ ${fail} test(s) failed!\n`);
  process.exit(1);
}
