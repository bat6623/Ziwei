import { useState } from 'react';
import { calculateZiweiChart } from './utils/ziweiEngine';
import type { ZiweiChartData, BirthInput, PalaceData } from './types/ziwei';
import { ZiweiGrid } from './components/ZiweiGrid';
import { InputModal } from './components/InputModal';
import { DataStorageManager } from './components/DataStorageManager';
import { Sparkles, Calendar, RotateCcw } from 'lucide-react';

// 動態產生當前系統時間作為全新預設輸入 (不再保留特定個人資料)
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

// 備用測試範例 (選用)
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

  const handleCalculate = (input: BirthInput) => {
    const newChart = calculateZiweiChart(input);
    setChartData(newChart);
    setSelectedPalace(null);
  };

  const handleLoadDemo = () => {
    handleCalculate(DEMO_INPUT);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center pb-12 selection:bg-amber-500 selection:text-white">
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
                紫微斗數神算命盤 <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-sans font-bold">白色清爽版</span>
              </h1>
              <p className="text-[10px] text-slate-500">專業級安星演算法 • 文墨天機經典版型 • 支援 JSON 資料結構儲存</p>
            </div>
          </div>

          {/* 右側操作按鈕 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadDemo}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-2xs"
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
        {/* 提示 Banner */}
        <div className="w-full max-w-5xl bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin-slow" />
            <span>提示：點擊任何宮位（如命宮、官祿宮）即可高亮顯示其<strong>「三方四正」</strong>關係連線！</span>
          </div>
          <span className="hidden sm:inline-block text-[10px] text-slate-500">
            地支盤：巳午未申(上) • 申酉戌亥(右) • 亥子丑寅(下) • 寅卯辰巳(左)
          </span>
        </div>

        {/* 經典地支盤 4x4 網格 */}
        <ZiweiGrid data={chartData} onPalaceSelect={(palace) => setSelectedPalace(palace)} />

        {/* 儲存管理與 JSON 資料結構展示區 */}
        <DataStorageManager currentChart={chartData} onLoadChart={(c) => setChartData(c)} />
      </main>

      <InputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCalculate}
      />
    </div>
  );
}

export default App;
