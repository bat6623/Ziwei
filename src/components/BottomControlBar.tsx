import React, { useState } from 'react';
import type { ChartTabMode } from '../types/ziwei';
import type { ThemePref } from '../utils/theme';
import { CircleDot, HelpCircle, Info, Ellipsis, CalendarPlus, Image, RotateCcw, RefreshCw } from 'lucide-react';

interface BottomControlBarProps {
  mode: ChartTabMode;
  onModeChange: (mode: ChartTabMode) => void;
  onOpenQuickInput: () => void;
  onOpenExportImage: () => void;
  onClearCache: () => void;
  onLoadDemo: () => void;
  activeDockTab: 'chart' | 'help' | 'about';
  onDockTabChange: (tab: 'chart' | 'help' | 'about') => void;
  themePref: ThemePref;
  onThemeChange: (pref: ThemePref) => void;
}

const MODES: { key: ChartTabMode; label: string }[] = [
  { key: 'feixing', label: '飛星' },
  { key: 'sanhe', label: '三合' },
  { key: 'sihua', label: '四化' },
];

const TABS = [
  { key: 'chart', label: '命盤', Icon: CircleDot },
  { key: 'help', label: '幫助', Icon: HelpCircle },
  { key: 'about', label: '關於', Icon: Info },
] as const;

export const BottomControlBar: React.FC<BottomControlBarProps> = ({
  mode,
  onModeChange,
  onOpenQuickInput,
  onOpenExportImage,
  onClearCache,
  onLoadDemo,
  activeDockTab,
  onDockTabChange,
  themePref,
  onThemeChange,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const sheetActions = [
    { label: '輸入生辰排盤', Icon: CalendarPlus, run: onOpenQuickInput },
    { label: '匯出命盤圖片', Icon: Image, run: onOpenExportImage },
    { label: '帶入測試範例', Icon: RotateCcw, run: onLoadDemo },
    { label: '重置為此刻時間', Icon: RefreshCw, run: onClearCache },
  ];

  return (
    <>
      {/* 動作表 (iOS Action Sheet) */}
      {isSheetOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/30 flex items-end sm:items-center justify-center p-2 sm:p-4 font-apple animate-fade-in"
          onClick={() => setIsSheetOpen(false)}
        >
          <div className="w-full max-w-sm space-y-2 pb-[env(safe-area-inset-bottom)]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-card/90 backdrop-blur-xl rounded-2xl overflow-hidden divide-y divide-separator/60">
              <p className="py-3 text-center text-[13px] text-label3">常用功能</p>
              {/* 外觀：自動／淺色／深色 */}
              <div className="flex items-center justify-between gap-3 px-4 h-14">
                <span className="text-[17px] text-label">外觀</span>
                <div role="radiogroup" aria-label="外觀" className="flex p-0.5 rounded-[9px] bg-[#767680]/12 dark:bg-[#767680]/24">
                  {([['system', '自動'], ['light', '淺色'], ['dark', '深色']] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={themePref === key}
                      onClick={() => onThemeChange(key)}
                      className={`w-14 h-7 rounded-[7px] text-[13px] transition-all cursor-pointer ${
                        themePref === key
                          ? 'bg-white dark:bg-[#636366] text-label font-semibold shadow-[0_3px_8px_rgba(0,0,0,0.12)]'
                          : 'text-label/80'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {sheetActions.map(({ label, Icon, run }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setIsSheetOpen(false); run(); }}
                  className="w-full h-14 flex items-center justify-center gap-2 text-[17px] text-tint active:bg-fill cursor-pointer"
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsSheetOpen(false)}
              className="w-full h-14 bg-card rounded-2xl text-[17px] font-semibold text-tint active:bg-fill cursor-pointer"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/80 backdrop-blur-xl border-t border-separator/60 font-apple select-none pb-[env(safe-area-inset-bottom)]">
        {/* 工具列：更多｜模式切換｜排盤 */}
        <div className="max-w-xl mx-auto h-12 px-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className="flex items-center gap-1 text-[15px] text-tint active:opacity-40 transition-opacity cursor-pointer"
          >
            <Ellipsis className="w-5 h-5" /> 更多
          </button>

          {/* 分段控制 (iOS Segmented Control) */}
          <div role="tablist" aria-label="盤面模式" className="flex p-0.5 rounded-[9px] bg-[#767680]/12 dark:bg-[#767680]/24">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={mode === m.key}
                onClick={() => onModeChange(m.key)}
                className={`w-16 h-7 rounded-[7px] text-[13px] transition-all cursor-pointer ${
                  mode === m.key
                    ? 'bg-white dark:bg-[#636366] text-label font-semibold shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)]'
                    : 'text-label/80 active:bg-card/50 dark:active:bg-card/10'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenQuickInput}
            className="flex items-center gap-1 text-[15px] font-semibold text-tint active:opacity-40 transition-opacity cursor-pointer"
          >
            <CalendarPlus className="w-5 h-5" /> 排盤
          </button>
        </div>

        {/* 標籤列 (iOS Tab Bar) */}
        <div className="max-w-xl mx-auto grid grid-cols-3 h-[50px] border-t border-separator/40">
          {TABS.map(({ key, label, Icon }) => {
            const active = activeDockTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onDockTabChange(key)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium active:opacity-50 transition-opacity cursor-pointer ${
                  active ? 'text-tint' : 'text-[#999999]'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
