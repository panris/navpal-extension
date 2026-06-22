import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { useAppStore, getGroupDisplayName } from '@/stores/appStore';
import { normalizeUrl } from '@/utils';
import { getIconGradientClass } from '@/utils/iconHash';
import { useCurrentLang, getText } from '@/utils/i18n';

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

interface AddBookmarkModalProps {
  onClose: () => void;
}

export default function AddBookmarkModal({ onClose }: AddBookmarkModalProps) {
  const addBookmark = useAppStore((s) => s.addBookmark);
  const groups = useAppStore((s) => s.groups);
  const activeGroupId = useAppStore((s) => s.activeGroupId);
  const editMode = useAppStore((s) => s.editMode);
  const lang = useCurrentLang();

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescZh, setNewDescZh] = useState('');
  const [newDescEn, setNewDescEn] = useState('');
  const [newRegion, setNewRegion] = useState<'CN' | 'Global' | null>(null);
  const [selectedGroup, setSelectedGroup] = useState(activeGroupId || groups[0]?.id || '');
  const [urlError, setUrlError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const urlInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedGroup once on mount if currently empty (handles case where groups load after modal mounts)
  useEffect(() => {
    if (!selectedGroup) {
      if (activeGroupId) setSelectedGroup(activeGroupId);
      else if (groups[0]?.id) setSelectedGroup(groups[0].id);
    }
  }, []); // intentionally runs once

  useEffect(() => {
    urlInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const gradientClass = useMemo(
    () => getIconGradientClass(newUrl || 'navpal'),
    [newUrl]
  );

  const handleUrlChange = (value: string) => {
    setNewUrl(value);
    if (value.trim()) {
      const { valid, message } = validateUrl(value, lang);
      setUrlError(valid ? '' : message);
    } else {
      setUrlError('');
    }
  };

  const handleConfirm = () => {
    const { valid, message } = validateUrl(newUrl, lang);
    if (!valid) {
      setUrlError(message);
      urlInputRef.current?.focus();
      return;
    }
    if (!newTitle.trim()) {
      urlInputRef.current?.focus();
      return;
    }
    // Guard: prevent adding bookmarks when no groups exist
    if (!selectedGroup) {
      return;
    }
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

    onClose();
  };

  const isValid = !urlError && newTitle.trim() && newUrl.trim();

  return (
    <div className="add-modal-overlay" onClick={onClose}>
      <div className="add-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="add-modal-header">
          <span className="add-modal-title">{getText('addBookmark', lang)}</span>
          <button className="add-modal-close" onClick={onClose} title={getText('cancel', lang)}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="add-modal-body">
          {/* Icon + Title + URL row */}
          <div className="add-form-row">
            <div
              className={`add-form-icon ${gradientClass}`}
              title={newTitle || getText('bookmarkTitle', lang)}
            >
              {newTitle ? newTitle.slice(0, 1).toUpperCase() : 'N'}
            </div>
            <div className="add-form-fields">
              <input
                type="text"
                ref={urlInputRef}
                placeholder={getText('urlPlaceholder', lang)}
                value={newUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
                className={`add-form-input${urlError ? ' has-error' : ''}`}
                maxLength={500}
              />
              {urlError && (
                <p className="add-form-error">
                  <AlertCircle size={12} />
                  {urlError}
                </p>
              )}
              <input
                type="text"
                placeholder={getText('bookmarkTitle', lang)}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="add-form-input"
                maxLength={60}
              />
            </div>
          </div>

          {/* Description */}
          <div className="add-form-desc-group">
            <textarea
              placeholder={getText('chineseDesc', lang)}
              value={newDescZh}
              onChange={(e) => setNewDescZh(e.target.value)}
              className="add-form-textarea"
              rows={2}
              maxLength={200}
            />
            <textarea
              placeholder={getText('englishDesc', lang)}
              value={newDescEn}
              onChange={(e) => setNewDescEn(e.target.value)}
              className="add-form-textarea"
              rows={2}
              maxLength={400}
            />
          </div>

          {/* Region + Group */}
          <div className="add-form-row-2col">
            <select
              value={newRegion ?? ''}
              onChange={(e) => setNewRegion(e.target.value ? (e.target.value as 'CN' | 'Global') : null)}
              className="add-form-select"
            >
              <option value="">{getText('regionAuto', lang)}</option>
              <option value="CN">{getText('regionCN', lang)}</option>
              <option value="Global">{getText('regionGlobal', lang)}</option>
            </select>
            {editMode === 'group' ? (
              <div className="add-form-group-display">
                {getGroupDisplayName(
                  groups.find((g) => g.id === activeGroupId) || groups[0],
                  lang
                )}
              </div>
            ) : (
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="add-form-select"
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {getGroupDisplayName(group, lang)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="add-modal-footer">
          <button onClick={onClose} className="add-btn-cancel">
            {getText('cancel', lang)}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting || !selectedGroup}
            className="add-btn-confirm"
          >
            <Plus size={15} />
            {isSubmitting ? getText('addInProgress', lang) : getText('confirmAdd', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
