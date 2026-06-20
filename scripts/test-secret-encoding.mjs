/**
 * S5 加密存储 — 单元测试
 * 运行: node scripts/test-secret-encoding.mjs
 */

const SECRET_SALT = 'navpal-v1:';

function generateDefaultSecretCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function encodeSecret(plainCode) {
  return btoa(SECRET_SALT + plainCode);
}

function decodeSecret(encoded) {
  if (/^\d{4}$/.test(encoded)) return encoded; // legacy plain text
  try {
    const decoded = atob(encoded);
    if (decoded.startsWith(SECRET_SALT)) return decoded.slice(SECRET_SALT.length);
    return encoded;
  } catch {
    return encoded;
  }
}

function isSecretEncoded(stored) {
  if (/^\d{4}$/.test(stored)) return false; // legacy plain
  if (stored.length < SECRET_SALT.length) return false;
  try {
    return atob(stored).startsWith(SECRET_SALT);
  } catch {
    return false;
  }
}

let pass = 0, fail = 0;
function assert(condition, msg) {
  if (!condition) { console.error(`  ✗ FAIL: ${msg}`); fail++; }
  else { console.log(`  ✓ ${msg}`); pass++; }
}

console.log('\n=== S5 Secret Encoding — Unit Tests ===\n');

// T1: 生成的是4位数字
const rawCode = generateDefaultSecretCode();
assert(typeof rawCode === 'string', `generated code is string: "${rawCode}"`);
assert(/^\d{4}$/.test(rawCode), `generated code is 4 digits: "${rawCode}"`);
assert(rawCode !== '000', `not weak default '000': "${rawCode}"`);

// T2: 编码 → 解码 roundtrip
const encoded = encodeSecret(rawCode);
assert(encoded !== rawCode, 'encoded form differs from plain text');
const decoded = decodeSecret(encoded);
assert(decoded === rawCode, `decode(encode(x)) === x: "${rawCode}"`);

// T3: 编码不是 base64 里直接可见原文
assert(!encoded.includes(rawCode), 'plain code not visible in encoded string');

// T4: isSecretEncoded 正确识别编码后的值
assert(isSecretEncoded(encoded), 'isSecretEncoded returns true for encoded value');

// T5: 旧数据（明文4位）不会被误判为已编码
const legacyCode = '0000';
assert(!isSecretEncoded(legacyCode), `legacy plain code '${legacyCode}' not marked as encoded`);

// T6: 旧数据解码后仍正确（兼容旧 localStorage）
const legacyEncoded = legacyCode; // plain
assert(decodeSecret(legacyEncoded) === '0000', 'legacy plain text decodes correctly');

// T7: 已知示例
const PIN = '1234';
const knownEncoded = encodeSecret(PIN);
assert(decodeSecret(knownEncoded) === '1234', `known PIN '1234' roundtrips correctly`);
assert(isSecretEncoded(knownEncoded), 'known PIN is detected as encoded');
assert(knownEncoded.startsWith(btoa(SECRET_SALT).slice(0, 3)), 'encoded starts with salt prefix (base64)');

// T8: 随机 PIN 都编码后不可读
const codes = new Set();
for (let i = 0; i < 20; i++) {
  const c = generateDefaultSecretCode();
  codes.add(encodeSecret(c));
}
const decodedSet = new Set([...codes].map(decodeSecret));
assert(decodedSet.size === 20, `all 20 random codes decode back: ${decodedSet.size}`);
assert(!decodedSet.has(SECRET_SALT), 'salt never leaks into decoded values');

console.log(`\n  Passed: ${pass} / ${pass + fail}`);
if (fail === 0) {
  console.log('\n✅ All tests passed!\n');
} else {
  console.log(`\n❌ ${fail} test(s) failed!\n`);
  process.exit(1);
}
