import React from 'react';
import type { PalaceData, Mutagen } from '../types/ziwei';

interface PalaceCardProps {
  palace: PalaceData;
  isSelected: boolean;
  isSanFang: boolean;
  onSelect: (palace: PalaceData) => void;
}

export const PalaceCard: React.FC<PalaceCardProps> = ({
  palace,
  isSelected,
  isSanFang,
  onSelect,
}) => {
  // 年干四化標籤 (祿權科忌)
  const getMutagenBadge = (mutagen?: Mutagen) => {
    if (!mutagen) return null;
    const colors: Record<Mutagen, string> = {
      '祿': 'bg-emerald-600 text-white border-emerald-500',
      '權': 'bg-rose-600 text-white border-rose-500',
      '科': 'bg-purple-600 text-white border-purple-500',
      '忌': 'bg-sky-700 text-white border-sky-600',
    };
    return (
      <span
        className={`ml-0.5 inline-flex items-center justify-center px-1 py-0.2 text-[9.5px] font-bold rounded shadow-xs ${colors[mutagen]}`}
      >
        {mutagen}
      </span>
    );
  };

  // 宮幹自化標籤 (→祿 →權 →科 →忌)
  const getSelfMutagenBadge = (mutagen?: Mutagen) => {
    if (!mutagen) return null;
    const colors: Record<Mutagen, string> = {
      '祿': 'text-emerald-600 bg-emerald-50 border-emerald-300',
      '權': 'text-rose-600 bg-rose-50 border-rose-300',
      '科': 'text-purple-600 bg-purple-50 border-purple-300',
      '忌': 'text-sky-700 bg-sky-50 border-sky-300',
    };
    return (
      <span
        className={`ml-0.5 inline-flex items-center justify-center px-0.5 py-0.2 text-[9px] font-bold rounded border ${colors[mutagen]}`}
      >
        →{mutagen}
      </span>
    );
  };

  const getBrightnessColor = (b?: string) => {
    if (b === '廟' || b === '旺') return 'text-amber-600 font-bold';
    if (b === '陷') return 'text-slate-400 font-normal';
    return 'text-slate-500 font-normal';
  };

  return (
    <div
      onClick={() => onSelect(palace)}
      data-palace-index={palace.index}
      className={`relative flex flex-col justify-between p-2 border rounded-lg transition-all duration-200 cursor-pointer select-none overflow-hidden min-h-[160px] sm:min-h-[190px] ${
        isSelected
          ? 'bg-amber-50/90 border-2 border-amber-500 shadow-md z-20 scale-[1.01]'
          : isSanFang
          ? 'bg-sky-50/80 border-2 border-sky-400 shadow-sm z-10'
          : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-slate-50/80 shadow-xs'
      }`}
    >
      {/* 頂部：方位、來因宮印章與宮名 */}
      <div className="flex justify-between items-start text-[11px] border-b border-slate-100 pb-1">
        <div className="flex flex-col text-slate-500">
          <div className="flex items-center gap-1">
            {/* 方位 */}
            <span className="text-[9px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-1 py-0.2 rounded">
              {palace.direction} ({palace.directionEightTrigram})
            </span>
          </div>
          <span className="text-[9px] text-slate-400 mt-0.5">{palace.boshi} • {palace.suiqian}</span>
        </div>
        
        {/* 宮名、身宮與來因刻印章 (圖 1 & 2) */}
        <div className="flex items-center gap-1">
          {palace.isLaiYinPalace && (
            <span className="border-2 border-rose-600 text-rose-600 font-extrabold text-[8.5px] px-0.5 py-0.2 rounded bg-rose-50/70 shadow-2xs leading-none">
              來因
            </span>
          )}
          {palace.isBodyPalace && (
            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1 py-0.2 rounded border border-rose-300">
              身宮
            </span>
          )}
          <span
            className={`font-black tracking-widest px-2 py-0.5 rounded text-xs ${
              palace.name === '命宮'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-800 bg-slate-100 border border-slate-200'
            }`}
          >
            {palace.name}
          </span>
        </div>
      </div>

      {/* 中間星曜區 (主星 / 六吉六凶 / 乙級星) */}
      <div className="grid grid-cols-2 gap-1 my-1 flex-1">
        {/* 左欄：甲級主星 */}
        <div className="flex flex-col gap-0.5 border-r border-slate-100 pr-1">
          {palace.mainStars.map((star) => (
            <div key={star.id} className="flex items-center justify-between text-xs sm:text-sm font-black tracking-tight">
              <span className="text-purple-900 flex items-center flex-wrap gap-0.5">
                {star.name}
                {getMutagenBadge(star.mutagen)}
                {getSelfMutagenBadge(star.selfMutagen)}
                {/* 動態大限/流年四化 */}
                {palace.flowMutagens?.filter((fm) => fm.starName === star.name).map((fm, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-0.5 py-0.2 text-[8.5px] font-bold rounded shadow-2xs ${
                      fm.label.startsWith('大')
                        ? 'bg-purple-700 text-white border border-purple-800'
                        : 'bg-amber-600 text-white border border-amber-700'
                    }`}
                  >
                    {fm.label}
                  </span>
                ))}
              </span>
              <span className={`text-[9.5px] ${getBrightnessColor(star.brightness)}`}>
                {star.brightness}
              </span>
            </div>
          ))}
          {palace.mainStars.length === 0 && (
            <span className="text-[11px] text-slate-400 italic">【空宮】</span>
          )}
        </div>

        {/* 右欄：吉星 + 乙級雜曜 */}
        <div className="flex flex-col gap-1 text-[10.5px] pl-1">
          {/* 吉星 (藍色) */}
          <div className="flex flex-wrap gap-x-0.5 gap-y-0.5">
            {palace.luckyStars.map((star) => (
              <span key={star.id} className="text-sky-700 font-bold inline-flex items-center gap-0.5">
                {star.name}
                {getMutagenBadge(star.mutagen)}
                {getSelfMutagenBadge(star.selfMutagen)}
                {palace.flowMutagens?.filter((fm) => fm.starName === star.name).map((fm, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-0.5 py-0.2 text-[8.5px] font-bold rounded shadow-2xs ${
                      fm.label.startsWith('大')
                        ? 'bg-purple-700 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {fm.label}
                  </span>
                ))}
              </span>
            ))}
          </div>
          {/* 乙級雜曜 (玫瑰/橘色) */}
          <div className="flex flex-wrap gap-x-1 gap-y-0.5 text-[9.5px]">
            {palace.minorStars.map((star) => (
              <span key={star.id} className="text-rose-700 font-semibold bg-rose-50/60 px-0.5 rounded">
                {star.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 流年與小限歲數細字 (圖 2) */}
      {palace.flowYearsList && palace.flowYearsList.length > 0 && (
        <div className="text-[8.5px] text-slate-400 font-mono my-0.5 leading-none flex justify-between px-0.5">
          <span>流年: {palace.flowYearsList.slice(0, 4).join(',')}</span>
          <span>小限: {palace.smallLimitYears.slice(0, 4).join(',')}</span>
        </div>
      )}

      {/* 底部：大限/流年縮寫、大限歲數、農曆月份、天干地支 */}
      <div className="flex justify-between items-end text-[10px] sm:text-[11px] pt-1 border-t border-slate-100 mt-auto">
        <div className="flex flex-col text-slate-500">
          {/* 當前選擇流年時呈現藍字三行: [9歲, 2034, 大命] (完全吻合圖 3) */}
          {palace.currentSelectedAgeInfo ? (
            <div className="flex flex-col leading-tight text-blue-700 font-extrabold text-[9px] font-mono">
              <span>{palace.currentSelectedAgeInfo.age}歲</span>
              <span>{palace.currentSelectedAgeInfo.year}</span>
              <span className="text-blue-900 font-black">{palace.currentSelectedAgeInfo.decadalPalaceName}</span>
            </div>
          ) : (
            <>
              {/* 大限與流年宮位簡稱 (如 年命 大命) */}
              <div className="flex items-center gap-1 text-[9px] font-bold">
                <span
                  className={`px-1 py-0.2 rounded ${
                    palace.isCurrentFlowYearPalace
                      ? 'bg-amber-600 text-white font-extrabold shadow-2xs border border-amber-700'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  {palace.dynamicFlowYearName || palace.flowYearPalaceName}
                </span>
                <span
                  className={`px-1 py-0.2 rounded ${
                    palace.isCurrentDecadalPalace
                      ? 'bg-purple-700 text-white font-extrabold shadow-2xs border border-purple-800'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {palace.dynamicDecadalName || palace.decadalPalaceName}
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold text-slate-600 mt-0.5">
                {palace.decadalRange[0]}~{palace.decadalRange[1]}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[9.5px] text-slate-500 font-serif">
            {palace.lunarMonthName}
          </span>
          <span className="font-bold text-slate-800 font-mono text-xs bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
            {palace.stem}{palace.branch}
          </span>
        </div>
      </div>
    </div>
  );
};
