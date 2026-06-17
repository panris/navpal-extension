import { useState, useEffect, useRef } from 'react';
import { useAppStore, subscribeHydration } from '@/stores/appStore';
import { useCurrentLang } from '@/utils/i18n';

interface TourStep {
  key: string;
  title: { zh: string; en: string };
  desc: { zh: string; en: string };
  target: string; // CSS selector
  position: 'bottom' | 'top' | 'right' | 'left';
}

const TOUR_STEPS: TourStep[] = [
  {
    key: 'groups',
    title: { zh: '分组导航', en: 'Group Navigation' },
    desc: { zh: '点击标签切换分组，或点击「全部」查看所有书签', en: 'Click tabs to switch groups, or click "All" to see all bookmarks' },
    target: '[data-tour="groups"]',
    position: 'bottom',
  },
  {
    key: 'edit',
    title: { zh: '快捷编辑', en: 'Quick Edit' },
    desc: { zh: '按 E 键进入编辑模式，可添加、删除、拖拽排序书签', en: 'Press E to enter edit mode — add, delete, or drag to reorder' },
    target: '[data-tour="edit"]',
    position: 'bottom',
  },
  {
    key: 'search',
    title: { zh: '快速搜索', en: 'Instant Search' },
    desc: { zh: '输入关键词即时搜索，或按 / 或 Ctrl+K 聚焦搜索框', en: 'Type to search instantly, or press / or Ctrl+K to focus' },
    target: '[data-tour="search"]',
    position: 'bottom',
  },
  {
    key: 'settings',
    title: { zh: '数据管理', en: 'Data Management' },
    desc: { zh: '点击齿轮图标导出/导入备份，管理分组和界面语言', en: 'Click the gear to export/import backups, manage groups and language' },
    target: '[data-tour="settings"]',
    position: 'left',
  },
  {
    key: 'reveal',
    title: { zh: '全量模式', en: 'Reveal All' },
    desc: { zh: '按 R 键输入暗号可查看所有书签（包括已隐藏的）', en: 'Press R and enter the secret code to reveal hidden bookmarks' },
    target: '[data-tour="reveal"]',
    position: 'top',
  },
];

interface TooltipProps {
  step: TourStep;
  lang: 'zh' | 'en';
  total: number;
  current: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  targetRect: DOMRect | null;
}

function TourTooltip({ step, lang, total, current, onNext, onPrev, onSkip, targetRect }: TooltipProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!targetRect) return;

    const gap = 12;
    const tooltipW = 260;
    const tooltipH = 140;
    let x = 0, y = 0;

    // Get viewport dimensions
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    switch (step.position) {
      case 'bottom':
        x = targetRect.left + targetRect.width / 2 - tooltipW / 2;
        y = targetRect.bottom + gap;
        break;
      case 'top':
        x = targetRect.left + targetRect.width / 2 - tooltipW / 2;
        y = targetRect.top - tooltipH - gap;
        break;
      case 'right':
        x = targetRect.right + gap;
        y = targetRect.top + targetRect.height / 2 - tooltipH / 2;
        break;
      case 'left':
        x = targetRect.left - tooltipW - gap;
        y = targetRect.top + targetRect.height / 2 - tooltipH / 2;
        break;
    }

    // Clamp to viewport
    x = Math.max(8, Math.min(x, vw - tooltipW - 8));
    y = Math.max(8, Math.min(y, vh - tooltipH - 8));

    setPos({ x, y });
  }, [step, targetRect]);

  return (
    <div
      className="fixed z-[9999] w-[260px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Arrow */}
      <div
        className={`absolute w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45 ${
          step.position === 'bottom' ? '-top-1.5 -translate-x-1/2 left-1/2' : ''
        } ${step.position === 'top' ? '-bottom-1.5 -translate-x-1/2 left-1/2 rotate-225' : ''}
           ${step.position === 'right' ? '-left-1.5 -translate-y-1/2 top-1/2 rotate-315' : ''}
           ${step.position === 'left' ? '-right-1.5 -translate-y-1/2 top-1/2 rotate-135' : ''}`}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm">{step.title[lang]}</h3>
        <button
          onClick={(e) => { e.stopPropagation(); onSkip(); }}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 leading-relaxed mb-4">{step.desc[lang]}</p>

      {/* Progress & Nav */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === current ? 'bg-violet-500' : i < current ? 'bg-violet-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {current > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
            >
              {lang === 'zh' ? '上一步' : 'Back'}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="px-3 py-1 text-xs font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            {current === total - 1
              ? lang === 'zh' ? '完成' : 'Done'
              : lang === 'zh' ? '下一步' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingTour() {
  const lang = useCurrentLang();
  const hasSeenOnboarding = useAppStore((s) => s.settings.hasSeenOnboarding);
  const updateSettings = useAppStore((s) => s.updateSettings);

  // Track dismissal state
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for store hydration before checking hasSeenOnboarding
  useEffect(() => {
    // Subscribe to hydration completion
    const unsubscribe = subscribeHydration(() => {
      setIsHydrated(true);
      // After hydration, check if onboarding was already completed
      if (useAppStore.getState().settings.hasSeenOnboarding) {
        setDismissed(true);
      }
    });
    
    // Also check immediately in case already hydrated (e.g., on subsequent renders)
    // We use a small timeout to let the store initialize
    const timer = setTimeout(() => {
      const state = useAppStore.getState();
      if (state.settings?.hasSeenOnboarding) {
        setDismissed(true);
        setIsHydrated(true);
      }
    }, 0);
    
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Don't render anything until hydration is complete
  if (!isHydrated) return null;

  // Early return if dismissed or already seen
  if (dismissed || hasSeenOnboarding) return null;

  const currentStep = TOUR_STEPS[step];

  // Find target element and get its rect
  useEffect(() => {
    const updateRect = () => {
      const el = document.querySelector(currentStep.target);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updateRect, 50);
    window.addEventListener('resize', updateRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
    };
  }, [step, currentStep.target]);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Complete - dismiss immediately, persist in background
      setDismissed(true);
      updateSettings({ hasSeenOnboarding: true });
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    setDismissed(true);
    updateSettings({ hasSeenOnboarding: true });
  };

  return (
    <>
      {/* Semi-transparent overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/30"
        onClick={(e) => { e.stopPropagation(); handleSkip(); }}
      />

      {/* Spotlight cutout effect via backdrop */}
      {targetRect && (
        <div
          className="fixed z-[9997] bg-transparent pointer-events-none"
          style={{
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.3)`,
            borderRadius: '8px',
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <TourTooltip
        step={currentStep}
        lang={lang}
        total={TOUR_STEPS.length}
        current={step}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={handleSkip}
        targetRect={targetRect}
      />
    </>
  );
}
