import React from 'react';
import type { PalaceData, Mutagen, Star, ChartTabMode, FlowLevel } from '../types/ziwei';
import { MUTAGEN_COLOR, FLOW_LEVEL_COLOR } from './chartColors';

interface PalaceCardProps {
  palace: PalaceData;
  mode: ChartTabMode;
  isSelected: boolean;
  /** 飛星模式：選取宮位的宮干飛化到本宮哪些星 */
  flyingMarks?: Record<string, Mutagen[]>;
  onSelect: (palace: PalaceData) => void;
}

const SIX_BAD = ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'];
const FEIXING_MINOR = ['紅鸞', '天喜', '天刑', '天姚'];

// 單字方塊標籤：實心 (生年／流運四化) 或空心 (自化／飛化)
const Badge: React.FC<{ text: string; color: string; outline?: boolean; big?: boolean }> = ({ text, color, outline, big }) => (
  <span
    className={`inline-flex items-center justify-center rounded-[3px] font-bold leading-none ${
      big ? 'w-4 h-4 text-[11px] sm:w-6 sm:h-6 sm:text-sm' : 'w-3.5 h-3.5 text-[9px] sm:w-4 sm:h-4 sm:text-[11px]'
    }`}
    style={outline ? { color, border: `1px solid ${color}` } : { color: '#fff', backgroundColor: color }}
  >
    {text}
  </span>
);

export const PalaceCard: React.FC<PalaceCardProps> = ({ palace, mode, isSelected, flyingMarks, onSelect }) => {
  const isFeixing = mode === 'feixing';

  const primaryStars: Star[] = [...palace.mainStars, ...palace.luckyStars, ...palace.badStars];
  const minorStars: Star[] = isFeixing
    ? palace.minorStars.filter((s) => FEIXING_MINOR.includes(s.name))
    : palace.minorStars;

  const starColor = (star: Star, small: boolean) => {
    if (isFeixing) return star.type === 'main' ? 'text-rose-800 dark:text-rose-300' : 'text-purple-800 dark:text-purple-300';
    if (small || star.name === '天馬') return 'text-blue-700 dark:text-blue-400';
    if (SIX_BAD.includes(star.name)) return 'text-label';
    return 'text-rose-700 dark:text-rose-400';
  };

  const renderBadges = (star: Star) => {
    const badges: React.ReactNode[] = [];
    if (star.mutagen) {
      // 三合模式照文墨天機：生年四化一律紅底；其他模式依四化類別上色
      const color = mode === 'sanhe' ? MUTAGEN_COLOR['忌'] : MUTAGEN_COLOR[star.mutagen];
      badges.push(<Badge key="birth" text={star.mutagen} color={color} big={isFeixing} />);
    }
    if (!isFeixing) {
      palace.flowMutagens?.filter((fm) => fm.starName === star.name).forEach((fm, i) => {
        badges.push(<Badge key={`flow-${i}`} text={fm.mutagen} color={FLOW_LEVEL_COLOR[fm.level]} />);
      });
      if (star.selfMutagen) {
        badges.push(<Badge key="self" text={star.selfMutagen} color={MUTAGEN_COLOR[star.selfMutagen]} outline />);
      }
    }
    return badges;
  };

  const renderStar = (star: Star, small: boolean) => {
    // 飛星模式：被選取宮位飛到的星，整塊填上該四化的顏色
    const fly = isFeixing ? flyingMarks?.[star.name]?.[0] : undefined;
    return (
    <div key={star.id} className="flex flex-col items-center gap-px">
      <span
        style={fly ? { backgroundColor: MUTAGEN_COLOR[fly], color: '#fff' } : undefined}
        className={`[writing-mode:vertical-rl] font-bold leading-[1.05] ${fly ? 'rounded-[3px] py-0.5' : starColor(star, small)} ${
          isFeixing
            ? 'text-[15px] sm:text-[22px]'
            : small
              ? 'text-[9px] sm:text-[12px] font-medium'
              : 'text-[12px] sm:text-[15px]'
        }`}
      >
        {star.name}
      </span>
      {!isFeixing && star.brightness && (
        <span className="text-[8px] sm:text-[10px] text-label3 leading-none">{star.brightness}</span>
      )}
      {renderBadges(star)}
    </div>
    );
  };

  const isEmpty = palace.mainStars.length === 0;

  return (
    <div
      onClick={() => onSelect(palace)}
      data-palace-index={palace.index}
      data-branch={palace.branch}
      className={`relative flex flex-col p-1 sm:p-1.5 min-h-[150px] sm:min-h-[200px] cursor-pointer select-none transition-colors ${
        isSelected ? 'bg-accent/25 dark:bg-accent/10' : 'bg-card hover:bg-grouped'
      }`}
    >
      {/* 星曜：直排，一欄一顆 */}
      <div className={`flex flex-wrap items-start gap-x-px sm:gap-x-0.5 gap-y-1 ${isFeixing ? 'flex-row-reverse' : ''}`}>
        {primaryStars.map((s) => renderStar(s, false))}
        {minorStars.map((s) => renderStar(s, true))}
      </div>

      <div className="flex items-start justify-between mt-0.5">
        {palace.isLaiYinPalace ? (
          <span className="[writing-mode:vertical-rl] text-[8px] sm:text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500 rounded-sm px-px leading-tight">
            來因
          </span>
        ) : <span />}
        {isEmpty && <span className="text-[8px] sm:text-[10px] text-label4">空宮</span>}
      </div>

      <div className="flex-1" />

      {/* 大限流曜 (綠字直排) */}
      {!isFeixing && palace.decadalStars && palace.decadalStars.length > 0 && (
        <div className="flex justify-end gap-px mb-0.5">
          {palace.decadalStars.map((s) => (
            <span key={s} className="[writing-mode:vertical-rl] text-[8px] sm:text-[11px] text-green-700 dark:text-green-400 leading-none">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* 年份歲數或流年／小限歲數 */}
      {!isFeixing && (
        palace.decadeYearInfo ? (
          <div className="text-center text-[9px] sm:text-[11px] text-label2 leading-none mb-0.5">
            {palace.decadeYearInfo.year}年{palace.decadeYearInfo.age}歲
          </div>
        ) : (
          palace.flowYearsList && !palace.dynamicDecadalName && (
            <div className="hidden sm:block text-center text-[9px] text-label3 font-mono leading-tight mb-0.5">
              <div>流年: {palace.flowYearsList.slice(0, 5).join(',')}</div>
              <div>小限: {palace.smallLimitYears.slice(0, 5).join(',')}</div>
            </div>
          )
        )
      )}

      {/* 底部 */}
      {isFeixing ? (
        <div className="flex items-end justify-between gap-0.5">
          <div className="flex flex-col text-[9px] sm:text-xs text-blue-600 dark:text-blue-400 leading-tight whitespace-nowrap">
            {palace.decadeYearInfo && (
              <>
                <span>{palace.decadeYearInfo.age}歲</span>
                <span>{palace.decadeYearInfo.year}</span>
              </>
            )}
            {palace.dynamicDecadalName && <span>{palace.dynamicDecadalName}</span>}
            {palace.flowLevelName && <span className="font-bold">{palace.flowLevelName}</span>}
          </div>
          <div className="flex flex-col items-center leading-tight">
            <span className="text-[9px] sm:text-xs text-label2 font-mono">
              {palace.decadalRange[0]}~{palace.decadalRange[1]}
            </span>
            <span className="text-[12px] sm:text-lg font-black text-blue-900 dark:text-blue-300 whitespace-nowrap">
              {palace.name}
              {palace.isBodyPalace && <span className="text-[9px] sm:text-xs text-rose-600 dark:text-rose-400 align-top">身</span>}
            </span>
          </div>
          <span className="[writing-mode:vertical-rl] text-[13px] sm:text-xl font-black text-label leading-none">
            {palace.stem}{palace.branch}
          </span>
        </div>
      ) : (
        <div className="flex items-end justify-between gap-0.5">
          <div className="flex flex-col text-[8px] sm:text-[10px] leading-tight whitespace-nowrap">
            <span className="text-blue-600 dark:text-blue-400">{palace.boshi}</span>
            <span className="text-label2">{palace.jiangqian}</span>
            <span className="text-label2">{palace.suiqian}</span>
          </div>
          <div className="flex flex-col items-center leading-tight whitespace-nowrap">
            {palace.dynamicDecadalName ? (
              <span className="text-[10px] sm:text-sm text-green-700 dark:text-green-400">{palace.dynamicDecadalName}</span>
            ) : (
              <span className="text-[9px] sm:text-xs text-label2 font-mono">
                {palace.decadalRange[0]}~{palace.decadalRange[1]}
              </span>
            )}
            {palace.flowLevelName && (
              <span
                className="text-[10px] sm:text-sm font-bold"
                style={{ color: FLOW_LEVEL_COLOR[palace.flowLevelName.charAt(0) as FlowLevel] }}
              >
                {palace.flowLevelName}
              </span>
            )}
            <span className="text-[11px] sm:text-sm font-bold text-rose-600 dark:text-rose-400">
              {palace.name}
              {palace.isBodyPalace && <span className="text-[8px] sm:text-[10px] align-top">身</span>}
            </span>
          </div>
          <div className="flex items-end gap-px">
            <span className="[writing-mode:vertical-rl] text-[8px] sm:text-[10px] text-label2 leading-none">
              {palace.changsheng}
            </span>
            <span className="[writing-mode:vertical-rl] text-[13px] sm:text-lg font-bold text-label leading-none">
              {palace.stem}{palace.branch}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
