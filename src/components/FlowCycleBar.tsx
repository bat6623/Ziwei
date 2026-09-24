import React from 'react';
import type { ZiweiChartData, FlowSelection, ChartTabMode } from '../types/ziwei';
import {
  getDecadeList,
  getDefaultDecadeKey,
  getFlowYears,
  getLunarMonthDayCount,
  LUNAR_DAY_NAMES,
  LUNAR_MONTH_LABELS,
} from '../utils/ziweiEngine';

interface FlowCycleBarProps {
  data: ZiweiChartData;
  mode: ChartTabMode;
  selection: FlowSelection;
  onChange: (sel: FlowSelection) => void;
}

const HOUR_LABELS = ['子時', '丑時', '寅時', '卯時', '辰時', '巳時', '午時', '未時', '申時', '酉時', '戌時', '亥時'];

const cellClass = (selected: boolean, disabled = false) =>
  `shrink-0 rounded-full py-1.5 px-1 text-center leading-tight whitespace-nowrap transition-colors ${
    disabled
      ? 'text-label4 cursor-not-allowed'
      : selected
        ? 'bg-panel text-white dark:bg-accent dark:text-on-accent cursor-pointer'
        : 'text-label2 hover:bg-card hover:text-label active:bg-fill cursor-pointer'
  }`;

const RowLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-10 sm:w-14 shrink-0 text-[12px] sm:text-[13px] text-label3 leading-tight">
    {children}
  </div>
);

export const FlowCycleBar: React.FC<FlowCycleBarProps> = ({ data, mode, selection, onChange }) => {
  const decades = getDecadeList(data);
  const rowDecadeKey = selection.decadeKey ?? getDefaultDecadeKey(data);
  const years = getFlowYears(data, rowDecadeKey);
  const dayCount = selection.year !== null && selection.month !== null
    ? getLunarMonthDayCount(selection.year, selection.month)
    : 30;
  const showDetail = mode === 'sanhe'; // 飛星、四化模式只看大限與流年

  const pickDecade = (key: string) =>
    onChange(selection.decadeKey === key
      ? { decadeKey: null, year: null, month: null, day: null, hour: null }
      : { decadeKey: key, year: null, month: null, day: null, hour: null });

  const pickYear = (year: number) =>
    onChange(selection.year === year
      ? { ...selection, year: null, month: null, day: null, hour: null }
      : { decadeKey: rowDecadeKey, year, month: null, day: null, hour: null });

  const pickMonth = (month: number) =>
    onChange(selection.month === month
      ? { ...selection, month: null, day: null, hour: null }
      : { ...selection, month, day: null, hour: null });

  const pickDay = (day: number) =>
    onChange(selection.day === day ? { ...selection, day: null, hour: null } : { ...selection, day, hour: null });

  const pickHour = (hour: number) =>
    onChange({ ...selection, hour: selection.hour === hour ? null : hour });

  const scrollRow = 'flex-1 min-w-0 flex gap-0.5 overflow-x-auto no-scrollbar p-1 rounded-full bg-grouped';

  return (
    <div className="w-full rounded-[28px] bg-card p-3 sm:p-4 text-[11px] sm:text-[13px] my-4 font-apple select-none space-y-2">
      {/* 大限 */}
      <div className="flex items-center gap-2">
        <RowLabel>大限</RowLabel>
        <div className={scrollRow}>
          <button type="button" onClick={() => pickDecade('child')} className={`min-w-[64px] flex-1 ${cellClass(selection.decadeKey === 'child')}`}>
            <div>起限前</div><div>(童限)</div>
          </button>
          {decades.map((d) => (
            <button key={d.key} type="button" onClick={() => pickDecade(d.key)} className={`min-w-[64px] flex-1 ${cellClass(selection.decadeKey === d.key)}`}>
              <div>{d.range[0]}~{d.range[1]}</div>
              <div>{d.stem}{d.branch}限</div>
            </button>
          ))}
        </div>
      </div>

      {/* 流年 */}
      <div className="flex items-center gap-2">
        <RowLabel>流年<br />小限</RowLabel>
        <div className={scrollRow}>
          {years.map((y) => (
            <button key={y.year} type="button" onClick={() => pickYear(y.year)} className={`min-w-[64px] flex-1 ${cellClass(selection.year === y.year)}`}>
              <div>{y.year}年</div>
              <div>{y.stem}{y.branch}{y.age}</div>
            </button>
          ))}
        </div>
      </div>

      {showDetail && (
        <>
          {/* 流月 */}
          <div className="flex items-center gap-2">
            <RowLabel>流月</RowLabel>
            <div className={scrollRow}>
              {LUNAR_MONTH_LABELS.map((label, i) => {
                const disabled = selection.year === null;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={disabled}
                    title={disabled ? '請先選流年' : undefined}
                    onClick={() => pickMonth(i + 1)}
                    className={`min-w-[52px] flex-1 ${cellClass(selection.month === i + 1, disabled)}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 流日：一次列出三十天，不用左右滑 */}
          <div className="flex items-center gap-2">
            <RowLabel>流日</RowLabel>
            <div className="flex-1 min-w-0 grid grid-cols-10 gap-0.5 p-1 rounded-[22px] bg-grouped">
              {LUNAR_DAY_NAMES.map((label, i) => {
                const day = i + 1;
                const disabled = selection.month === null || day > dayCount;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={disabled}
                    title={selection.month === null ? '請先選流月' : day > dayCount ? '這個月沒有這一天' : undefined}
                    onClick={() => pickDay(day)}
                    className={cellClass(selection.day === day, disabled)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 流時 */}
          <div className="flex items-center gap-2">
            <RowLabel>流時</RowLabel>
            <div className={scrollRow}>
              {HOUR_LABELS.map((label, i) => {
                const disabled = selection.day === null;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={disabled}
                    title={disabled ? '請先選流日' : undefined}
                    onClick={() => pickHour(i)}
                    className={`min-w-[52px] flex-1 ${cellClass(selection.hour === i, disabled)}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
