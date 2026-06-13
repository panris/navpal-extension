import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bookmark } from '@/types';
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
}

export default function SortableBookmarkCard({
  bookmark,
  groupId,
  isDragging,
  isKeyboardSelected,
  dataCardIndex,
  isSelected,
  dataCardId,
  onContextMenu,
}: SortableBookmarkCardProps) {
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
      <BookmarkCard bookmark={bookmark} groupId={groupId} isKeyboardSelected={isKeyboardSelected || isSelected} />
    </div>
  );
}
