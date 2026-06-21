import { useMemo } from 'react';
import { Sparkles, Code, Palette, Briefcase, Wrench, Music, Gamepad2 } from 'lucide-react';
import { useAppStore, isBookmarkVisibleInGroup, getGroupDisplayName } from '@/stores/appStore';
import { cn } from '@/utils/cn';
import { useCurrentLang, getText } from '@/utils/i18n';
import { isBookmarkVisible } from '@/utils/bookmarkVisibility';

function getGroupIcon(icon: string | undefined): React.ReactNode {
  switch (icon) {
    case 'sparkles': return <Sparkles size={16} />;
    case 'code': return <Code size={16} />;
    case 'palette': return <Palette size={16} />;
    case 'briefcase': return <Briefcase size={16} />;
    case 'wrench': return <Wrench size={16} />;
    case 'music': return <Music size={16} />;
    case 'gamepad-2': return <Gamepad2 size={16} />;
    default: return '📁';
  }
}

export default function GroupTabs() {
  const activeGroupId = useAppStore((state) => state.activeGroupId);
  const setActiveGroup = useAppStore((state) => state.setActiveGroup);
  const editMode = useAppStore((state) => state.editMode);
  const isRevealMode = useAppStore((state) => state.isRevealMode);
  const groups = useAppStore((state) => state.groups);
  const bookmarks = useAppStore((state) => state.bookmarks);
  const lang = useCurrentLang();

  // Pre-compute group counts in a single pass (avoids O(N×G) filter operations)
  const groupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of bookmarks) {
      if (!isBookmarkVisibleInGroup(b, b.groupId, isRevealMode)) continue;
      if (!isBookmarkVisible(b.region, lang)) continue;
      counts.set(b.groupId, (counts.get(b.groupId) ?? 0) + 1);
    }
    return counts;
  }, [bookmarks, isRevealMode, lang]);

  const totalCount = useMemo(() =>
    bookmarks.filter((b) => {
      if (!isBookmarkVisibleInGroup(b, b.groupId, isRevealMode)) return false;
      if (!isBookmarkVisible(b.region, lang)) return false;
      return true;
    }).length,
  [bookmarks, isRevealMode, lang]);

  const visibleGroups = groups.filter((g) => !g.hidden || isRevealMode);

  return (
    <div className="group-tabs" data-tour="groups">
      <div className="tabs-scroll">
        {/* All Tab */}
        <button
          onClick={() => setActiveGroup(null)}
          className={cn('group-tab', activeGroupId === null && 'active')}
        >
          <span>✨</span>
          <span>{getText('all', lang)}</span>
          <span className="count-badge">{totalCount}</span>
        </button>

        {/* Group Tabs */}
        {visibleGroups.map((group) => {
          return (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={cn('group-tab', activeGroupId === group.id && 'active', group.hidden && !isRevealMode && 'opacity-50')}
            >
              <span>{getGroupIcon(group.icon)}</span>
              <span>{getGroupDisplayName(group, lang)}</span>
              <span className="count-badge">{groupCounts.get(group.id) ?? 0}</span>
            </button>
          );
        })}

        {/* Edit Mode Indicator */}
        {editMode !== 'none' && (
          <span className={cn('group-tab text-xs')}>
            {editMode === 'group' ? getText('groupEditMode', lang) : getText('globalEditMode', lang)}
          </span>
        )}
      </div>
    </div>
  );
}
