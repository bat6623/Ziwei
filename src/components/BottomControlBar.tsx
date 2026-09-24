import React, { useState } from 'react';
import type { ChartTabMode } from '../types/ziwei';
import type { ThemePref } from '../utils/theme';
import { Ellipsis, CalendarPlus, Image, RotateCcw, RefreshCw, HelpCircle, Info, X } from 'lucide-react';

interface BottomControlBarProps {
  mode: ChartTabMode;
  onModeChange: (mode: ChartTabMode) => void;
  onOpenQuickInput: () => void;
  onOpenExportImage: () => void;
  onClearCache: () => void;
  onLoadDemo: () => void;
  onOpenInfo: (tab: 'help' | 'about') => void;
  themePref: ThemePref;
  onThemeChange: (pref: ThemePref) => void;
}

const MODES: { key: ChartTabMode; label: string }[] = [
  { key: 'feixing', label: '飛星' },
  { key: 'sanhe', label: '三合' },
  { key: 'sihua', label: '四化' },
];

export const BottomControlBar: React.FC<BottomControlBarProps> = ({
  mode,
  onModeChange,
  onOpenQuickInput,
  onOpenExportImage,
  onClearCache,
  onLoadDemo,
  onOpenInfo,
  themePref,
  onThemeChange,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const actions = [
    { label: '輸入生辰排盤', Icon: CalendarPlus, run: onOpenQuickInput },
    { label: '匯出命盤圖片', Icon: Image, run: onOpenExportImage },
    { label: '帶入測試範例', Icon: RotateCcw, run: onLoadDemo },
    { label: '重置為此刻時間', Icon: RefreshCw, run: onClearCache },
    { label: '使用說明', Icon: HelpCircle, run: () => onOpenInfo('help') },
    { label: '關於', Icon: Info, run: () => onOpenInfo('about') },
  ];

  return (
    <>
      {/* 更多：底部抽屜 */}
      {isSheetOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/30 flex items-end sm:items-center justify-center p-2 sm:p-4 font-apple animate-fade-in"
          onClick={() => setIsSheetOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-card rounded-[28px] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pl-3 pr-1 pb-2">
              <span className="text-[17px] text-label">常用功能</span>
              <button type="button" onClick={() => setIsSheetOpen(false)} aria-label="關閉" className="w-10 h-10 rounded-full border border-separator flex items-center justify-center text-label hover:bg-fill cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 外觀：自動／淺色／深色 */}
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="text-[15px] text-label2">外觀</span>
              <div role="radiogroup" aria-label="外觀" className="flex p-1 rounded-full bg-fill">
                {([['system', '自動'], ['light', '淺色'], ['dark', '深色']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={themePref === key}
                    onClick={() => onThemeChange(key)}
                    className={`h-8 px-4 rounded-full text-[13px] transition-colors cursor-pointer ${
                      themePref === key ? 'bg-panel text-white dark:bg-accent dark:text-on-accent' : 'text-label2 hover:text-label'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <ul className="mt-1">
              {actions.map(({ label, Icon, run }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => { setIsSheetOpen(false); run(); }}
                    className="w-full flex items-center gap-3 px-2 py-1.5 rounded-full text-[15px] text-label hover:bg-fill active:bg-fill2 cursor-pointer"
                  >
                    <span className="w-10 h-10 rounded-full border border-separator flex items-center justify-center text-label2">
                      <Icon className="w-[18px] h-[18px]" />
                    </span>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 手機：懸浮炭灰膠囊 (桌機的模式切換在頂部導覽列) */}
      <nav className="sm:hidden fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-50 font-apple select-none">
        <div className="dark island h-16 rounded-full bg-card text-label flex items-center gap-1.5 px-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            aria-label="更多"
            className="shrink-0 w-12 h-12 rounded-full border border-separator flex items-center justify-center text-label active:bg-fill cursor-pointer"
          >
            <Ellipsis className="w-5 h-5" />
          </button>

          <div role="tablist" aria-label="盤面模式" className="flex-1 flex items-center justify-center gap-0.5">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={mode === m.key}
                onClick={() => onModeChange(m.key)}
                className={`h-12 flex-1 max-w-[72px] rounded-full text-[15px] transition-colors cursor-pointer ${
                  mode === m.key ? 'bg-accent text-on-accent' : 'text-label2 active:bg-fill'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenQuickInput}
            aria-label="輸入生辰排盤"
            className="shrink-0 w-12 h-12 rounded-full bg-accent text-on-accent flex items-center justify-center active:brightness-90 cursor-pointer"
          >
            <CalendarPlus className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </>
  );
};
