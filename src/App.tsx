import { useEffect, useMemo, useState } from 'react';
import { calculateZiweiChart, applyFlowSelection } from './utils/ziweiEngine';
import type { ZiweiChartData, BirthInput, ChartTabMode, FlowSelection } from './types/ziwei';
import { getBirthInput, type SavedRecord } from './utils/records';
import { APP_VERSION, BUILD_TIME } from './utils/appVersion';
import { ZiweiGrid } from './components/ZiweiGrid';
import { InputModal } from './components/InputModal';
import { DataStorageManager } from './components/DataStorageManager';
import { FlowCycleBar } from './components/FlowCycleBar';
import { BottomControlBar } from './components/BottomControlBar';
import { InfoModals } from './components/InfoModals';
import { Sun, Moon, HelpCircle, Info } from 'lucide-react';
import { useTheme } from './utils/theme';
import { forceUpdate, takeUpdateNotice } from './utils/forceUpdate';

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

// 按過「強制更新」重新載入後，要顯示的結果 (只在載入時讀一次)
const UPDATE_NOTICE = takeUpdateNotice();

const NO_FLOW: FlowSelection = { decadeKey: null, year: null, month: null, day: null, hour: null };

export function App() {
  // baseChart 是本命盤；畫面上的 chartData 再套上使用者選的流運
  const [baseChart, setBaseChart] = useState<ZiweiChartData>(() => calculateZiweiChart(getInitialInput()));
  const [flowSel, setFlowSel] = useState<FlowSelection>(NO_FLOW);
  const chartData = useMemo(() => applyFlowSelection(baseChart, flowSel), [baseChart, flowSel]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const theme = useTheme();
  const [updateNotice, setUpdateNotice] = useState<string | null>(UPDATE_NOTICE);
  useEffect(() => {
    if (!updateNotice) return;
    const t = setTimeout(() => setUpdateNotice(null), 5000);
    return () => clearTimeout(t);
  }, [updateNotice]);
  const darkNow = theme.pref === 'dark' || (theme.pref === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // 頁面切換 Tab (飛星 | 三合 | 四化)
  const [tabMode, setTabMode] = useState<ChartTabMode>('sanhe');
  const [infoModalTab, setInfoModalTab] = useState<'help' | 'about' | null>(null);

  const handleCalculate = (input: BirthInput) => {
    setBaseChart(calculateZiweiChart(input));
    setFlowSel(NO_FLOW);
  };

  // 載入存檔時一律依生辰重新排盤，舊存檔裡算錯的資料才不會被沿用
  const handleLoadRecord = (saved: SavedRecord) => {
    const recalculated = calculateZiweiChart(saved.birthInput);
    setBaseChart({ ...recalculated, id: saved.id, createdAt: saved.createdAt });
    setFlowSel(NO_FLOW);
  };

  // 中宮「日↑↓ 時↑↓」：生辰往前後推一天或一個時辰 (兩小時) 重新排盤
  const handleShift = (unit: 'day' | 'hour', delta: number) => {
    const input = getBirthInput(baseChart);
    let d: Date;
    if (input.isLunar) {
      const [date, time] = baseChart.userInfo.solarBirth.split(' ');
      const [y, m, dd] = date.split('-').map(Number);
      const [h, mi] = time.split(':').map(Number);
      d = new Date(y, m - 1, dd, h, mi);
    } else {
      d = new Date(input.year, input.month - 1, input.day, input.hour, input.minute);
    }
    if (unit === 'day') d.setDate(d.getDate() + delta);
    else d.setHours(d.getHours() + delta * 2);
    handleCalculate({
      ...input,
      isLunar: false,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
    });
  };

  const handleLoadDemo = () => {
    handleCalculate(DEMO_INPUT);
  };

  const handleClearCache = () => {
    handleCalculate(getInitialInput());
  };

  // 模式提示字串
  const notice = {
    feixing: ['飛星', '點一個宮位，空心框標出它的宮干把祿、權、科、忌飛到哪顆星'],
    sihua: ['四化', '標出生年祿、權、科、忌所在的宮位，連線到對宮'],
    sanhe: ['三合', '點一個宮位，看它的對宮與三方四正；再點一次取消'],
  }[tabMode];

  const { userInfo } = baseChart;
  const circleBtn = 'shrink-0 w-10 h-10 rounded-full border border-separator flex items-center justify-center text-label hover:bg-fill active:bg-fill2 transition-colors cursor-pointer';
  const outlinePill = 'h-11 px-5 rounded-full border border-separator text-[15px] text-label hover:bg-card active:bg-fill transition-colors cursor-pointer';

  return (
    <div className="min-h-screen bg-grouped text-label font-apple pb-28 sm:pb-10 selection:bg-accent selection:text-on-accent">
      {/* 頂部導覽列：炭灰膠囊 */}
      <header className="sticky top-0 z-40 px-2 sm:px-4 pt-2 sm:pt-3">
        <div className="dark island max-w-6xl mx-auto h-14 sm:h-16 rounded-full bg-card text-label flex items-center gap-1.5 sm:gap-2 pl-2 pr-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
          <img src={`${import.meta.env.BASE_URL}icons/logo.svg`} alt="紫微斗數" width={44} height={44} className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover" />
          <span className="pl-1 sm:px-2 text-[15px] sm:text-[17px] text-label whitespace-nowrap">紫微斗數</span>


          <div className="flex-1" />

          <button type="button" onClick={() => theme.setPref(darkNow ? 'light' : 'dark')} aria-label={darkNow ? '切換成淺色模式' : '切換成深色模式'} title={darkNow ? '切換成淺色模式' : '切換成深色模式'} className={circleBtn}>
            {darkNow ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
          <button type="button" onClick={() => setInfoModalTab('help')} aria-label="使用說明" title="使用說明" className={`hidden sm:flex ${circleBtn}`}>
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>
          <button type="button" onClick={() => setInfoModalTab('about')} aria-label="關於" title="關於" className={`hidden sm:flex ${circleBtn}`}>
            <Info className="w-[18px] h-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 h-10 sm:h-11 px-4 sm:px-6 rounded-full bg-accent text-on-accent text-[15px] font-medium hover:brightness-95 active:brightness-90 transition cursor-pointer"
          >
            輸入生辰
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-3 sm:px-4 mt-5 sm:mt-7 flex flex-col items-center">
        {/* 命主資訊：大字姓名 */}
        <section className="w-full max-w-5xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex items-end gap-3 min-w-0">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-card border border-separator flex items-center justify-center text-2xl font-serif text-label2">
                {userInfo.name.charAt(0)}
              </div>
              <h1 className="min-w-0 truncate text-[40px] sm:text-[56px] leading-[0.95] font-light tracking-[-0.03em]">{userInfo.name}</h1>
              <span className="shrink-0 pb-1 text-[15px] sm:text-lg text-label2">{userInfo.yinyangGender} · {userInfo.fiveElementElement}</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleLoadDemo} className={outlinePill} title="載入測試範例 (1956/02/11 巳時)">帶入範例</button>
              <button type="button" onClick={handleClearCache} className={outlinePill} title="把命盤重設為此刻時間（不會刪除已儲存的紀錄）">重置為此刻</button>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
            {[
              ['國曆', userInfo.solarBirth],
              ['農曆', userInfo.lunarBirth],
              ['真太陽時', userInfo.trueSolarBirth],
              ['命主／身主', `${userInfo.masterStar}／${userInfo.bodyMasterStar}`],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-[13px] text-label3">{k}</dt>
                <dd className="mt-0.5 text-[15px] sm:text-[17px] text-label truncate">{v}</dd>
              </div>
            ))}
          </dl>

          {/* 模式提示 */}
          <div className="mt-6 flex items-center gap-3">
            <span className="shrink-0 w-11 h-11 rounded-full bg-card flex items-center justify-center text-label2">
              <Info className="w-5 h-5" />
            </span>
            <p className="min-w-0">
              <span className="block text-[17px] text-label">{notice[0]}模式</span>
              <span className="block text-[13px] text-label3">{notice[1]}</span>
            </p>
          </div>
        </section>

        <div className="w-full mt-5">
          <ZiweiGrid data={chartData} mode={tabMode} onShift={handleShift} onModeChange={setTabMode} />
        </div>

        {/* 流運選單 */}
        <div className="w-full max-w-5xl">
          <FlowCycleBar data={baseChart} mode={tabMode} selection={flowSel} onChange={setFlowSel} />
        </div>

        {/* 儲存與 iCloud 備份 */}
        <DataStorageManager currentChart={baseChart} onLoadRecord={handleLoadRecord} />

        <p className="mb-2 text-[12px] text-label3">
          版本 {APP_VERSION} · {BUILD_TIME} 建置
        </p>
      </main>

      {/* 手機底部懸浮列 */}
      <BottomControlBar
        mode={tabMode}
        onModeChange={setTabMode}
        onOpenQuickInput={() => setIsModalOpen(true)}
        onOpenExportImage={() => document.getElementById('export-image-btn')?.click()}
        onClearCache={handleClearCache}
        onLoadDemo={handleLoadDemo}
        onOpenInfo={setInfoModalTab}
        onForceUpdate={forceUpdate}
        themePref={theme.pref}
        onThemeChange={theme.setPref}
      />

      <InputModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCalculate} />

      {/* 說明與關於 */}
      <InfoModals activeTab={infoModalTab} onClose={() => setInfoModalTab(null)} onForceUpdate={forceUpdate} />

      {/* 強制更新後的結果提示 */}
      {updateNotice && (
        <div role="status" className="fixed left-1/2 -translate-x-1/2 top-20 sm:top-24 z-[70] max-w-[calc(100%-2rem)] font-apple">
          <button
            type="button"
            onClick={() => setUpdateNotice(null)}
            className="dark island bg-card text-label rounded-full px-5 py-3 text-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.25)] cursor-pointer"
          >
            {updateNotice}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

