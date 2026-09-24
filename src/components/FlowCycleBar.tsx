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
  `py-1.5 px-0.5 text-center leading-tight transition-colors ${
    disabled
      ? 'text-[#c7c7cc] cursor-not-allowed'
      : selected
        ? 'bg-[#007aff] text-white font-semibold cursor-pointer'
        : 'text-black active:bg-[#e5e5ea] hover:bg-[#f2f2f7] cursor-pointer'
  }`;

const RowLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-11 sm:w-14 shrink-0 bg-[#f9f9fb] border-r border-[#c6c6c8]/60 flex items-center justify-center text-center font-semibold text-[#3c3c43] text-[12px] sm:text-sm leading-tight">
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
  const showDetail = mode !== 'feixing'; // 飛星模式只看大限與流年

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

  const scrollRow = 'flex-1 flex overflow-x-auto divide-x divide-[#c6c6c8]/40 no-scrollbar';

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white text-[11px] sm:text-[13px] my-4 font-apple select-none divide-y divide-[#c6c6c8]/60">
      {/* 大限 */}
      <div className="flex">
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
      <div className="flex">
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
          <div className="flex">
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
          <div className="flex">
            <RowLabel>流日</RowLabel>
            <div className="flex-1 grid grid-cols-10 gap-px bg-[#c6c6c8]/40">
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
                    className={`bg-white ${cellClass(selection.day === day, disabled)}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 流時 */}
          <div className="flex">
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
