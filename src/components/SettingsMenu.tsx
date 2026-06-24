import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Settings, Plus, Trash2, Edit3, Download, Upload, Sparkles, Code, Palette, Briefcase, Wrench, Music, Gamepad2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppStore, type ThemeName, getGroupDisplayName } from '@/stores/appStore';
import { exportData, validateImportData, downloadJson, readJsonFile } from '@/utils/importExport';
import { useCurrentLang, getText, LANG_OPTIONS, getLangOptionLabel } from '@/utils/i18n';
import ConfirmModal from './ConfirmModal';
import type { LangPref } from '@/types';

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

interface SettingsMenuProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
  isMinimized?: boolean;
}

const GROUP_EMOJIS = ['🤖', '💻', '🎨', '📋', '🎬', '🔧', '🎵', '🌐', '📁', '⭐'];

const THEMES: { id: ThemeName; name: string; preview: string }[] = [
  { id: 'light', name: 'Light', preview: '☀️' },
  { id: 'dark', name: 'Dark', preview: '🌙' },
  { id: 'purple', name: 'Purple', preview: '💜' },
  { id: 'minimal', name: 'Minimal', preview: '⬜' },
];

interface GroupEditState {
  id?: string;
  name: string;
  emoji: string;
}

export default function SettingsMenu({ onMinimize, onMaximize, onRestore, isMinimized }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'main' | 'groups' | 'data'>('main');
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevFocusRef = useRef<Element | null>(null);
  const lang = useCurrentLang();

  const langPref = useAppStore((s) => s.langPref);
  const setLangPref = useAppStore((s) => s.setLangPref);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const groups = useAppStore((s) => s.groups);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const settings = useAppStore((s) => s.settings);
  const addGroup = useAppStore((s) => s.addGroup);
  const updateGroup = useAppStore((s) => s.updateGroup);
  const deleteGroup = useAppStore((s) => s.deleteGroup);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const replaceAllBookmarks = useAppStore((s) => s.replaceAllBookmarks);

  const [groupEdit, setGroupEdit] = useState<GroupEditState | null>(null);
  const [importMsg, setImportMsg] = useState('');
  const [importMsgType, setImportMsgType] = useState<'success' | 'error' | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; count: number } | null>(null);

  // Memoize group bookmark counts to avoid repeated filter calls
  const groupBookmarkCounts = useMemo(() => {
    const counts = new Map<string, number>();
    bookmarks.forEach((b) => {
      counts.set(b.groupId, (counts.get(b.groupId) || 0) + 1);
    });
    return counts;
  }, [bookmarks]);

  // Focus trap: save focus on open, move to first menu item, restore on close
  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement;
      // Focus first focusable element in menu
      const first = menuRef.current?.querySelector<HTMLButtonElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      first?.focus();
    } else {
      // Restore focus when menu closes
      if (prevFocusRef.current instanceof HTMLElement) {
        prevFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setTab('main');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangChange = (pref: LangPref) => {
    setLangPref(pref);
  };

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
  };

  const handleAddGroup = () => {
    if (!groupEdit) return;
    const name = groupEdit.name.trim();
    if (!name) return;
    const nameI18n = { zh: lang === 'zh' ? name : '', en: lang === 'en' ? name : '' };
    addGroup(name, groupEdit.emoji, nameI18n);
    setGroupEdit(null);
  };

  const handleSaveGroup = () => {
    if (!groupEdit?.id) return;
    const name = groupEdit.name.trim();
    if (!name) return;
    const group = groups.find((g) => g.id === groupEdit.id);
    const existing = group?.nameI18n || { zh: '', en: '' };
    const nameI18n = { ...existing, [lang]: name };
    updateGroup(groupEdit.id, { name, icon: groupEdit.emoji, nameI18n });
    setGroupEdit(null);
  };

  const handleDeleteGroup = (id: string) => {
    const count = groupBookmarkCounts.get(id) || 0;
    const group = groups.find((g) => g.id === id);
    const name = group ? getGroupDisplayName(group, lang) : id;
    if (count > 0) {
      setDeleteConfirm({ id, name, count });
      return;
    }
    deleteGroup(id);
    setGroupEdit(null);
  };

  const handleExport = useCallback(() => {
    const json = exportData(groups, bookmarks, settings);
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(json, `navpal-backup-${date}.json`);
  }, [groups, bookmarks, settings]);

  const handleImport = useCallback(async (file: File) => {
    try {
      const raw = await readJsonFile(file);
      const { valid, data, error } = validateImportData(raw);
      if (!valid) {
        const msg = lang === 'zh' ? `导入失败: ${error}` : `Import failed: ${error}`;
        setImportMsg(msg);
        setImportMsgType('error');
        setTimeout(() => { setImportMsg(''); setImportMsgType(null); }, 3000);
        return;
      }
      updateSettings({ ...data!.settings });
      const existingGroupIds = new Set(groups.map((g) => g.id));
      data!.groups.forEach((g) => {
        if (!existingGroupIds.has(g.id)) addGroup(g.name, g.icon, g.nameI18n);
      });
      const existingBookmarkIds = new Set(bookmarks.map((b) => b.id));
      const importedBookmarks = data!.bookmarks.filter((b) => !existingBookmarkIds.has(b.id));
      if (importedBookmarks.length > 0) {
        replaceAllBookmarks([...bookmarks, ...importedBookmarks]);
      }
      const count = data!.bookmarks.length;
      setImportMsg(
        lang === 'zh'
          ? `导入成功！${count} 个书签已恢复`
          : `Import successful! ${count} bookmark(s) restored`
      );
      setImportMsgType('success');
      setTimeout(() => { setImportMsg(''); setImportMsgType(null); }, 3000);
    } catch {
      const msg = `${getText('importFailed', lang)}, please check file format`;
      setImportMsg(msg);
      setImportMsgType('error');
      setTimeout(() => { setImportMsg(''); setImportMsgType(null); }, 3000);
    }
  }, [groups, bookmarks, addGroup, updateSettings, replaceAllBookmarks, lang]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
    e.target.value = '';
  };

  const storageKB = useMemo(() => {
    const data = { groups, bookmarks, settings };
    return (new Blob([JSON.stringify(data)]).size / 1024).toFixed(1);
  }, [groups, bookmarks, settings]);

  const tabLabels: Record<'main' | 'groups' | 'data', string> = {
    main: getText('appearance', lang),
    groups: getText('groups', lang),
    data: getText('data', lang),
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Settings Button */}
      <button
        data-tour="settings"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="header-btn"
      >
        <Settings size={16} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="settings-dropdown">
          {/* Tabs */}
          <div className="settings-tabs">
            {(['main', 'groups', 'data'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn('settings-tab', tab === t && 'active')}
              >
                {tabLabels[t]}
              </button>
            ))}
          </div>

          {/* ─── Main Tab: Theme + Language ───────────────────────── */}
          {tab === 'main' && (
            <div className="settings-section">
              {/* Theme Selector */}
              <p className="settings-section-title">{getText('theme', lang)}</p>
              <div className="theme-grid">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    data-theme={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={cn('theme-option', theme === t.id && 'active')}
                  >
                    <div className="theme-preview" />
                    <span className="theme-name">{t.preview} {t.name}</span>
                  </button>
                ))}
              </div>

              {/* Window Controls */}
              <p className="settings-section-title" style={{ marginTop: '16px' }}>{getText('windowControls', lang)}</p>
              <div className="settings-row">
                <button
                  onClick={() => { isMinimized ? onRestore?.() : onMinimize?.(); setIsOpen(false); }}
                  className="settings-btn"
                >
                  {isMinimized ? getText('expand', lang) : getText('minimize', lang)}
                </button>
                <button
                  onClick={() => { onMaximize?.(); setIsOpen(false); }}
                  className="settings-btn"
                >
                  {getText('maximize', lang)}
                </button>
              </div>

              {/* Language */}
              <p className="settings-section-title" style={{ marginTop: '16px' }}>{getText('interfaceLanguage', lang)}</p>
              <div className="flex flex-col gap-1">
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleLangChange(opt.value)}
                    className={cn('lang-option', langPref === opt.value && 'active')}
                  >
                    <span className="lang-icon">{opt.icon}</span>
                    <span className="lang-name">{getLangOptionLabel(opt, lang)}</span>
                    {langPref === opt.value && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Groups Tab ────────────────────────────────────────── */}
          {tab === 'groups' && (
            <div className="settings-section">
              <div className="flex items-center justify-between mb-3">
                <p className="settings-section-title mb-0">{getText('groupManagement', lang)}</p>
                {!groupEdit && (
                  <button
                    onClick={() => setGroupEdit({ name: '', emoji: '📁' })}
                    className="settings-btn primary"
                    style={{ padding: '6px 12px' }}
                  >
                    <Plus size={14} className="inline mr-1" />
                    {getText('newGroup', lang)}
                  </button>
                )}
              </div>

              {/* Add/Edit Form */}
              {groupEdit && (
                <div className="mb-3 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="flex gap-2 items-center mb-2">
                    <select
                      value={groupEdit.emoji}
                      onChange={(e) => setGroupEdit({ ...groupEdit, emoji: e.target.value })}
                      className="w-10 h-9 text-center border rounded-md text-base"
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    >
                      {GROUP_EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder={getText('groupName', lang)}
                      value={groupEdit.name}
                      onChange={(e) => setGroupEdit({ ...groupEdit, name: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') groupEdit.id ? handleSaveGroup() : handleAddGroup(); }}
                      className="form-input"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={groupEdit.id ? handleSaveGroup : handleAddGroup} className="settings-btn primary">
                      {groupEdit.id ? getText('save', lang) : getText('add', lang)}
                    </button>
                    <button onClick={() => setGroupEdit(null)} className="settings-btn">
                      {getText('cancel', lang)}
                    </button>
                  </div>
                </div>
              )}

              {/* Group List */}
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {groups.map((group) => {
                  const count = groupBookmarkCounts.get(group.id) || 0;
                  return (
                    <div key={group.id} className="settings-group-row">
                      <span className="text-base">{getGroupIcon(group.icon)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{getGroupDisplayName(group, lang)}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{count} {getText('groupCount', lang)}</div>
                      </div>
                      <div className="group-actions flex gap-1">
                        <button
                          onClick={() => setGroupEdit({ id: group.id, name: group.nameI18n?.[lang] || group.name, emoji: group.icon || '📁' })}
                          className="w-7 h-7 flex items-center justify-center rounded"
                          style={{ color: 'var(--accent-color)' }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="w-7 h-7 flex items-center justify-center rounded"
                          style={{ color: 'var(--danger-color)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Data Tab ──────────────────────────────────────────── */}
          {tab === 'data' && (
            <div className="settings-section">
              <p className="settings-section-title">{getText('dataManagement', lang)}</p>

              {/* Storage */}
              <div className="p-3 rounded-lg mb-3" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{getText('storageUsage', lang)}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{storageKB} KB</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(parseFloat(storageKB), 100)}%`, background: 'var(--accent-color)' }}
                  />
                </div>
              </div>

              {/* Export */}
              <button onClick={handleExport} className="settings-btn mb-2">
                <Download size={14} className="inline mr-2" style={{ color: 'var(--accent-color)' }} />
                {getText('exportBackup', lang)}
                <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>JSON</span>
              </button>

              {/* Import */}
              <div>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="settings-btn">
                  <Upload size={14} className="inline mr-2" style={{ color: 'var(--success-color)' }} />
                  {getText('importRestore', lang)}
                  <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>JSON</span>
                </button>
                {importMsg && (
                  <p role="status" aria-live="polite" className="mt-2 text-xs font-medium" style={{ color: importMsgType === 'success' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {importMsg}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {deleteConfirm && (
        <ConfirmModal
          title={getText('deleteGroup', lang) as string}
          message={
            lang === 'zh'
              ? `「${deleteConfirm.name}」下有 ${deleteConfirm.count} 个书签，删除后书签将保留在「全部」分组。`
              : `"${deleteConfirm.name}" has ${deleteConfirm.count} bookmark(s). Deleting the group will move them to "All".`
          }
          confirmLabel={getText('deleteAction', lang)}
          onConfirm={() => {
            deleteGroup(deleteConfirm.id);
            setGroupEdit(null);
            setDeleteConfirm(null);
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
