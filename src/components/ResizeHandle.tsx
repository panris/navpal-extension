import { useCurrentLang, getText } from '@/utils/i18n';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  const lang = useCurrentLang();
  return (
    <div
      className="resize-handle"
      onMouseDown={onMouseDown}
      title={getText('resizeHint', lang)}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="opacity-40"
      >
        {/* Corner grip dots */}
        <circle cx="11" cy="11" r="1.2" fill="currentColor" />
        <circle cx="7" cy="11" r="1.2" fill="currentColor" />
        <circle cx="11" cy="7" r="1.2" fill="currentColor" />
        <circle cx="8.5" cy="9.5" r="1" fill="currentColor" />
        <circle cx="9.5" cy="8.5" r="1" fill="currentColor" />
      </svg>
    </div>
  );
}
