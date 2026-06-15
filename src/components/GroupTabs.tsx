import { useAppStore, isBookmarkVisibleInGroup } from '@/stores/appStore';
import { cn } from '@/utils/cn';
import { useCurrentLang, getText } from '@/utils/i18n';

// Group icons and bilingual names
const groupMeta: Record<string, { icon: string; name: { zh: string; en: string } }> = {
  'group-ai': { icon: '🤖', name: { zh: 'AI 工具', en: 'AI Tools' } },
  'group-dev': { icon: '💻', name: { zh: '开发', en: 'Dev' } },
  'group-design': { icon: '🎨', name: { zh: '设计', en: 'Design' } },
  'group-work': { icon: '📋', name: { zh: '工作', en: 'Work' } },
  'group-tools': { icon: '🔧', name: { zh: '工具箱', en: 'Tools' } },
  'group-media': { icon: '🎵', name: { zh: '影音', en: 'Media' } },
  'group-entertainment': { icon: '🎬', name: { zh: '娱乐', en: 'Fun' } },
};

// Check if bookmark should be visible based on language
function isBookmarkVisible(region: 'CN' | 'Global' | null, lang: 'zh' | 'en'): boolean {
  if (region === 'CN' && lang === 'en') return false;
  return true;
}

export default function GroupTabs() {
  const activeGroupId = useAppStore((state) => state.activeGroupId);
  const setActiveGroup = useAppStore((state) => state.setActiveGroup);
  const editMode = useAppStore((state) => state.editMode);
  const isRevealMode = useAppStore((state) => state.isRevealMode);
  const groups = useAppStore((state) => state.groups);
  const bookmarks = useAppStore((state) => state.bookmarks);
  const lang = useCurrentLang();

  // Calculate visible bookmark count for each group
  const getGroupCount = (groupId: string) => {
    return bookmarks.filter((b) => {
      if (b.groupId !== groupId) return false;
      // Check visibility
      if (!isBookmarkVisibleInGroup(b, groupId, isRevealMode)) return false;
      // Language filter
      if (!isBookmarkVisible(b.region, lang)) return false;
      return true;
    }).length;
  };

  // Calculate total visible count
  const totalCount = bookmarks.filter((b) => {
    // Check visibility
    if (!isBookmarkVisibleInGroup(b, b.groupId, isRevealMode)) return false;
    // Language filter
    if (!isBookmarkVisible(b.region, lang)) return false;
    return true;
  }).length;

  // Filter visible groups
  const visibleGroups = groups.filter((g) => !g.hidden || isRevealMode);

  return (
    <div className="bg-white border-b border-gray-100">
      {/* All Tab */}
      <div data-tour="groups" className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
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
          <span>{getText('all', lang)}</span>
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full',
            activeGroupId === null ? 'bg-white/20' : 'bg-gray-200'
          )}>
            {totalCount}
          </span>
        </button>

        {/* Group Tabs */}
        {visibleGroups.map((group) => {
          const meta = groupMeta[group.id] || { icon: '📁', name: { zh: group.name, en: group.name } };
          const displayName = lang === 'en' ? meta.name.en : meta.name.zh;

          return (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all',
                activeGroupId === group.id
                  ? 'bg-[#0f172a] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100',
                group.hidden && !isRevealMode && 'opacity-50'
              )}
            >
              <span>{meta.icon}</span>
              <span>{displayName}</span>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                activeGroupId === group.id ? 'bg-white/20' : 'bg-gray-200'
              )}>
                {getGroupCount(group.id)}
              </span>
            </button>
          );
        })}

        {/* Edit Mode Indicator */}
        {editMode !== 'none' && (
          <span className={cn(
            'px-3 py-1.5 text-xs font-semibold rounded-full',
            editMode === 'group' ? 'text-blue-600 bg-blue-50' : 'text-violet-600 bg-violet-50'
          )}>
            {editMode === 'group' ? getText('groupEditMode', lang) : getText('globalEditMode', lang)}
          </span>
        )}
      </div>
    </div>
  );
}
