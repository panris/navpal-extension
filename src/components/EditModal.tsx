import { useState, useEffect, useRef } from 'react';
import { X, Plus, AlertCircle, RotateCcw, Trash2 } from 'lucide-react';
import { useAppStore, getGroupDisplayName } from '@/stores/appStore';
import { normalizeUrl, autoDetectRegion } from '@/utils';
import { ICON_GRADIENTS } from './BookmarkCard';
import { useCurrentLang, getText } from '@/utils/i18n';

function getGradientClass(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % ICON_GRADIENTS.length;
  return `bg-gradient-to-br ${ICON_GRADIENTS[index].bg}`;
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

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

export default function EditModal() {
  const editMode = useAppStore((s) => s.editMode);
  const setEditMode = useAppStore((s) => s.setEditMode);
  const addBookmark = useAppStore((s) => s.addBookmark);
  const deleteBookmarkGlobally = useAppStore((s) => s.deleteBookmarkGlobally);
  const restoreBookmark = useAppStore((s) => s.restoreBookmark);
  const hideBookmarkGlobally = useAppStore((s) => s.hideBookmarkGlobally);
  const showBookmarkGlobally = useAppStore((s) => s.showBookmarkGlobally);
  const groups = useAppStore((s) => s.groups);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const activeGroupId = useAppStore((s) => s.activeGroupId);
  const lang = useCurrentLang();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescZh, setNewDescZh] = useState('');
  const [newDescEn, setNewDescEn] = useState('');
  const [newRegion, setNewRegion] = useState<'CN' | 'Global' | null>(null);
  const [selectedGroup, setSelectedGroup] = useState(activeGroupId || groups[0]?.id || '');
  const [urlError, setUrlError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode === 'group' && activeGroupId) {
      setSelectedGroup(activeGroupId);
    }
  }, [activeGroupId, editMode]);

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
    if (!newTitle.trim()) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    const url = normalizeUrl(newUrl.trim());

    addBookmark({
      title: newTitle.trim(),
      url,
      description: newDescZh.trim() || newDescEn.trim()
        ? { zh: newDescZh.trim() || newTitle.trim(), en: newDescEn.trim() || newTitle.trim() }
        : undefined,
      region: newRegion,
      regionManual: newRegion !== null,
      hidden: false,
      groupId: selectedGroup,
    });

    setNewTitle('');
    setNewUrl('');
    setNewDescZh('');
    setNewDescEn('');
    setNewRegion(null);
    setUrlError('');
    setShowAddForm(false);
    setIsSubmitting(false);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setNewTitle('');
    setNewUrl('');
    setNewDescZh('');
    setNewDescEn('');
    setNewRegion(null);
    setUrlError('');
  };

  const handleClose = () => setEditMode('none');

  const handleHide = (bookmarkId: string) => hideBookmarkGlobally(bookmarkId);
  const handleShow = (bookmarkId: string) => showBookmarkGlobally(bookmarkId);
  const handleDelete = (bookmarkId: string) => deleteBookmarkGlobally(bookmarkId);
  const handleRestore = (bookmarkId: string) => restoreBookmark(bookmarkId);

  const visibleBookmarks = bookmarks.filter((b) => {
    if (editMode === 'global') return true;
    if (editMode === 'group' && activeGroupId) return b.groupId === activeGroupId;
    return true;
  });

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-gradient">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2>{getText('editBookmarks', lang)}</h2>
              <p style={{ fontSize: '12px', opacity: 0.85, margin: '4px 0 0' }}>
                {editMode === 'group' ? getText('groupEditHint', lang) : getText('globalEditHint', lang)}
              </p>
            </div>
            <button className="modal-close-btn" onClick={handleClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="edit-modal-body">
          {/* Add Form */}
          {showAddForm ? (
            <div className="edit-form-divider">
              <input
                type="text"
                placeholder={getText('bookmarkTitle', lang)}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="edit-form-field"
                maxLength={60}
              />
              <div style={{ position: 'relative', marginTop: '12px' }}>
                <input
                  ref={urlInputRef}
                  type="text"
                  placeholder={getText('urlPlaceholder', lang)}
                  value={newUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddBookmark(); }}
                  className={`edit-form-field${urlError ? ' error' : ''}`}
                  style={{ paddingRight: '36px' }}
                />
                {urlError && (
                  <AlertCircle
                    size={16}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--danger-color)', pointerEvents: 'none' }}
                  />
                )}
              </div>
              {urlError && (
                <p className="edit-form-error">
                  <AlertCircle size={12} />
                  {urlError}
                </p>
              )}
              <textarea
                placeholder={getText('chineseDesc', lang)}
                value={newDescZh}
                onChange={(e) => setNewDescZh(e.target.value)}
                className="edit-form-field"
                style={{ resize: 'none', marginTop: '12px' }}
                rows={2}
                maxLength={200}
              />
              <textarea
                placeholder={getText('englishDesc', lang)}
                value={newDescEn}
                onChange={(e) => setNewDescEn(e.target.value)}
                className="edit-form-field"
                style={{ resize: 'none', marginTop: '12px' }}
                rows={2}
                maxLength={400}
              />
              <select
                value={newRegion ?? ''}
                onChange={(e) => setNewRegion(e.target.value ? (e.target.value as 'CN' | 'Global') : null)}
                className="edit-form-select"
                style={{ marginTop: '12px' }}
              >
                <option value="">{getText('regionAuto', lang)}</option>
                <option value="CN">{getText('regionCN', lang)}</option>
                <option value="Global">{getText('regionGlobal', lang)}</option>
              </select>
              {editMode === 'group' ? (
                <div className="edit-form-group-display" style={{ marginTop: '12px' }}>
                  {groups.find((g) => g.id === activeGroupId)?.name || ''}
                </div>
              ) : (
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="edit-form-select"
                  style={{ marginTop: '12px' }}
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {getGroupDisplayName(group, lang)}
                    </option>
                  ))}
                </select>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={handleAddBookmark}
                  disabled={isSubmitting || !!urlError || !newTitle.trim() || !newUrl.trim()}
                  className="edit-btn-add"
                  style={{ flex: 1 }}
                >
                  <Plus size={16} />
                  {isSubmitting ? getText('addInProgress', lang) : getText('addBookmark', lang)}
                </button>
                <button onClick={handleCloseForm} className="edit-btn-cancel">
                  {getText('cancel', lang)}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="edit-add-trigger"
            >
              <Plus size={18} />
              {getText('addBookmark', lang)}
            </button>
          )}

          {/* Bookmark List */}
          <div>
            {visibleBookmarks.map((bookmark) => {
              const isDeleted = bookmark.deletedAt != null;
              const isHidden = bookmark.hidden;

              return (
                <div
                  key={bookmark.id}
                  className={`bookmark-row${isDeleted ? ' deleted' : ''}`}
                >
                  <div className={`bookmark-row-icon ${getGradientClass(bookmark.id)}`}>
                    {truncate(bookmark.title, 1)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="bookmark-row-title" title={bookmark.title}>
                      {truncate(bookmark.title, 20)}
                    </div>
                    <div className="bookmark-row-url" title={bookmark.url}>
                      {truncate(bookmark.url.replace('https://', '').replace('http://', ''), 30)}
                    </div>
                    {isDeleted && (
                      <span className="badge-deleted">
                        <Trash2 size={11} />
                        {getText('deletedBadge', lang)}
                      </span>
                    )}
                    {isHidden && !isDeleted && (
                      <span className="badge-hidden">
                        <span>🔒</span>
                        {getText('hideAction', lang)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {(isDeleted || isHidden) ? (
                      <button
                        onClick={() => isDeleted ? handleRestore(bookmark.id) : handleShow(bookmark.id)}
                        className="row-action-btn restore"
                        title={isDeleted ? getText('restore', lang) : getText('show', lang)}
                      >
                        <RotateCcw size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleHide(bookmark.id)}
                        className="row-action-btn hide"
                        title={getText('hideAction', lang)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      </button>
                    )}
                    {editMode === 'global' && !isDeleted && (
                      <button
                        onClick={() => handleDelete(bookmark.id)}
                        className="row-action-btn delete"
                        title={getText('deleteAction', lang)}
                      >
                        <Trash2 size={15} />
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
