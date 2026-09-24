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
        className={`ml-1 inline-flex items-center justify-center px-1 py-0.2 text-[10px] font-bold rounded shadow-xs ${colors[mutagen]}`}
      >
        {mutagen}
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
      className={`relative flex flex-col justify-between p-2 border rounded-lg transition-all duration-200 cursor-pointer select-none overflow-hidden min-h-[155px] sm:min-h-[185px] ${
        isSelected
          ? 'bg-amber-50/90 border-2 border-amber-500 shadow-md z-20 scale-[1.01]'
          : isSanFang
          ? 'bg-sky-50/80 border-2 border-sky-400 shadow-sm z-10'
          : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-slate-50/80 shadow-xs'
      }`}
    >
      {/* 方位與宮位標題 */}
      <div className="flex justify-between items-start text-[11px] border-b border-slate-100 pb-1">
        <div className="flex flex-col text-slate-500">
          {/* 地理八卦方位 */}
          <span className="text-[9.5px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-1 py-0.2 rounded w-max">
            {palace.direction} ({palace.directionEightTrigram})
          </span>
          <span className="text-[9px] text-slate-400 mt-0.5">{palace.boshi} • {palace.suiqian}</span>
        </div>
        
        {/* 宮名標籤 */}
        <div className="flex items-center gap-1">
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

      {/* 中間星曜區 (主星 / 六吉六凶 / 乙級星 / 丙級神煞) */}
      <div className="grid grid-cols-2 gap-1 my-1 flex-1">
        {/* 左欄：甲級主星 */}
        <div className="flex flex-col gap-0.5 border-r border-slate-100 pr-1">
          {palace.mainStars.map((star) => (
            <div key={star.id} className="flex items-center justify-between text-xs sm:text-sm font-black tracking-tight">
              <span className="text-purple-900 flex items-center">
                {star.name}
                {getMutagenBadge(star.mutagen)}
              </span>
              <span className={`text-[10px] ${getBrightnessColor(star.brightness)}`}>
                {star.brightness}
              </span>
            </div>
          ))}
          {palace.mainStars.length === 0 && (
            <span className="text-[11px] text-slate-400 italic">【空宮】</span>
          )}
        </div>

        {/* 右欄：吉星 + 乙級雜曜 (紅鸞/天喜/天刑/孤辰等) */}
        <div className="flex flex-col gap-1 text-[10.5px] pl-1">
          {/* 吉星 (藍色) */}
          <div className="flex flex-wrap gap-x-1 gap-y-0.5">
            {palace.luckyStars.map((star) => (
              <span key={star.id} className="text-sky-700 font-bold inline-flex items-center">
                {star.name}
                {getMutagenBadge(star.mutagen)}
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

      {/* 底部：大限歲數、長生十二神、地支天干 */}
      <div className="flex justify-between items-end text-[10px] sm:text-[11px] pt-1 border-t border-slate-100 mt-auto">
        <div className="flex flex-col text-slate-500">
          <span className="font-mono text-[10.5px] font-bold text-slate-600">
            {palace.decadalRange[0]}-{palace.decadalRange[1]}
          </span>
          <span className="text-[9px] text-slate-400">{palace.changsheng}</span>
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
