import { useState, useEffect, useMemo } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { MAX_PIN_ATTEMPTS, LOCK_DURATION_MS, SHAKE_ANIM_MS, LOCK_DISMISS_MS, decodeSecret, encodeSecret, isSecretEncoded } from '@/constants';
import { useCurrentLang, getText } from '@/utils/i18n';

const STORAGE_KEY = 'navpal-reveal-fails';

function getFailedAttempts(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { count?: unknown; resetAt?: unknown };
    const count = typeof parsed.count === 'number' ? parsed.count : 0;
    const resetAt = typeof parsed.resetAt === 'number' ? parsed.resetAt : 0;
    if (Date.now() > resetAt) {
      localStorage.removeItem(STORAGE_KEY);
      return 0;
    }
    return count;
  } catch {
    return 0;
  }
}

function recordFailure(): void {
  const count = getFailedAttempts() + 1;
  const resetAt = Date.now() + LOCK_DURATION_MS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, resetAt }));
}

function clearFailures(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export default function SecretModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(() => {
    try {
      return getFailedAttempts();
    } catch {
      return 0;
    }
  });
  const lang = useCurrentLang();

  const settings = useAppStore((s) => s.settings);
  const revealMode = useAppStore((s) => s.revealMode);
  const updateSettings = useAppStore((s) => s.updateSettings);

  // Listen for reveal request
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setPin('');
      setError(false);
      setAttempts(getFailedAttempts());
    };
    window.addEventListener('navpal:reveal-request', handler);
    return () => window.removeEventListener('navpal:reveal-request', handler);
  }, []);

  const remaining = MAX_PIN_ATTEMPTS - attempts;

  const handleSubmit = () => {
    const storedPlain = decodeSecret(settings.secretCode);
    if (pin === storedPlain) {
      clearFailures();
      // Upgrade legacy plain-text secret to encoded on first successful verification
      if (!isSecretEncoded(settings.secretCode)) {
        updateSettings({ secretCode: encodeSecret(pin) });
      }
      revealMode();
      setIsOpen(false);
      setPin('');
      setError(false);
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      recordFailure();
      setAttempts(newAttempts);
      setError(true);
      setPin('');
      setShake(true);
      setTimeout(() => setShake(false), SHAKE_ANIM_MS);
      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        setTimeout(() => {
          setIsOpen(false);
          setPin('');
          setError(false);
        }, LOCK_DISMISS_MS);
      }
    }
  };

  if (!isOpen) return null;

  // I18n text
  const titleText = getText('enterSecret', lang);
  const hintText = getText('secretHintFull', lang);
  const lockWarningText = lang === 'zh'
    ? `还剩 ${remaining} 次机会，失败将锁定1分钟`
    : `${remaining} attempts left, locked for 1 min after failure`;
  const lockedText = getText('lockedPleaseRetry', lang);
  const submitText = getText('confirmUnlock', lang);
  const errorText = useMemo(() =>
    remaining <= 0
      ? lockedText
      : (lang === 'zh' ? `暗号错误，还剩 ${remaining} 次机会` : `Wrong code, ${remaining} attempts left`),
    [remaining, lockedText, lang]
  );

  return (
    <div
      className="fixed inset-0 modal-overlay flex items-center justify-center z-50"
      onClick={() => setIsOpen(false)}
      onKeyDown={(e) => { if (e.key === 'Enter' && pin.length === 3 && remaining > 0) handleSubmit(); }}
      tabIndex={-1}
      role="dialog"
      aria-label="Enter secret code"
    >
      <div className="modal-content w-[300px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Gradient Header */}
        <div className="modal-header-gradient px-6 pt-6 pb-5 text-white text-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3">
            {remaining <= 1 ? <AlertTriangle className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold mb-1">{titleText}</h2>
          <p className="text-sm opacity-80">{hintText}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Attempts Warning */}
          {remaining <= 1 && remaining > 0 && (
            <div
              className="flex items-center gap-2 justify-center mb-4 px-3 py-2 rounded-lg border"
              style={{ background: 'var(--warning-light)', borderColor: 'var(--warning-color)' }}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--warning-color)' }} />
              <p className="text-xs font-medium" style={{ color: 'var(--warning-color)' }}>
                {lockWarningText}
              </p>
            </div>
          )}
          {remaining <= 0 && (
            <div
              className="flex items-center gap-2 justify-center mb-4 px-3 py-2 rounded-lg border"
              style={{ background: 'var(--danger-light)', borderColor: 'var(--danger-color)' }}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--danger-color)' }} />
              <p className="text-xs font-medium" style={{ color: 'var(--danger-color)' }}>{lockedText}</p>
            </div>
          )}

          {/* PIN Display */}
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`pin-dot w-14 h-14 text-2xl font-bold flex items-center justify-center ${
                  shake ? 'error' : pin.length > i ? 'filled' : ''
                }`}
              >
                {pin.length > i ? '•' : ''}
              </div>
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((key, idx) => (
              <button
                key={idx}
                aria-label={key === 'del' ? (lang === 'zh' ? '删除' : 'Delete') : (key !== '' ? String(key) : undefined)}
                disabled={key === '' || remaining <= 0}
                onClick={() => {
                  if (remaining <= 0) return;
                  if (key === 'del') {
                    setPin((p) => p.slice(0, -1));
                    setError(false);
                  } else if (key !== '' && pin.length < 3) {
                    setPin((p) => p + key);
                    setError(false);
                  }
                }}
                className={`key py-4 text-xl font-semibold ${key === '' ? 'invisible' : ''} ${remaining <= 0 ? 'opacity-40' : ''}`}
              >
                {key === 'del' ? '⌫' : key}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={remaining <= 0 || pin.length < 3}
            className="btn-primary w-full py-4 rounded-xl text-base font-semibold mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitText}
          </button>

          {/* Error Message */}
          {error && (
            <p className="text-center text-sm text-red-500 font-medium mt-4">
              {errorText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
