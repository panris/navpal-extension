/**
 * Shared constants — replaces magic numbers across the codebase
 */

export const STORAGE_QUOTA_KB = 100;
export const STORAGE_WARN_RATIO = 0.9;
export const MAX_PIN_ATTEMPTS = 3;
export const SECRET_PIN_MIN = 1000;
export const SECRET_PIN_MAX = 9999;
export const SEARCH_DEBOUNCE_MS = 200;
export const LOCK_DURATION_MS = 60_000; // 1 minute lockout after max PIN failures
export const SHAKE_ANIM_MS = 400;       // PIN shake animation duration
export const LOCK_DISMISS_MS = 1500;    // Locked modal auto-dismiss delay
export const TOOLTIP_OFFSET = 12;
export const TOOLTIP_WIDTH = 260;
export const TOOLTIP_HEIGHT = 140;
export const CONTEXT_MENU_HEIGHT = 420; // approximate height for flip detection
export const CURRENT_SCHEMA_VERSION = 1;

// ─── Secret encoding ─────────────────────────────────────────────

const SECRET_SALT = 'navpal-v1:';

/** Generate a random 4-digit PIN for first-install reveal mode */
export function generateDefaultSecretCode(): string {
  return String(Math.floor(SECRET_PIN_MIN + Math.random() * (SECRET_PIN_MAX - SECRET_PIN_MIN + 1)));
}

/** Encode a plain PIN to an opaque string (base64 + salt) */
export function encodeSecret(plainCode: string): string {
  return btoa(SECRET_SALT + plainCode);
}

/** Decode an encoded PIN back to plain text */
export function decodeSecret(encoded: string): string {
  // Legacy: plain 4-digit codes (before encoding was introduced)
  if (/^\d{4}$/.test(encoded)) return encoded;
  try {
    const decoded = atob(encoded);
    if (decoded.startsWith(SECRET_SALT)) return decoded.slice(SECRET_SALT.length);
    return encoded;
  } catch {
    return encoded;
  }
}

/** Check if a stored secret is encoded (vs legacy plain text) */
export function isSecretEncoded(stored: string): boolean {
  if (/^\d{4}$/.test(stored)) return false; // legacy plain
  if (stored.length < SECRET_SALT.length) return false;
  try {
    return atob(stored).startsWith(SECRET_SALT);
  } catch {
    return false;
  }
}
