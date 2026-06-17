import { Sparkles, Code, Palette, Briefcase, Wrench, Music, Gamepad2 } from 'lucide-react';
import { useAppStore, isBookmarkVisibleInGroup, getGroupDisplayName } from '@/stores/appStore';
import { cn } from '@/utils/cn';
import { useCurrentLang, getText } from '@/utils/i18n';

function isBookmarkVisible(region: 'CN' | 'Global' | null, lang: 'zh' | 'en'): boolean {
  if (region === 'CN' && lang === 'en') return false;
  return true;
}

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

  const getGroupCount = (groupId: string) => {
    return bookmarks.filter((b) => {
      if (b.groupId !== groupId) return false;
      if (!isBookmarkVisibleInGroup(b, groupId, isRevealMode)) return false;
      if (!isBookmarkVisible(b.region, lang)) return false;
      return true;
    }).length;
  };

  const totalCount = bookmarks.filter((b) => {
    if (!isBookmarkVisibleInGroup(b, b.groupId, isRevealMode)) return false;
    if (!isBookmarkVisible(b.region, lang)) return false;
    return true;
  }).length;

  const visibleGroups = groups.filter((g) => !g.hidden || isRevealMode);

  return (
    <div className="group-tabs">
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
              <span className="count-badge">{getGroupCount(group.id)}</span>
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
