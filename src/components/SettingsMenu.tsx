import { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Plus, Trash2, Edit3, Upload, Download } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppStore } from '@/stores/appStore';
import { exportData, validateImportData, downloadJson, readJsonFile } from '@/utils/importExport';
import { useCurrentLang, getText, LANG_OPTIONS, getLangOptionLabel } from '@/utils/i18n';
import type { LangPref } from './BookmarkCard';

interface SettingsMenuProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
  isMinimized?: boolean;
}

// Group icon options
const GROUP_EMOJIS = ['🤖', '💻', '🎨', '📋', '🎬', '🔧', '🎵', '🌐', '📁', '⭐'];

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
  const lang = useCurrentLang();

  const langPref = useAppStore((s) => s.langPref);
  const setLangPref = useAppStore((s) => s.setLangPref);
  const groups = useAppStore((s) => s.groups);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const settings = useAppStore((s) => s.settings);
  const addGroup = useAppStore((s) => s.addGroup);
  const updateGroup = useAppStore((s) => s.updateGroup);
  const deleteGroup = useAppStore((s) => s.deleteGroup);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [groupEdit, setGroupEdit] = useState<GroupEditState | null>(null);
  const [importMsg, setImportMsg] = useState('');

  // Close menu when clicking outside
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

  // ─── Group Management ───────────────────────────────────────
  const handleAddGroup = () => {
    if (!groupEdit) return;
    const name = groupEdit.name.trim();
    if (!name) return;
    addGroup(name, groupEdit.emoji);
    setGroupEdit(null);
  };

  const handleSaveGroup = () => {
    if (!groupEdit?.id) return;
    const name = groupEdit.name.trim();
    if (!name) return;
    updateGroup(groupEdit.id, { name, icon: groupEdit.emoji });
    setGroupEdit(null);
  };

  const handleDeleteGroup = (id: string) => {
    const count = bookmarks.filter((b) => b.groupId === id).length;
    const msg = lang === 'zh'
      ? `分组下有 ${count} 个书签，确定删除？`
      : `This group has ${count} bookmarks. Delete anyway?`;
    if (count > 0 && !confirm(msg)) return;
    deleteGroup(id);
    setGroupEdit(null);
  };

  // ─── Import / Export ─────────────────────────────────────────
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
        setTimeout(() => setImportMsg(''), 3000);
        return;
      }
      // Merge: keep existing, add new
      updateSettings({ ...data!.settings });
      // Add missing groups
      const existingIds = new Set(groups.map((g) => g.id));
      data!.groups.forEach((g) => {
        if (!existingIds.has(g.id)) addGroup(g.name, g.icon);
      });
      setImportMsg(getText('importSuccess', lang));
      setTimeout(() => setImportMsg(''), 3000);
    } catch (e) {
      const msg = lang === 'zh' ? '导入失败，请检查文件格式' : 'Import failed, please check file format';
      setImportMsg(msg);
      setTimeout(() => setImportMsg(''), 3000);
    }
  }, [groups, addGroup, updateSettings, lang]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
    e.target.value = '';
  };

  // Compute storage usage
  const storageKB = (() => {
    const data = { groups, bookmarks, settings };
    return (new Blob([JSON.stringify(data)]).size / 1024).toFixed(1);
  })();
  const storagePercent = ((parseFloat(storageKB) / 100) * 100).toFixed(0);

  // Tab labels
  const tabLabels: Record<'main' | 'groups' | 'data', string> = {
    main: getText('window', lang),
    groups: getText('groups', lang),
    data: getText('data', lang),
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Settings Button */}
      <button
        data-tour="settings"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 text-white transition-all hover:bg-white/25',
          isOpen && 'bg-white/25'
        )}
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* Window Controls + Tab Nav */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex gap-1">
              {(['main', 'groups', 'data'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                    tab === t
                      ? 'bg-violet-500 text-white'
                      : 'text-gray-500 hover:bg-gray-200'
                  )}
                >
                  {tabLabels[t]}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setIsOpen(false); setTab('main'); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          {/* ─── Main Tab ─────────────────────────────────────────── */}
          {tab === 'main' && (
            <div className="p-4 space-y-5">
              {/* Window Controls */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-2">{getText('windowControls', lang)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { isMinimized ? onRestore?.() : onMinimize?.(); setIsOpen(false); }}
                    className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    {isMinimized ? getText('expand', lang) : getText('minimize', lang)}
                  </button>
                  <button
                    onClick={() => { onMaximize?.(); setIsOpen(false); }}
                    className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    {getText('maximize', lang)}
                  </button>
                </div>
              </div>

              {/* Language */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-2">{getText('interfaceLanguage', lang)}</p>
                <div className="space-y-1">
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleLangChange(opt.value)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                        langPref === opt.value
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span className="font-medium">{getLangOptionLabel(opt, lang)}</span>
                      {langPref === opt.value && (
                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Groups Tab ────────────────────────────────────────── */}
          {tab === 'groups' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase">{getText('groupManagement', lang)}</p>
                {!groupEdit && (
                  <button
                    onClick={() => setGroupEdit({ name: '', emoji: '📁' })}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg"
                  >
                    <Plus className="w-3 h-3" /> {getText('newGroup', lang)}
                  </button>
                )}
              </div>

              {/* Add/Edit Form */}
              {groupEdit && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex gap-2 items-center">
                    <select
                      value={groupEdit.emoji}
                      onChange={(e) => setGroupEdit({ ...groupEdit, emoji: e.target.value })}
                      className="w-12 h-9 text-center border border-gray-200 rounded-lg text-lg"
                    >
                      {GROUP_EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder={getText('groupName', lang)}
                      value={groupEdit.name}
                      onChange={(e) => setGroupEdit({ ...groupEdit, name: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') groupEdit.id ? handleSaveGroup() : handleAddGroup(); }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={groupEdit.id ? handleSaveGroup : handleAddGroup}
                      className="flex-1 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg"
                    >
                      {groupEdit.id ? getText('save', lang) : getText('add', lang)}
                    </button>
                    <button
                      onClick={() => setGroupEdit(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      {getText('cancel', lang)}
                    </button>
                  </div>
                </div>
              )}

              {/* Group List */}
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {groups.map((group) => {
                  const count = bookmarks.filter((b) => b.groupId === group.id).length;
                  return (
                    <div key={group.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                      <span className="text-base flex-shrink-0">{group.icon || '📁'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{group.name}</div>
                        <div className="text-xs text-gray-400">{count} {getText('groupCount', lang)}</div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setGroupEdit({ id: group.id, name: group.name, emoji: group.icon || '📁' })}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600"
                          title={getText('edit', lang)}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                          title={getText('deleteAction', lang)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            <div className="p-4 space-y-4">
              <p className="text-xs font-medium text-gray-400 uppercase">{getText('dataManagement', lang)}</p>

              {/* Storage Usage */}
              <div className="px-3 py-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{getText('storageUsage', lang)}</span>
                  <span className="text-xs text-gray-500">{storageKB} KB / 100 KB</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      parseFloat(storagePercent) >= 90 ? 'bg-red-500' : parseFloat(storagePercent) >= 70 ? 'bg-amber-500' : 'bg-violet-500'
                    )}
                    style={{ width: `${Math.min(parseFloat(storagePercent), 100)}%` }}
                  />
                </div>
              </div>

              {/* Export */}
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 text-violet-500" />
                {getText('exportBackup', lang)}
                <span className="ml-auto text-xs text-gray-400">JSON</span>
              </button>

              {/* Import */}
              <div>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Upload className="w-4 h-4 text-emerald-500" />
                  {getText('importRestore', lang)}
                  <span className="ml-auto text-xs text-gray-400">JSON</span>
                </button>
                {importMsg && (
                  <p className={cn('mt-2 text-xs font-medium', importMsg.includes('成功') || importMsg.includes('successful') ? 'text-emerald-600' : 'text-red-500')}>
                    {importMsg}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
