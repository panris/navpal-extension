import { useState, useRef, useEffect } from 'react';
import { Settings, Globe, Minus, Square, Maximize2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getLangPref, setLangPref } from './BookmarkCard';
import type { LangPref } from './BookmarkCard';

interface SettingsMenuProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
  isMaximized?: boolean;
}

export default function SettingsMenu({ onMinimize, onMaximize, onRestore, isMaximized }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [langPref, setLangPrefState] = useState<LangPref>(getLangPref());
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangChange = (pref: LangPref) => {
    setLangPref(pref);
    setLangPrefState(pref);
  };

  const langOptions: { value: LangPref; label: string; icon: string }[] = [
    { value: 'auto', label: '跟随系统', icon: '🔄' },
    { value: 'zh', label: '中文', icon: '🇨🇳' },
    { value: 'en', label: 'English', icon: '🇺🇸' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Settings Button */}
      <button
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
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* Window Controls */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">窗口控制</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onMinimize?.();
                    setIsOpen(false);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
                  title="最小化"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (isMaximized) {
                      onRestore?.();
                    } else {
                      onMaximize?.();
                    }
                    setIsOpen(false);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
                  title={isMaximized ? '恢复默认' : '最大化'}
                >
                  {isMaximized ? (
                    <Square className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">界面语言</span>
            </div>
            <div className="space-y-1">
              {langOptions.map((opt) => (
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
                  <span className="font-medium">{opt.label}</span>
                  {langPref === opt.value && (
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
