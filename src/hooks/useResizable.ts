import { useState, useEffect, useCallback, useRef } from 'react';

interface ResizeOptions {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  initialWidth?: number;
  initialHeight?: number;
}

interface ResizeState {
  width: number;
  height: number;
  isResizing: boolean;
}

const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MAX_WIDTH = 800;
const DEFAULT_MIN_HEIGHT = 300;
const DEFAULT_MAX_HEIGHT = 800;
const DEFAULT_INITIAL_WIDTH = 400;
const DEFAULT_INITIAL_HEIGHT = 600;

const STORAGE_KEY = 'navpal-popup-size';

function loadSavedSize(): Partial<ResizeState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        width: parsed.width ?? DEFAULT_INITIAL_WIDTH,
        height: parsed.height ?? DEFAULT_INITIAL_HEIGHT,
      };
    }
  } catch {
    // ignore
  }
  return {};
}

function saveSize(width: number, height: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ width, height }));
  } catch {
    // ignore
  }
}

export function useResizable(options: ResizeOptions = {}) {
  const {
    minWidth = DEFAULT_MIN_WIDTH,
    maxWidth = DEFAULT_MAX_WIDTH,
    minHeight = DEFAULT_MIN_HEIGHT,
    maxHeight = DEFAULT_MAX_HEIGHT,
    initialWidth = DEFAULT_INITIAL_WIDTH,
    initialHeight = DEFAULT_INITIAL_HEIGHT,
  } = options;

  const saved = loadSavedSize();

  const [size, setSize] = useState<ResizeState>({
    width: saved.width ?? initialWidth,
    height: saved.height ?? initialHeight,
    isResizing: false,
  });

  const resizeStartRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const clamp = useCallback(
    (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizeStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: size.width,
        startHeight: size.height,
      };
      setSize((prev) => ({ ...prev, isResizing: true }));
      document.body.style.cursor = 'se-resize';
      document.body.style.userSelect = 'none';
    },
    [size.width, size.height]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const deltaX = e.clientX - resizeStartRef.current.startX;
      const deltaY = e.clientY - resizeStartRef.current.startY;

      const newWidth = clamp(
        resizeStartRef.current.startWidth + deltaX,
        minWidth,
        maxWidth
      );
      const newHeight = clamp(
        resizeStartRef.current.startHeight + deltaY,
        minHeight,
        maxHeight
      );

      setSize((prev) => ({ ...prev, width: newWidth, height: newHeight }));
    };

    const handleMouseUp = () => {
      if (resizeStartRef.current) {
        resizeStartRef.current = null;
        setSize((prev) => {
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          saveSize(prev.width, prev.height);
          return { ...prev, isResizing: false };
        });
      }
    };

    if (size.isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [size.isResizing, clamp, minWidth, maxWidth, minHeight, maxHeight]);

  return {
    width: size.width,
    height: size.height,
    isResizing: size.isResizing,
    handleMouseDown,
  };
}
