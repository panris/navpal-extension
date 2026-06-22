/**
 * Icon generation utilities for bookmark cards.
 * Deterministic hash-based color and shape selection.
 */

export const ICON_GRADIENTS = [
  { bg: 'from-violet-500 to-purple-600', border: 'border-violet-400', glow: 'shadow-violet-500/30' },
  { bg: 'from-pink-500 to-rose-500', border: 'border-pink-400', glow: 'shadow-pink-500/30' },
  { bg: 'from-cyan-500 to-blue-500', border: 'border-cyan-400', glow: 'shadow-cyan-500/30' },
  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', glow: 'shadow-emerald-500/30' },
  { bg: 'from-orange-500 to-amber-500', border: 'border-orange-400', glow: 'shadow-orange-500/30' },
  { bg: 'from-rose-400 to-pink-500', border: 'border-rose-400', glow: 'shadow-rose-500/30' },
  { bg: 'from-indigo-500 to-violet-500', border: 'border-indigo-400', glow: 'shadow-indigo-500/30' },
  { bg: 'from-fuchsia-500 to-purple-500', border: 'border-fuchsia-400', glow: 'shadow-fuchsia-500/30' },
  { bg: 'from-sky-500 to-cyan-500', border: 'border-sky-400', glow: 'shadow-sky-500/30' },
  { bg: 'from-lime-500 to-emerald-500', border: 'border-lime-400', glow: 'shadow-lime-500/30' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getIconStyle(id: string) {
  return ICON_GRADIENTS[hashString(id) % ICON_GRADIENTS.length];
}

export function getIconPattern(id: string): string {
  const patterns = ['●', '■', '▲', '★', '◆'];
  return patterns[hashString(id) % patterns.length];
}

/** Returns the gradient CSS class string for an id (e.g. "from-violet-500 to-purple-600") */
export function getIconGradientClass(id: string): string {
  return `bg-gradient-to-br ${getIconStyle(id).bg}`;
}

export function getIconLetter(url: string, title: string): string {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const secondLevel = parts[parts.length - 2];
      if (secondLevel.length > 1) {
        return secondLevel.charAt(0).toUpperCase();
      }
    }
  } catch {
    // ignore
  }
  return title.trim().charAt(0).toUpperCase() || '?';
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}
