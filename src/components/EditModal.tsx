import { useState, useRef } from 'react';
import { X, Plus, AlertCircle, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { normalizeUrl, autoDetectRegion } from '@/utils';
import { ICON_GRADIENTS } from './BookmarkCard';
import { useCurrentLang, getText } from '@/utils/i18n';
import type { EditMode } from '@/types';

// Color gradients for icons
function getGradientClass(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % ICON_GRADIENTS.length;
  return `bg-gradient-to-br ${ICON_GRADIENTS[index].bg}`;
}

// Truncate long text for display
function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

// Validate URL with detailed feedback
function validateUrl(url: string, lang: 'zh' | 'en'): { valid: boolean; message: string } {
  if (!url.trim()) return { valid: false, message: getText('pleaseEnterUrl', lang) };
  try {
    const normalized = normalizeUrl(url.trim());
    const parsed = new URL(normalized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, message: getText('unsupportedProtocol', lang) };
    }
    return { valid: true, message: '' };
  } catch {
    return { valid: false, message: getText('invalidUrlFormat', lang) };
  }
}

// Bookmark item with edit support
interface EditableBookmark {
  id: string;
  title: string;
  url: string;
  description?: { en: string; zh: string };
  hidden: boolean;
  deletedAt?: number | null;
}

function BookmarkItem({ bookmark, onSave, onCancel, lang }: {
  bookmark: EditableBookmark;
  onSave: (updates: { title?: string; description?: { en: string; zh: string } }) => void;
  onCancel: () => void;
  lang: 'zh' | 'en';
}) {
  const [editTitle, setEditTitle] = useState(bookmark.title);
  const [editDescEn, setEditDescEn] = useState(bookmark.description?.en || '');
  const [editDescZh, setEditDescZh] = useState(bookmark.description?.zh || '');

  const handleSave = () => {
    const updates: { title?: string; description?: { en: string; zh: string } } = {};
    if (editTitle.trim() && editTitle !== bookmark.title) {
      updates.title = editTitle.trim();
    }
    if (editDescEn.trim() || editDescZh.trim()) {
      updates.description = { en: editDescEn.trim(), zh: editDescZh.trim() };
    }
    if (Object.keys(updates).length > 0) {
      onSave(updates);
    } else {
      onCancel();
    }
  };

  return (
    <div className="p-3 bg-violet-50 rounded-xl border border-violet-200 space-y-3">
      <div className="flex items-center gap-2">
        <Pencil className="w-4 h-4 text-violet-500 flex-shrink-0" />
        <span className="text-sm font-medium text-violet-700">{getText('edit', lang)}: {bookmark.title}</span>
      </div>
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        placeholder={getText('bookmarkTitle', lang)}
        className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
        maxLength={60}
      />
      <textarea
        value={editDescZh}
        onChange={(e) => setEditDescZh(e.target.value)}
        placeholder={getText('chineseDesc', lang)}
        rows={2}
        className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
      />
      <textarea
        value={editDescEn}
        onChange={(e) => setEditDescEn(e.target.value)}
        placeholder={getText('englishDesc', lang)}
        rows={2}
        className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg hover:shadow-md transition-all"
        >
          {getText('save', lang)}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          {getText('cancel', lang)}
        </button>
      </div>
    </div>
  );
}

export default function EditModal() {
  const editMode = useAppStore((s) => s.editMode);
  const setEditMode = useAppStore((s) => s.setEditMode);
  const addBookmark = useAppStore((s) => s.addBookmark);
  const deleteBookmarkGlobally = useAppStore((s) => s.deleteBookmarkGlobally);
  const restoreBookmark = useAppStore((s) => s.restoreBookmark);
  const hideBookmarkGlobally = useAppStore((s) => s.hideBookmarkGlobally);
  const showBookmarkGlobally = useAppStore((s) => s.showBookmarkGlobally);
  const updateBookmark = useAppStore((s) => s.updateBookmark);
  const groups = useAppStore((s) => s.groups);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const activeGroupId = useAppStore((s) => s.activeGroupId);
  const lang = useCurrentLang();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(activeGroupId || groups[0]?.id || '');
  const [urlError, setUrlError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const urlInputRef = useRef<HTMLInputElement>(null);

  // Only show modal in edit modes
  if (editMode === 'none') return null;

  const handleUrlChange = (value: string) => {
    setNewUrl(value);
    if (value.trim()) {
      const { valid, message } = validateUrl(value, lang);
      setUrlError(valid ? '' : message);
    } else {
      setUrlError('');
    }
  };

  const handleAddBookmark = () => {
    const { valid } = validateUrl(newUrl, lang);
    if (!valid) {
      setUrlError(validateUrl(newUrl, lang).message);
      urlInputRef.current?.focus();
      return;
    }
    if (!newTitle.trim()) {
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const url = normalizeUrl(newUrl.trim());
    const region = autoDetectRegion(url);

    addBookmark({
      title: newTitle.trim(),
      url,
      region,
      regionManual: false,
      hidden: false,
      groupId: selectedGroup,
    });

    setNewTitle('');
    setNewUrl('');
    setUrlError('');
    setShowAddForm(false);
    setIsSubmitting(false);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setNewTitle('');
    setNewUrl('');
    setUrlError('');
  };

  const handleClose = () => {
    setEditMode('none');
  };

  const handleHide = (bookmarkId: string) => {
    hideBookmarkGlobally(bookmarkId);
  };

  const handleShow = (bookmarkId: string) => {
    showBookmarkGlobally(bookmarkId);
  };

  const handleDelete = (bookmarkId: string) => {
    deleteBookmarkGlobally(bookmarkId);
  };

  const handleRestore = (bookmarkId: string) => {
    restoreBookmark(bookmarkId);
  };

  // Filter bookmarks based on mode
  const visibleBookmarks = bookmarks.filter((b) => {
    if (editMode === 'global') {
      // Show all in global mode
      return true;
    }
    if (editMode === 'group' && activeGroupId) {
      // Show bookmarks in current group
      return b.groupId === activeGroupId;
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 modal-overlay flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="modal-content w-[340px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header-gradient px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{getText('editBookmarks', lang)}</h2>
              <p className="text-xs opacity-80 mt-0.5">
                {editMode === 'group' ? getText('groupEditHint', lang) : getText('globalEditHint', lang)}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Add Form */}
          {showAddForm ? (
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
              <input
                type="text"
                placeholder={getText('bookmarkTitle', lang)}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                maxLength={60}
              />
              <div className="relative">
                <input
                  ref={urlInputRef}
                  type="text"
                  placeholder={getText('urlPlaceholder', lang)}
                  value={newUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddBookmark();
                  }}
                  className={`w-full px-4 py-3 pr-10 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    urlError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-violet-500 focus:ring-violet-100'
                  }`}
                />
                {urlError && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                )}
              </div>
              {urlError && (
                <p className="text-xs text-red-500 flex items-center gap-1 -mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {urlError}
                </p>
              )}
              {editMode === 'group' ? (
                <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  {groups.find((g) => g.id === activeGroupId)?.name || ''}
                </div>
              ) : (
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleAddBookmark}
                  disabled={isSubmitting || !!urlError || !newTitle.trim() || !newUrl.trim()}
                  className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? getText('addInProgress', lang) : getText('addBookmark', lang)}
                </button>
                <button
                  onClick={handleCloseForm}
                  className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {getText('cancel', lang)}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-6 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              {getText('addBookmark', lang)}
            </button>
          )}

          {/* Bookmark List */}
          <div className="space-y-2">
            {visibleBookmarks.map((bookmark) => {
              const isDeleted = bookmark.deletedAt !== null && bookmark.deletedAt !== undefined;
              const isHidden = bookmark.hidden;

              return (
                <div
                  key={bookmark.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isDeleted ? 'bg-red-50 opacity-60' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 ${getGradientClass(bookmark.id)}`}
                  >
                    {truncate(bookmark.title, 1)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate" title={bookmark.title}>
                      {truncate(bookmark.title, 20)}
                    </div>
                    <div className="text-xs text-gray-500 truncate" title={bookmark.url}>
                      {truncate(bookmark.url.replace('https://', '').replace('http://', ''), 30)}
                    </div>
                    {/* Status badges */}
                    {isDeleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-medium">
                        <Trash2 className="w-3 h-3" />
                        {getText('deletedBadge', lang)}
                      </span>
                    )}
                    {isHidden && !isDeleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                        <span>🔒</span>
                        {getText('hideAction', lang)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Restore (for deleted) or Show (for hidden) */}
                    {(isDeleted || isHidden) ? (
                      <button
                        onClick={() => isDeleted ? handleRestore(bookmark.id) : handleShow(bookmark.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title={isDeleted ? getText('restore', lang) : getText('show', lang)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleHide(bookmark.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
                        title={getText('hideAction', lang)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
                        </svg>
                      </button>
                    )}
                    {/* Delete (only in global mode) */}
                    {editMode === 'global' && !isDeleted && (
                      <button
                        onClick={() => handleDelete(bookmark.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                        title={getText('deleteAction', lang)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
