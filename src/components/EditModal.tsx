import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { normalizeUrl, autoDetectRegion } from '@/utils';

// Color gradients for icons
const iconGradients = [
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-rose-400 to-amber-500',
  'from-teal-300 to-pink-300',
  'from-rose-400 to-pink-300',
  'from-orange-300 to-peach-400',
  'from-blue-400 to-cyan-300',
  'from-purple-300 to-yellow-200',
];

function getGradientClass(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % iconGradients.length;
  return `bg-gradient-to-br ${iconGradients[index]}`;
}

export default function EditModal() {
  const isEditMode = useAppStore((state) => state.isEditMode);
  const toggleEditMode = useAppStore((state) => state.toggleEditMode);
  const addBookmark = useAppStore((state) => state.addBookmark);
  const deleteBookmark = useAppStore((state) => state.deleteBookmark);
  const updateBookmark = useAppStore((state) => state.updateBookmark);
  const groups = useAppStore((state) => state.groups);
  const bookmarks = useAppStore((state) => state.bookmarks);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || '');

  if (!isEditMode) return null;

  const handleAddBookmark = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

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
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50" onClick={toggleEditMode}>
      <div className="modal-content w-[340px] max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
              <input
                type="text"
                placeholder="书签标题"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
              />
              <input
                type="text"
                placeholder="网址 https://..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
              />
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
                  className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold"
                >
                  添加书签
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTitle('');
                    setNewUrl('');
                  }}
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
              <div
                key={bookmark.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${getGradientClass(bookmark.id)}`}>
                  {bookmark.title.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {bookmark.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {bookmark.url.replace('https://', '').replace('http://', '')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
