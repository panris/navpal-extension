import { useState, useRef, useEffect } from 'react';
import { X, Plus, AlertCircle, Edit3 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { normalizeUrl, autoDetectRegion, isValidUrl } from '@/utils';
import { ICON_GRADIENTS } from './BookmarkCard';
import { subscribeLang } from '@/stores/appStore';
import { cn } from '@/utils/cn';

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
function validateUrl(url: string): { valid: boolean; message: string } {
  if (!url.trim()) return { valid: false, message: '请输入网址' };
  try {
    const normalized = normalizeUrl(url.trim());
    const parsed = new URL(normalized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, message: '仅支持 http/https 链接' };
    }
    return { valid: true, message: '' };
  } catch {
    return { valid: false, message: '网址格式不正确' };
  }
}

// Bookmark item for editing
interface EditingBookmark {
  id: string;
  title: string;
  url: string;
  descriptionEn: string;
  descriptionZh: string;
}

export default function EditModal() {
  const isEditMode = useAppStore((s) => s.isEditMode);
  const toggleEditMode = useAppStore((s) => s.toggleEditMode);
  const addBookmark = useAppStore((s) => s.addBookmark);
  const deleteBookmark = useAppStore((s) => s.deleteBookmark);
  const updateBookmark = useAppStore((s) => s.updateBookmark);
  const groups = useAppStore((s) => s.groups);
  const bookmarks = useAppStore((s) => s.bookmarks);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || '');
  const [urlError, setUrlError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editing state for existing bookmarks
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditingBookmark>({
    id: '',
    title: '',
    url: '',
    descriptionEn: '',
    descriptionZh: '',
  });

  const urlInputRef = useRef<HTMLInputElement>(null);
  const editFormRef = useRef<HTMLDivElement>(null);

  // Language state for descriptions
  const [formLang, setFormLang] = useState<'zh' | 'en'>('zh');

  // Subscribe to language changes
  useEffect(() => {
    const unsubscribe = subscribeLang((lang) => {
      setFormLang(lang);
    });
    return unsubscribe;
  }, []);

  if (!isEditMode) return null;

  const handleUrlChange = (value: string) => {
    setNewUrl(value);
    if (value.trim()) {
      const { valid, message } = validateUrl(value);
      setUrlError(valid ? '' : message);
    } else {
      setUrlError('');
    }
  };

  const handleAddBookmark = () => {
    const { valid } = validateUrl(newUrl);
    if (!valid) {
      setUrlError(validateUrl(newUrl).message);
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

  // Start editing a bookmark
  const handleStartEdit = (bookmark: typeof bookmarks[0]) => {
    setEditingId(bookmark.id);
    setEditForm({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      descriptionEn: bookmark.description?.en || '',
      descriptionZh: bookmark.description?.zh || '',
    });
  };

  // Save bookmark edits
  const handleSaveEdit = () => {
    if (!editForm.title.trim()) return;

    const updates: Partial<typeof bookmarks[0]> = {
      title: editForm.title.trim(),
    };

    // Only update description if at least one language is filled
    if (editForm.descriptionEn.trim() || editForm.descriptionZh.trim()) {
      updates.description = {
        en: editForm.descriptionEn.trim(),
        zh: editForm.descriptionZh.trim(),
      };
    }

    updateBookmark(editForm.id, updates);
    setEditingId(null);
    setEditForm({ id: '', title: '', url: '', descriptionEn: '', descriptionZh: '' });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ id: '', title: '', url: '', descriptionEn: '', descriptionZh: '' });
  };

  return (
    <div
      className="fixed inset-0 modal-overlay flex items-center justify-center z-50"
      onClick={toggleEditMode}
    >
      <div
        className="modal-content w-[340px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header-gradient px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">编辑书签</h2>
              <p className="text-xs opacity-80 mt-0.5">添加、隐藏或删除书签</p>
            </div>
            <button
              onClick={toggleEditMode}
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
                placeholder="书签标题"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                maxLength={60}
              />
              <div className="relative">
                <input
                  ref={urlInputRef}
                  type="text"
                  placeholder="网址 https://..."
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
              <div className="flex gap-3">
                <button
                  onClick={handleAddBookmark}
                  disabled={isSubmitting || !!urlError || !newTitle.trim() || !newUrl.trim()}
                  className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '添加中…' : '添加书签'}
                </button>
                <button
                  onClick={handleCloseForm}
                  className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-6 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              添加新书签
            </button>
          )}

          {/* Bookmark List */}
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id}>
                {/* Edit Form */}
                {editingId === bookmark.id ? (
                  <div ref={editFormRef} className="p-4 bg-gray-50 rounded-xl border border-violet-200 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit3 className="w-4 h-4 text-violet-500" />
                      <span className="text-sm font-medium text-gray-700">编辑书签</span>
                    </div>
                    <input
                      type="text"
                      placeholder="标题"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none"
                      autoFocus
                    />
                    <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded-lg break-all">
                      {editForm.url}
                    </div>
                    <textarea
                      placeholder="英文介绍 (English description)"
                      value={editForm.descriptionEn}
                      onChange={(e) => setEditForm({ ...editForm, descriptionEn: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none resize-none"
                      rows={2}
                    />
                    <textarea
                      placeholder="中文介绍"
                      value={editForm.descriptionZh}
                      onChange={(e) => setEditForm({ ...editForm, descriptionZh: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg hover:shadow-md transition-all"
                      >
                        保存
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal Display */
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 ${getGradientClass(bookmark.id)}`}
                    >
                      {truncate(bookmark.title, 1)}
                    </div>

                    {/* Info - truncate long text */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate" title={bookmark.title}>
                        {truncate(bookmark.title, 20)}
                      </div>
                      <div className="text-xs text-gray-500 truncate" title={bookmark.url}>
                        {truncate(bookmark.url.replace('https://', '').replace('http://', ''), 30)}
                      </div>
                      {/* Description preview */}
                      {(bookmark.description?.en || bookmark.description?.zh) && (
                        <div className="text-[10px] text-violet-500 truncate mt-0.5">
                          📝 {(formLang === 'en' && bookmark.description?.en) || bookmark.description?.zh || ''}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(bookmark)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-violet-600 hover:bg-violet-50 transition-colors"
                        title="编辑"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateBookmark(bookmark.id, { hidden: !bookmark.hidden })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
                        title={bookmark.hidden ? '显示' : '隐藏'}
                      >
                        {bookmark.hidden ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => deleteBookmark(bookmark.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                        title="删除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}