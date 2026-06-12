// Shared constants — replaces magic numbers across the codebase

export const STORAGE_QUOTA_KB = 100;
export const STORAGE_WARN_RATIO = 0.9;
export const MAX_PIN_ATTEMPTS = 3;
export const SEARCH_DEBOUNCE_MS = 200;
export const CLOCK_TICK_MS = 30000;
export const LANG_POLL_INTERVAL_MS = 500; // legacy, kept for reference
export const TOOLTIP_OFFSET = 12;
export const MAX_BOOKMARKS_BEFORE_VIRTUALIZATION = 50;
export const MAX_TITLE_LEN = 60;
export const MAX_URL_DISPLAY_LEN = 30;
export const MAX_TITLE_DISPLAY_LEN = 20;

// Schema version history (for migration)
export const SCHEMA_VERSIONS = {
  INITIAL: 1,
} as const;
export const CURRENT_SCHEMA_VERSION = SCHEMA_VERSIONS.INITIAL;