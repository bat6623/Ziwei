import { useState } from 'react';
import { calculateZiweiChart } from './utils/ziweiEngine';
import type { ZiweiChartData, BirthInput, PalaceData, ChartTabMode } from './types/ziwei';
import { ZiweiGrid } from './components/ZiweiGrid';
import { InputModal } from './components/InputModal';
import { DataStorageManager } from './components/DataStorageManager';
import { Sparkles, Calendar, RotateCcw, RefreshCw, Zap, Compass, Layers } from 'lucide-react';

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

  // 底部固定切換頁面 Tab (飛星 | 三合 | 四化)
  const [tabMode, setTabMode] = useState<ChartTabMode>('sanhe');

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

  // 模式提示字串
  const getBannerNotice = () => {
    if (tabMode === 'feixing') {
      return '飛星模式：點擊任何宮位，即刻演算該宮宮幹之「飛祿、飛權、飛科、飛忌」四化飛入何宮！';
    }
    if (tabMode === 'sihua') {
      return '四化模式：自動強高亮生年四化（祿、權、科、忌）分佈與對宮衝照連線！';
    }
    return '三合模式：點擊任何宮位，即刻高亮該宮之「本宮、對宮、事業、財帛」三方四正關係！';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center pb-24 selection:bg-amber-500 selection:text-white">
      {/* 頂部 Header */}
      <header className="w-full bg-white/90 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white font-black font-serif text-lg shadow-xs">
              紫
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-900 font-serif flex items-center gap-1.5">
                紫微斗數神算命盤 <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-sans font-bold">飛星 • 三合 • 四化</span>
              </h1>
              <p className="text-[10px] text-slate-500">專業級安星演算法 • 地理八卦方位與乙丙級星 • 底部切換</p>
            </div>
          </div>

          {/* 右側操作按鈕 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCache}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="清除快取並重置"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-600" /> 清除快取
            </button>

            <button
              onClick={handleLoadDemo}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="載入測試範例 (1956/02/11 巳時)"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 帶入測試範例
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition duration-200 cursor-pointer"
            >
              <Calendar className="w-4 h-4 fill-white" /> 輸入八字排盤
            </button>
          </div>
        </div>
      </header>

      {/* 主內容區 */}
      <main className="w-full max-w-6xl px-2 sm:px-4 mt-4 flex flex-col items-center">
        {/* 動態提示 Banner */}
        <div className="w-full max-w-5xl bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin-slow" />
            <span>提示：<strong>{getBannerNotice()}</strong></span>
          </div>
          <span className="hidden sm:inline-block text-[10px] text-slate-500">
            請使用底部 fixed 導覽頁籤進行【飛星/三合/四化】模式切換
          </span>
        </div>

        {/* 經典地支盤 4x4 網格 */}
        <ZiweiGrid data={chartData} mode={tabMode} onPalaceSelect={(palace) => setSelectedPalace(palace)} />

        {/* 儲存與圖片匯出管理區 */}
        <DataStorageManager
          currentChart={chartData}
          onLoadChart={(c) => setChartData(c)}
          onClearCache={handleClearCache}
        />
      </main>

      {/* 底部固定 Sticky 導覽切換頁籤 (Fixed Bottom Bar) */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 border-t border-slate-200 shadow-2xl backdrop-blur-md px-4 py-2 flex justify-center">
        <div className="max-w-md w-full bg-slate-100 p-1 rounded-2xl border border-slate-200 grid grid-cols-3 gap-1 shadow-inner">
          {/* 飛星頁面 */}
          <button
            onClick={() => setTabMode('feixing')}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              tabMode === 'feixing'
                ? 'bg-purple-600 text-white shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            飛星
          </button>

          {/* 三合頁面 */}
          <button
            onClick={() => setTabMode('sanhe')}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              tabMode === 'sanhe'
                ? 'bg-amber-500 text-white shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            三合
          </button>

          {/* 四化頁面 */}
          <button
            onClick={() => setTabMode('sihua')}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              tabMode === 'sihua'
                ? 'bg-emerald-600 text-white shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            四化
          </button>
        </div>
      </div>

      <InputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCalculate}
      />
    </div>
  );
}

export default App;
