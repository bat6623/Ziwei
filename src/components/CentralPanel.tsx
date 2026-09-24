import React from 'react';
import type { ZiweiChartData } from '../types/ziwei';
import { Sparkles, Calendar, User, Compass, Clock } from 'lucide-react';

interface CentralPanelProps {
  data: ZiweiChartData;
  selectedPalaceName?: string;
}

export const CentralPanel: React.FC<CentralPanelProps> = ({ data, selectedPalaceName }) => {
  const { userInfo } = data;

  // 十神文字對應色彩
  const getTenGodColor = (tg: string) => {
    if (tg.includes('財')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (tg.includes('官') || tg.includes('殺')) return 'text-purple-700 bg-purple-50 border-purple-200';
    if (tg.includes('印')) return 'text-sky-700 bg-sky-50 border-sky-200';
    if (tg.includes('食') || tg.includes('傷')) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-amber-50/60 via-white to-slate-50/80 border-2 border-amber-300/80 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between text-slate-800 relative overflow-hidden shadow-sm backdrop-blur-xs">
      {/* 浮水印 */}
      <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none text-amber-700 font-serif text-9xl select-none">
        紫微
      </div>

      {/* 標題 */}
      <div className="flex justify-between items-center border-b border-amber-200 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h2 className="text-base font-black text-amber-800 tracking-wider font-serif">
            文墨天機 <span className="text-[10px] text-slate-500 font-sans font-normal">pro 2.5.20</span>
          </h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-bold">
          C5VUC
        </span>
      </div>

      {/* 基本資料 */}
      <div className="grid grid-cols-2 gap-2 my-1 text-xs">
        <div className="flex items-center gap-1 text-slate-700">
          <User className="w-3.5 h-3.5 text-amber-600" />
          <span>姓名：<strong className="text-slate-900 font-black">{userInfo.name}</strong></span>
        </div>
        <div className="text-right text-amber-800 font-bold">
          {userInfo.yinyangGender} <span className="text-cyan-700 ml-1">{userInfo.fiveElementElement}</span>
        </div>
      </div>

      {/* 鐘錶時間、真太陽時與農曆 */}
      <div className="bg-white/90 rounded-lg p-2 border border-slate-200 space-y-0.5 text-xs font-mono shadow-2xs">
        {userInfo.trueSolarBirth && (
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-slate-500 flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-amber-600" /> 真太陽時：
            </span>
            <span className="text-amber-900 font-bold">{userInfo.trueSolarBirth}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-slate-700">
          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
            <Calendar className="w-3 h-3 text-slate-400" /> 鐘錶時間：
          </span>
          <span className="text-amber-800 font-bold">{userInfo.solarBirth}</span>
        </div>
        <div className="flex items-center justify-between text-slate-700">
          <span className="text-slate-500 text-[11px]">農曆：</span>
          <span className="text-emerald-700 font-bold">{userInfo.lunarBirth}</span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-700 pt-1 border-t border-slate-100 font-sans">
          <span>命主：<strong className="text-amber-700 font-bold">{userInfo.masterStar}</strong></span>
          <span>身主：<strong className="text-cyan-700 font-bold">{userInfo.bodyMasterStar}</strong></span>
          <span>子鬥：<strong className="text-rose-700 font-bold">{userInfo.ziDou}</strong></span>
        </div>
      </div>

      {/* 節氣與非節氣八字四柱 */}
      <div className="my-1 bg-amber-50/40 p-1.5 rounded-lg border border-amber-200/80">
        <div className="text-[10px] text-slate-500 mb-0.5 flex justify-between font-medium">
          <span>節氣四柱</span>
          <span className="text-slate-400">非節氣四柱</span>
        </div>
        <div className="grid grid-cols-4 gap-1 text-center font-bold text-xs sm:text-sm font-serif">
          <div className="bg-white p-0.5 rounded border border-rose-300 text-rose-700 shadow-2xs">
            {userInfo.fourPillars.year}
          </div>
          <div className="bg-white p-0.5 rounded border border-amber-300 text-amber-800 shadow-2xs">
            {userInfo.fourPillars.month}
          </div>
          <div className="bg-white p-0.5 rounded border border-cyan-300 text-cyan-800 shadow-2xs">
            {userInfo.fourPillars.day}
          </div>
          <div className="bg-white p-0.5 rounded border border-emerald-300 text-emerald-800 shadow-2xs">
            {userInfo.fourPillars.time}
          </div>
        </div>
        <div className="text-center text-[10px] text-amber-800 font-semibold mt-0.5">
          {userInfo.startAgeDetail || userInfo.startAgeNotice}
        </div>
      </div>

      {/* 八字大運走勢圖卡片 (8步大運) */}
      {userInfo.luckCycles && userInfo.luckCycles.length > 0 && (
        <div className="bg-slate-50/90 rounded-lg p-1.5 border border-slate-200 my-0.5">
          <div className="text-[9.5px] text-slate-400 font-bold mb-0.5 text-center">八字大運順逆走勢圖</div>
          <div className="grid grid-cols-8 gap-0.5 text-center">
            {userInfo.luckCycles.map((cycle, idx) => (
              <div key={idx} className="flex flex-col items-center">
                {/* 十神 */}
                <span className={`text-[8.5px] font-bold px-0.5 rounded border ${getTenGodColor(cycle.tenGod)}`}>
                  {cycle.tenGod.substring(0, 2)}
                </span>
                {/* 干支 */}
                <span className="text-[10px] font-bold font-serif text-slate-800 mt-0.5">
                  {cycle.stemBranch}
                </span>
                {/* 虛歲 */}
                <span className="text-[8.5px] text-slate-500 font-mono">
                  {cycle.age}歲
                </span>
                {/* 年份 */}
                <span className="text-[8px] text-slate-400 font-mono">
                  {cycle.year}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 流年與自化說明 */}
      <div className="space-y-0.5">
        <div className="text-center bg-amber-100/60 border border-amber-300/80 rounded py-0.5">
          <span className="text-[11px] font-bold text-amber-900 tracking-wider">
            流年：{userInfo.currentFlowYear}
          </span>
        </div>

        <div className="flex justify-center items-center gap-2 text-[9.5px] text-slate-600 bg-white py-0.5 rounded border border-slate-200">
          <span className="text-slate-500">自化圖示：</span>
          <span className="text-emerald-600 font-bold">→祿</span>
          <span className="text-rose-600 font-bold">→權</span>
          <span className="text-purple-600 font-bold">→科</span>
          <span className="text-sky-700 font-bold">→忌</span>
        </div>
      </div>

      {selectedPalaceName && (
        <div className="mt-1 text-center bg-sky-50 border border-sky-300 py-0.5 rounded-lg text-xs text-sky-800 font-bold animate-pulse flex items-center justify-center gap-1 shadow-2xs">
          <Compass className="w-3.5 h-3.5" />
          <span>正在檢視：<strong>{selectedPalaceName}</strong> (三方四正高亮中)</span>
        </div>
      )}
    </div>
  );
};
