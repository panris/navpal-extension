import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getIconGradientClass } from '@/utils/iconHash';
import { useCurrentLang, getText } from '@/utils/i18n';
import AddBookmarkModal from './AddBookmarkModal';

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

export default function EditModal() {
  const editMode = useAppStore((s) => s.editMode);
  const setEditMode = useAppStore((s) => s.setEditMode);
  const deleteBookmarkGlobally = useAppStore((s) => s.deleteBookmarkGlobally);
  const restoreBookmark = useAppStore((s) => s.restoreBookmark);
  const hideBookmarkGlobally = useAppStore((s) => s.hideBookmarkGlobally);
  const showBookmarkGlobally = useAppStore((s) => s.showBookmarkGlobally);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const activeGroupId = useAppStore((s) => s.activeGroupId);
  const lang = useCurrentLang();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (editMode !== 'none') setShowAddModal(false);
  }, [editMode]);

  if (editMode === 'none') return null;

  const handleClose = useCallback(() => setEditMode('none'), [setEditMode]);

  const handleHide = useCallback((bookmarkId: string) => hideBookmarkGlobally(bookmarkId), [hideBookmarkGlobally]);
  const handleShow = useCallback((bookmarkId: string) => showBookmarkGlobally(bookmarkId), [showBookmarkGlobally]);
  const handleDelete = useCallback((bookmarkId: string) => deleteBookmarkGlobally(bookmarkId), [deleteBookmarkGlobally]);
  const handleRestore = useCallback((bookmarkId: string) => restoreBookmark(bookmarkId), [restoreBookmark]);

  const visibleBookmarks = useMemo(() =>
    bookmarks.filter((b) => {
      if (editMode === 'global') return true;
      if (editMode === 'group' && activeGroupId) return b.groupId === activeGroupId;
      return true;
    }),
    [bookmarks, editMode, activeGroupId]
  );

  return (
    <>
      {showAddModal && (
        <AddBookmarkModal onClose={() => setShowAddModal(false)} />
      )}
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header-gradient">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h2>{getText('editBookmarks', lang)}</h2>
                <p style={{ fontSize: '12px', opacity: 0.85, margin: '4px 0 0' }}>
                  {editMode === 'group'
                    ? getText('groupEditHint', lang)
                    : getText('globalEditHint', lang)}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="edit-modal-body">
            {/* Add trigger */}
            <button
              onClick={() => setShowAddModal(true)}
              className="edit-add-trigger"
            >
              <Plus size={18} />
              {getText('addBookmark', lang)}
            </button>

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
                    <div className={`bookmark-row-icon ${getIconGradientClass(bookmark.id)}`}>
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
    </>
  );
}
