import { useAppStore, useVisibleGroups } from '@/stores/appStore';
import { cn } from '@/utils/cn';

// Group icons
const groupIcons: Record<string, string> = {
  'group-ai': '🤖',
  'group-dev': '💻',
  'group-design': '🎨',
  'group-work': '📋',
  'group-entertainment': '🎬',
};

export default function GroupTabs() {
  const activeGroupId = useAppStore((state) => state.activeGroupId);
  const setActiveGroup = useAppStore((state) => state.setActiveGroup);
  const isEditMode = useAppStore((state) => state.isEditMode);
  const groups = useVisibleGroups();
  const bookmarks = useAppStore((state) => state.bookmarks);

  // Calculate counts for each group
  const getGroupCount = (groupId: string) => {
    return bookmarks.filter((b) => b.groupId === groupId && !b.hidden).length;
  };

  const totalCount = bookmarks.filter((b) => !b.hidden).length;

  return (
    <div className="bg-white border-b border-gray-100">
      {/* All Tab */}
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveGroup(null)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all',
            activeGroupId === null
              ? 'bg-[#0f172a] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <span>✨</span>
          <span>全部</span>
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full',
            activeGroupId === null ? 'bg-white/20' : 'bg-gray-200'
          )}>
            {totalCount}
          </span>
        </button>

        {/* Group Tabs */}
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all',
              activeGroupId === group.id
                ? 'bg-[#0f172a] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100',
              group.hidden && !useAppStore.getState().isRevealMode && 'opacity-50'
            )}
          >
            <span>{groupIcons[group.id] || '📁'}</span>
            <span>{group.name}</span>
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full',
              activeGroupId === group.id ? 'bg-white/20' : 'bg-gray-200'
            )}>
              {getGroupCount(group.id)}
            </span>
          </button>
        ))}

        {/* Edit Mode Indicator */}
        {isEditMode && (
          <span className="px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 rounded-full">
            编辑中
          </span>
        )}
      </div>
    </div>
  );
}
