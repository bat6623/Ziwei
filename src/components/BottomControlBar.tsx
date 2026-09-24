import React, { useState } from 'react';
import type { ChartTabMode } from '../types/ziwei';
import { Disc, HelpCircle, Info, Sliders, Calendar, X, RefreshCw, RotateCcw, Image } from 'lucide-react';

interface BottomControlBarProps {
  mode: ChartTabMode;
  onModeChange: (mode: ChartTabMode) => void;
  onOpenQuickInput: () => void;
  onOpenExportImage: () => void;
  onClearCache: () => void;
  onLoadDemo: () => void;
  activeDockTab: 'chart' | 'help' | 'about';
  onDockTabChange: (tab: 'chart' | 'help' | 'about') => void;
}

export const BottomControlBar: React.FC<BottomControlBarProps> = ({
  mode,
  onModeChange,
  onOpenQuickInput,
  onOpenExportImage,
  onClearCache,
  onLoadDemo,
  activeDockTab,
  onDockTabChange,
}) => {
  const [isCommonMenuOpen, setIsCommonMenuOpen] = useState(false);

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-100 border-t border-slate-300 shadow-2xl font-sans select-none">
      {/* 常用功能彈出 Modal / Drawer */}
      {isCommonMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 border border-slate-200 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" /> 常用功能選單
              </h3>
              <button
                onClick={() => setIsCommonMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsCommonMenuOpen(false);
                  onOpenQuickInput();
                }}
                className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> 八字快捷排盤
                </span>
                <span className="text-[10px] text-blue-500">重新輸入</span>
              </button>

              <button
                onClick={() => {
                  setIsCommonMenuOpen(false);
                  onOpenExportImage();
                }}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-emerald-600" /> 匯出高清命盤圖片
                </span>
                <span className="text-[10px] text-emerald-600 font-normal">儲存相冊</span>
              </button>

              <button
                onClick={() => {
                  setIsCommonMenuOpen(false);
                  onLoadDemo();
                }}
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-600" /> 帶入測試範例 (1956/02/11)
                </span>
                <span className="text-[10px] text-amber-600">範例</span>
              </button>

              <button
                onClick={() => {
                  setIsCommonMenuOpen(false);
                  onClearCache();
                }}
                className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-rose-600" /> 清除快取並重置
                </span>
                <span className="text-[10px] text-rose-500">重置</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 第一層：常用功能 | 飛星 三合 四化 | 快捷排盤 */}
      <div className="max-w-xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2">
        {/* 左側常用功能按鈕 */}
        <button
          onClick={() => setIsCommonMenuOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer flex-shrink-0"
        >
          常用功能
        </button>

        {/* 中間 飛星 | 三合 | 四化 切換區 */}
        <div className="bg-slate-300 p-0.5 rounded-lg flex items-center border border-slate-400 font-serif">
          <button
            onClick={() => onModeChange('feixing')}
            className={`px-3 py-1.5 rounded text-xs font-black transition cursor-pointer ${
              mode === 'feixing'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            飛星
          </button>
          <button
            onClick={() => onModeChange('sanhe')}
            className={`px-3 py-1.5 rounded text-xs font-black transition cursor-pointer ${
              mode === 'sanhe'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            三合
          </button>
          <button
            onClick={() => onModeChange('sihua')}
            className={`px-3 py-1.5 rounded text-xs font-black transition cursor-pointer ${
              mode === 'sihua'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            四化
          </button>
        </div>

        {/* 右側快捷排盤按鈕 */}
        <button
          onClick={onOpenQuickInput}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer flex-shrink-0"
        >
          快捷排盤
        </button>
      </div>

      {/* 第二層：最底部三頁籤 (命盤 | 幫助 | 關於) */}
      <div className="w-full bg-slate-200 border-t border-slate-300 py-1 grid grid-cols-3 text-center">
        <button
          onClick={() => onDockTabChange('chart')}
          className={`flex flex-col items-center justify-center text-[11px] font-bold py-0.5 transition cursor-pointer ${
            activeDockTab === 'chart'
              ? 'text-purple-800 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Disc className={`w-4 h-4 mb-0.5 ${activeDockTab === 'chart' ? 'text-purple-700' : 'text-slate-500'}`} />
          命盤
        </button>

        <button
          onClick={() => onDockTabChange('help')}
          className={`flex flex-col items-center justify-center text-[11px] font-bold py-0.5 transition cursor-pointer ${
            activeDockTab === 'help'
              ? 'text-purple-800 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className={`w-4 h-4 mb-0.5 ${activeDockTab === 'help' ? 'text-purple-700' : 'text-slate-500'}`} />
          幫助
        </button>

        <button
          onClick={() => onDockTabChange('about')}
          className={`flex flex-col items-center justify-center text-[11px] font-bold py-0.5 transition cursor-pointer ${
            activeDockTab === 'about'
              ? 'text-purple-800 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Info className={`w-4 h-4 mb-0.5 ${activeDockTab === 'about' ? 'text-purple-700' : 'text-slate-500'}`} />
          關於
        </button>
      </div>
    </div>
  );
};
