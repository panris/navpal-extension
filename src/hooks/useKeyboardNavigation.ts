import { useState, useEffect, useCallback, useRef } from 'react';

interface NavigationOptions {
  columns: number;
  totalItems: number;
  onEnter?: (index: number) => void;
  onSpace?: (index: number) => void;
  onDelete?: (index: number) => void;
  enabled?: boolean;
  /** Called when the set of selected IDs changes (batch selection mode) */
  onSelectionChange?: (selectedIds: Set<string>, lastToggledId: string | null) => void;
}

export function useKeyboardNavigation({
  columns,
  totalItems,
  onEnter,
  onSpace,
  onDelete,
  enabled = true,
  onSelectionChange,
}: NavigationOptions) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  /** Batch selection: IDs of selected bookmarks */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const select = useCallback(
    (index: number) => {
      if (totalItems === 0) return;
      const clamped = Math.min(Math.max(index, 0), totalItems - 1);
      setSelectedIndex(clamped);
    },
    [totalItems]
  );

  /**
   * Toggle a bookmark ID in/out of the batch selection set.
   * Resets single selection cursor to this index.
   */
  const toggleSelect = useCallback(
    (index: number, id: string) => {
      setSelectedIndex(index);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        onSelectionChange?.(next, id);
        return next;
      });
    },
    [onSelectionChange]
  );

  /** Clear all batch selections */
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    onSelectionChange?.(new Set(), null);
  }, [onSelectionChange]);

  const moveRight = useCallback(() => {
    if (totalItems === 0) return;
    setSelectedIndex((i) => Math.min(Math.max(i + 1, 0), totalItems - 1));
  }, [totalItems]);

  const moveLeft = useCallback(() => {
    if (totalItems === 0) return;
    setSelectedIndex((i) => Math.min(Math.max(i - 1, 0), totalItems - 1));
  }, [totalItems]);

  const moveDown = useCallback(() => {
    if (totalItems === 0) return;
    setSelectedIndex((i) => Math.min(Math.max(i + columns, 0), totalItems - 1));
  }, [totalItems, columns]);

  const moveUp = useCallback(() => {
    if (totalItems === 0) return;
    setSelectedIndex((i) => Math.min(Math.max(i - columns, 0), totalItems - 1));
  }, [totalItems, columns]);

  // Select first item when items change and nothing selected
  useEffect(() => {
    if (enabled && totalItems > 0 && selectedIndex === -1) {
      setSelectedIndex(0);
    }
  }, [enabled, totalItems, selectedIndex]);

  // Reset when grid becomes empty
  useEffect(() => {
    if (totalItems === 0) {
      setSelectedIndex(-1);
    }
  }, [totalItems]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

      // Only handle when not in an input field
      if (isInput) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveUp();
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && onEnter) {
            onEnter(selectedIndex);
          }
          break;
        case ' ':
          e.preventDefault();
          if (selectedIndex >= 0 && onSpace) {
            onSpace(selectedIndex);
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedIndex >= 0 && onDelete) {
            e.preventDefault();
            onDelete(selectedIndex);
          }
          break;
        case 'Escape':
          setSelectedIndex(-1);
          setSelectedIds(new Set());
          break;
        case 'Home':
          e.preventDefault();
          setSelectedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setSelectedIndex(totalItems - 1);
          break;
      }
    },
    [enabled, selectedIndex, totalItems, moveRight, moveLeft, moveDown, moveUp, onEnter, onSpace, onDelete]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (!enabled || selectedIndex < 0) return;
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>('[data-card-index]');
    const card = cards[selectedIndex];
    if (card) {
      card.scrollIntoView({ block: 'nearest', behavior: 'smooth', inline: 'nearest' });
    }
  }, [selectedIndex, enabled]);

  return {
    selectedIndex,
    setSelectedIndex,
    select,
    toggleSelect,
    clearSelection,
    selectedIds,
    containerRef,
  };
}
