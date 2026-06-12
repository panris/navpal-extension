import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

export default function SecretModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const settings = useAppStore((state) => state.settings);
  const revealMode = useAppStore((state) => state.revealMode);

  // Listen for reveal request
  useEffect(() => {
    const handleRevealRequest = () => {
      setIsOpen(true);
      setPin('');
      setError(false);
    };

    window.addEventListener('navpal:reveal-request', handleRevealRequest);
    return () => window.removeEventListener('navpal:reveal-request', handleRevealRequest);
  }, []);

  const handleSubmit = () => {
    if (pin === settings.secretCode) {
      revealMode();
      setIsOpen(false);
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
      <div className="modal-content w-[300px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Gradient Header */}
        <div className="modal-header-gradient px-6 pt-6 pb-5 text-white text-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-1">暗号验证</h2>
          <p className="text-sm opacity-80">输入暗号解锁全量模式</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* PIN Display */}
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`pin-dot w-14 h-14 text-2xl font-bold flex items-center justify-center ${
                  error ? 'error' : pin.length > i ? 'filled' : ''
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
                onClick={() => {
                  if (key === 'del') {
                    setPin((p) => p.slice(0, -1));
                    setError(false);
                  } else if (key !== '' && pin.length < 3) {
                    setPin((p) => p + key);
                    setError(false);
                  }
                }}
                disabled={key === ''}
                className={`key py-4 text-xl font-semibold ${key === '' ? 'invisible' : ''}`}
              >
                {key === 'del' ? '⌫' : key}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="btn-primary w-full py-4 rounded-xl text-base font-semibold mt-6"
          >
            确认解锁
          </button>

          {/* Error Message */}
          {error && (
            <p className="text-center text-sm text-red-500 font-medium mt-4">
              暗号错误，请重试
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
