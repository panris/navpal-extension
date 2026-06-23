import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Bookmark } from '@/types';
import { useAppStore } from '@/stores/appStore';
import BookmarkCard from './BookmarkCard';
import { cn } from '@/utils/cn';

interface SortableBookmarkCardProps {
  bookmark: Bookmark;
  groupId: string;
  isDragging: boolean;
  isKeyboardSelected?: boolean;
  dataCardIndex?: number;
  isSelected?: boolean;
  dataCardId?: string;
  onContextMenu?: (e: React.MouseEvent, bookmarkId: string) => void;
  onToggleSelect?: () => void;
}

function SortableBookmarkCardInner({
  bookmark,
  groupId,
  isDragging,
  isKeyboardSelected,
  dataCardIndex,
  isSelected,
  dataCardId,
  onContextMenu,
  onToggleSelect,
}: SortableBookmarkCardProps) {
  // Get editMode from store to ensure re-render when it changes
  const editMode = useAppStore((s) => s.editMode);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'transition-all duration-150',
        isSortableDragging && 'opacity-50 scale-105 z-10 shadow-2xl',
        !isSortableDragging && isDragging && 'cursor-grabbing',
        (isKeyboardSelected || isSelected) && 'ring-2 ring-violet-400 ring-offset-2 rounded-2xl'
      )}
      data-card-index={dataCardIndex}
      data-card-id={dataCardId}
      onContextMenu={onContextMenu ? (e) => onContextMenu(e, bookmark.id) : undefined}
    >
      <BookmarkCard bookmark={bookmark} groupId={groupId} isKeyboardSelected={isKeyboardSelected || isSelected} onToggleSelect={onToggleSelect} editMode={editMode} />
    </div>
  );
}

export default memo(SortableBookmarkCardInner, (prev, next) => {
  return prev.bookmark.id === next.bookmark.id &&
    prev.groupId === next.groupId &&
    prev.isDragging === next.isDragging &&
    prev.isSelected === next.isSelected &&
    prev.isKeyboardSelected === next.isKeyboardSelected &&
    prev.editMode === next.editMode;
});
