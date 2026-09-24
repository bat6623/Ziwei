import React, { useState } from 'react';
import type { ZiweiChartData } from '../types/ziwei';
import { ChevronRight } from 'lucide-react';

interface FlowCycleBarProps {
  data: ZiweiChartData;
  onSelectDecade?: (decadeStr: string) => void;
  onSelectYear?: (year: number) => void;
  onSelectMonth?: (month: string) => void;
  onSelectDay?: (day: string) => void;
  onSelectHour?: (hour: string) => void;
}

interface DecadeItem {
  label: string;
  key: string;
  range?: [number, number];
  stemBranch?: string;
}

export const FlowCycleBar: React.FC<FlowCycleBarProps> = ({
  data,
  onSelectDecade,
  onSelectYear,
  onSelectMonth,
  onSelectDay,
  onSelectHour,
}) => {
  const currentYear = new Date().getFullYear();
  const birthYear = data.userInfo.fourPillars ? parseInt(data.userInfo.solarBirth.split('/')[0]) || (currentYear - 30) : currentYear - 30;

  // 1. 大限列表計算
  const decadeItems: DecadeItem[] = [
    { label: '起限前\n(童限)', key: 'child' },
    ...data.palaces.map((p) => ({
      label: `${p.decadalRange[0]}~${p.decadalRange[1]}\n${p.stem}${p.branch}限`,
      key: `${p.decadalRange[0]}-${p.decadalRange[1]}`,
      range: p.decadalRange,
      stemBranch: `${p.stem}${p.branch}`,
    })).sort((a, b) => a.range[0] - b.range[0]),
  ];

  // 選中的大限 (預設選中包含目前虛歲的大限)
  const nominalAge = currentYear - birthYear + 1;
  const initialDecadeKey = decadeItems.find(
    (item) => item.range && nominalAge >= item.range[0] && nominalAge <= item.range[1]
  )?.key || decadeItems[1]?.key || 'child';

  const [selectedDecade, setSelectedDecade] = useState<string>(initialDecadeKey);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>('正月');
  const [selectedDay, setSelectedDay] = useState<string>('初一');
  const [selectedHour, setSelectedHour] = useState<string>('子時');

  // 2. 流年列表計算 (根據當前年份前後 10 年)
  const flowYears = Array.from({ length: 10 }, (_, i) => {
    const yr = currentYear - 4 + i;
    const age = yr - birthYear + 1;
    // 天干地支年名簡化
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const stemName = stems[(yr - 4) % 10];
    const branchName = branches[(yr - 4) % 12];
    return {
      year: yr,
      label: `${yr}年\n${stemName}${branchName}${age}`,
    };
  });

  // 3. 流月列表 (12個月)
  const lunarMonths = [
    '正月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  // 4. 流日列表 (初一 ~ 三十)
  const lunarDays = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];

  // 5. 流時列表 (12時辰)
  const earthlyHours = [
    '子時', '丑時', '寅時', '卯時', '辰時', '巳時',
    '午時', '未時', '申時', '酉時', '戌時', '亥時'
  ];

  const handleDecadeClick = (key: string) => {
    setSelectedDecade(key);
    if (onSelectDecade) onSelectDecade(key);
  };

  const handleYearClick = (yr: number) => {
    setSelectedYear(yr);
    if (onSelectYear) onSelectYear(yr);
  };

  const handleMonthClick = (m: string) => {
    setSelectedMonth(m);
    if (onSelectMonth) onSelectMonth(m);
  };

  const handleDayClick = (d: string) => {
    setSelectedDay(d);
    if (onSelectDay) onSelectDay(d);
  };

  const handleHourClick = (h: string) => {
    setSelectedHour(h);
    if (onSelectHour) onSelectHour(h);
  };

  return (
    <div className="w-full bg-slate-200/90 border border-slate-300 rounded-lg overflow-hidden text-[11px] shadow-sm my-3 font-sans select-none">
      {/* 1. 大限列 */}
      <div className="flex border-b border-slate-300 bg-white">
        <div className="w-14 sm:w-16 bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center border-r border-slate-300 flex-shrink-0 text-center px-1 leading-tight py-1.5">
          大限
        </div>
        <div className="flex-1 flex overflow-x-auto divide-x divide-slate-200 no-scrollbar">
          {decadeItems.map((item) => {
            const isSelected = selectedDecade === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleDecadeClick(item.key)}
                className={`flex-1 min-w-[70px] sm:min-w-[80px] py-1 px-1 flex flex-col items-center justify-center text-center transition cursor-pointer leading-tight font-serif ${
                  isSelected
                    ? 'bg-blue-600 text-white font-extrabold shadow-inner'
                    : 'text-slate-800 hover:bg-slate-100 bg-white'
                }`}
              >
                {item.label.split('\n').map((line, idx) => (
                  <span key={idx} className={idx === 0 ? 'text-[10px]' : 'text-[11px] font-bold'}>
                    {line}
                  </span>
                ))}
              </button>
            );
          })}
          <div className="w-7 bg-slate-50 flex items-center justify-center text-slate-400 border-l border-slate-200 flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. 流年/小限列 */}
      <div className="flex border-b border-slate-300 bg-white">
        <div className="w-14 sm:w-16 bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center border-r border-slate-300 flex-shrink-0 text-center px-1 leading-tight py-1.5">
          流年<br />小限
        </div>
        <div className="flex-1 flex overflow-x-auto divide-x divide-slate-200 no-scrollbar">
          {flowYears.map((item) => {
            const isSelected = selectedYear === item.year;
            return (
              <button
                key={item.year}
                onClick={() => handleYearClick(item.year)}
                className={`flex-1 min-w-[75px] sm:min-w-[85px] py-1 px-1 flex flex-col items-center justify-center text-center transition cursor-pointer leading-tight font-serif ${
                  isSelected
                    ? 'bg-blue-600 text-white font-extrabold shadow-inner'
                    : 'text-slate-800 hover:bg-slate-100 bg-white'
                }`}
              >
                {item.label.split('\n').map((line, idx) => (
                  <span key={idx} className={idx === 0 ? 'text-[10px]' : 'text-[11px] font-bold'}>
                    {line}
                  </span>
                ))}
              </button>
            );
          })}
          <div className="w-7 bg-slate-50 flex items-center justify-center text-slate-400 border-l border-slate-200 flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. 流月列 */}
      <div className="flex border-b border-slate-300 bg-white">
        <div className="w-14 sm:w-16 bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center border-r border-slate-300 flex-shrink-0 text-center px-1 leading-tight py-1.5">
          流月
        </div>
        <div className="flex-1 flex overflow-x-auto divide-x divide-slate-200 no-scrollbar">
          {lunarMonths.map((m) => {
            const isSelected = selectedMonth === m;
            return (
              <button
                key={m}
                onClick={() => handleMonthClick(m)}
                className={`flex-1 min-w-[50px] sm:min-w-[60px] py-1.5 px-1 flex items-center justify-center text-center transition cursor-pointer font-bold ${
                  isSelected
                    ? 'bg-blue-600 text-white font-extrabold shadow-inner'
                    : 'text-slate-800 hover:bg-slate-100 bg-white'
                }`}
              >
                {m}
              </button>
            );
          })}
          <div className="w-7 bg-slate-50 flex items-center justify-center text-slate-400 border-l border-slate-200 flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 4. 流日列 */}
      <div className="flex border-b border-slate-300 bg-white">
        <div className="w-14 sm:w-16 bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center border-r border-slate-300 flex-shrink-0 text-center px-1 leading-tight py-1.5">
          流日
        </div>
        <div className="flex-1 flex overflow-x-auto divide-x divide-slate-200 no-scrollbar">
          {lunarDays.map((d) => {
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                onClick={() => handleDayClick(d)}
                className={`flex-1 min-w-[45px] sm:min-w-[52px] py-1.5 px-1 flex items-center justify-center text-center transition cursor-pointer font-bold ${
                  isSelected
                    ? 'bg-blue-600 text-white font-extrabold shadow-inner'
                    : 'text-slate-800 hover:bg-slate-100 bg-white'
                }`}
              >
                {d}
              </button>
            );
          })}
          <div className="w-7 bg-slate-50 flex items-center justify-center text-slate-400 border-l border-slate-200 flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 5. 流時列 */}
      <div className="flex bg-white">
        <div className="w-14 sm:w-16 bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center border-r border-slate-300 flex-shrink-0 text-center px-1 leading-tight py-1.5">
          流時
        </div>
        <div className="flex-1 flex overflow-x-auto divide-x divide-slate-200 no-scrollbar">
          {earthlyHours.map((h) => {
            const isSelected = selectedHour === h;
            return (
              <button
                key={h}
                onClick={() => handleHourClick(h)}
                className={`flex-1 min-w-[50px] sm:min-w-[60px] py-1.5 px-1 flex items-center justify-center text-center transition cursor-pointer font-bold ${
                  isSelected
                    ? 'bg-blue-600 text-white font-extrabold shadow-inner'
                    : 'text-slate-800 hover:bg-slate-100 bg-white'
                }`}
              >
                {h}
              </button>
            );
          })}
          <div className="w-7 bg-slate-50 flex items-center justify-center text-slate-400 border-l border-slate-200 flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
