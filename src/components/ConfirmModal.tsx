import { useCurrentLang, getText } from '@/utils/i18n';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmModalProps) {
  const lang = useCurrentLang();
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-5 max-w-[280px] w-full mx-4"
        style={{ border: '1px solid var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {message}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            {getText('cancel', lang)}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white"
            style={{ background: 'var(--danger-color)' }}
          >
            {confirmLabel || getText('deleteAction', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
