/**
 * Bookmark visibility utilities.
 * Shared by BookmarkGrid, GroupTabs, and Footer.
 */

/** Check if a bookmark should be visible based on language setting.
 * CN-region bookmarks are hidden when the UI language is English. */
export function isBookmarkVisible(region: 'CN' | 'Global' | null, lang: 'zh' | 'en'): boolean {
  if (region === 'CN' && lang === 'en') return false;
  return true;
}
