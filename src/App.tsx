import { useState } from 'react';
import { calculateZiweiChart, updateChartFlowCycle } from './utils/ziweiEngine';
import type { ZiweiChartData, BirthInput, PalaceData, ChartTabMode } from './types/ziwei';
import { ZiweiGrid } from './components/ZiweiGrid';
import { InputModal } from './components/InputModal';
import { DataStorageManager } from './components/DataStorageManager';
import { FlowCycleBar } from './components/FlowCycleBar';
import { BottomControlBar } from './components/BottomControlBar';
import { InfoModals } from './components/InfoModals';
import { Sparkles, Calendar, RotateCcw, RefreshCw } from 'lucide-react';

const getInitialInput = (): BirthInput => {
  const now = new Date();
  return {
    name: '命主',
    gender: 'male',
    isLunar: false,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  };
};

const DEMO_INPUT: BirthInput = {
  name: '測試範例',
  gender: 'male',
  isLunar: false,
  year: 1956,
  month: 2,
  day: 11,
  hour: 10,
  minute: 5,
};

export function App() {
  const [chartData, setChartData] = useState<ZiweiChartData>(() =>
    calculateZiweiChart(getInitialInput())
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [, setSelectedPalace] = useState<PalaceData | null>(null);

  // 頁面切換 Tab (飛星 | 三合 | 四化)
  const [tabMode, setTabMode] = useState<ChartTabMode>('sanhe');
  // 底部 Dock 頁籤 (命盤 | 幫助 | 關於)
  const [activeDockTab, setActiveDockTab] = useState<'chart' | 'help' | 'about'>('chart');
  const [infoModalTab, setInfoModalTab] = useState<'help' | 'about' | null>(null);

  const handleCalculate = (input: BirthInput) => {
    const newChart = calculateZiweiChart(input);
    setChartData(newChart);
    setSelectedPalace(null);
  };

  const handleLoadDemo = () => {
    handleCalculate(DEMO_INPUT);
  };

  const handleClearCache = () => {
    handleCalculate(getInitialInput());
  };

  const handleDockTabChange = (tab: 'chart' | 'help' | 'about') => {
    setActiveDockTab(tab);
    if (tab === 'help' || tab === 'about') {
      setInfoModalTab(tab);
    } else {
      setInfoModalTab(null);
    }
  };

  const handleFlowCycleChange = (params: {
    decadeKey: string;
    year: number;
    month: string;
    day: string;
    hour: string;
  }) => {
    setChartData((prev) =>
      updateChartFlowCycle(prev, params.year, params.decadeKey, params.month, params.day, params.hour)
    );
  };

  // 模式提示字串
  const getBannerNotice = () => {
    if (tabMode === 'feixing') {
      return '飛星：點一個宮位，看它的祿、權、科、忌飛到哪一宮';
    }
    if (tabMode === 'sihua') {
      return '四化：標出生年祿、權、科、忌所在的宮位與對宮';
    }
    return '三合：點一個宮位，看它的對宮與三方四正';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center pb-32 selection:bg-amber-500 selection:text-white">
      {/* 頂部 Header */}
      <header className="w-full bg-white/90 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white font-black font-serif text-lg shadow-xs">
              紫
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-900 font-serif flex items-center gap-1.5">
                紫微斗數神算命盤 <span className="hidden sm:inline text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-sans font-bold">飛星 • 三合 • 四化</span>
              </h1>
              <p className="hidden sm:block text-[10px] text-slate-500">專業級安星演算法 • 大限/流年/流月/流日選單 • 底部導覽</p>
            </div>
          </div>

          {/* 右側操作按鈕 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCache}
              className="hidden sm:flex bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold px-3 py-2 rounded-xl items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="把命盤重設為此刻時間（不會刪除已儲存的紀錄）"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-600" /> 重置為此刻
            </button>

            <button
              onClick={handleLoadDemo}
              className="hidden sm:flex bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-2 rounded-xl items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="載入測試範例 (1956/02/11 巳時)"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 帶入測試範例
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 whitespace-nowrap text-white font-black text-xs px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition duration-200 cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> 輸入生辰
            </button>
          </div>
        </div>
      </header>

      {/* 主內容區 */}
      <main className="w-full max-w-6xl px-2 sm:px-4 mt-4 flex flex-col items-center">
        {/* 動態提示 Banner */}
        <div className="w-full max-w-5xl bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 sm:p-3 mb-3 sm:mb-4 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="shrink-0 w-4 h-4 text-amber-600" />
            <span className="text-[11px] sm:text-xs leading-snug">{getBannerNotice()}</span>
          </div>
          <span className="hidden sm:inline-block text-[10px] text-slate-500">
            底部可切換模式、下方可調整大限流年
          </span>
        </div>

        {/* 經典地支盤 4x4 網格 */}
        <ZiweiGrid data={chartData} mode={tabMode} onPalaceSelect={(palace) => setSelectedPalace(palace)} />

        {/* 下方流運切換面板 (大限, 流年/小限, 流月, 流日, 流時) */}
        <div className="w-full max-w-5xl">
          <FlowCycleBar data={chartData} onFlowCycleChange={handleFlowCycleChange} />
        </div>

        {/* 儲存與圖片匯出管理區 */}
        <DataStorageManager
          currentChart={chartData}
          onLoadChart={(c) => setChartData(c)}
          onClearCache={handleClearCache}
        />
      </main>

      {/* 底部固定 Sticky 控制與導覽列 (文墨天機風格) */}
      <BottomControlBar
        mode={tabMode}
        onModeChange={(m) => setTabMode(m)}
        onOpenQuickInput={() => setIsModalOpen(true)}
        onOpenExportImage={() => {
          // 觸發 DataStorageManager 的圖片匯出 Modal 邏輯，可透過原有的排盤操作
          const exportBtn = document.getElementById('export-image-btn');
          if (exportBtn) exportBtn.click();
        }}
        onClearCache={handleClearCache}
        onLoadDemo={handleLoadDemo}
        activeDockTab={activeDockTab}
        onDockTabChange={handleDockTabChange}
      />

      <InputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCalculate}
      />

      {/* 幫助與關於 Modal */}
      <InfoModals
        activeTab={infoModalTab}
        onClose={() => {
          setInfoModalTab(null);
          setActiveDockTab('chart');
        }}
      />
    </div>
  );
}

export default App;

