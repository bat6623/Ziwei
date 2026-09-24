import React, { useState } from 'react';
import type { BirthInput, Gender } from '../types/ziwei';
import { Clock, X } from 'lucide-react';
import { LunarMonth } from 'lunar-javascript';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: BirthInput) => void;
}

// 12地支時辰對照清單 (名稱, 時間範圍描述, 快選代表小時)
const ZODIAC_HOURS = [
  { name: '子時', range: '23:00 - 01:00', hour: 0, minHour: 23, maxHour: 0 },
  { name: '丑時', range: '01:00 - 03:00', hour: 2, minHour: 1, maxHour: 2 },
  { name: '寅時', range: '03:00 - 05:00', hour: 4, minHour: 3, maxHour: 4 },
  { name: '卯時', range: '05:00 - 07:00', hour: 6, minHour: 5, maxHour: 6 },
  { name: '辰時', range: '07:00 - 09:00', hour: 8, minHour: 7, maxHour: 8 },
  { name: '巳時', range: '09:00 - 11:00', hour: 10, minHour: 9, maxHour: 10 },
  { name: '午時', range: '11:00 - 13:00', hour: 12, minHour: 11, maxHour: 12 },
  { name: '未時', range: '13:00 - 15:00', hour: 14, minHour: 13, maxHour: 14 },
  { name: '申時', range: '15:00 - 17:00', hour: 16, minHour: 15, maxHour: 16 },
  { name: '酉時', range: '17:00 - 19:00', hour: 18, minHour: 17, maxHour: 18 },
  { name: '戌時', range: '19:00 - 21:00', hour: 20, minHour: 19, maxHour: 20 },
  { name: '亥時', range: '21:00 - 23:00', hour: 22, minHour: 21, maxHour: 22 },
];

export const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const now = new Date();
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [isLunar, setIsLunar] = useState<boolean>(false);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [day, setDay] = useState<number>(now.getDate());
  const [hour, setHour] = useState<number>(now.getHours());
  const [minute, setMinute] = useState<number>(now.getMinutes());
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // 帶入即時時間 (此刻)
  const handleFillNow = () => {
    const cur = new Date();
    setYear(cur.getFullYear());
    setMonth(cur.getMonth() + 1);
    setDay(cur.getDate());
    setHour(cur.getHours());
    setMinute(cur.getMinutes());
  };

  // 快選日期 (HTML date picker)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // 直接拆字串，避免 new Date('YYYY-MM-DD') 以 UTC 解析造成西半球時區差一天
      const [y, m, d] = e.target.value.split('-').map(Number);
      setYear(y);
      setMonth(m);
      setDay(d);
    }
  };

  // 快選地支時辰
  const handleSelectZodiacHour = (targetHour: number) => {
    setHour(targetHour);
    setMinute(0);
  };

  // 判斷當前小時屬於哪一個地支時辰
  const getCurrentZodiacHourName = (): string => {
    if (hour === 23 || hour === 0) return '子時';
    if (hour >= 1 && hour < 3) return '丑時';
    if (hour >= 3 && hour < 5) return '寅時';
    if (hour >= 5 && hour < 7) return '卯時';
    if (hour >= 7 && hour < 9) return '辰時';
    if (hour >= 9 && hour < 11) return '巳時';
    if (hour >= 11 && hour < 13) return '午時';
    if (hour >= 13 && hour < 15) return '未時';
    if (hour >= 15 && hour < 17) return '申時';
    if (hour >= 17 && hour < 19) return '酉時';
    if (hour >= 19 && hour < 21) return '戌時';
    if (hour >= 21 && hour < 23) return '亥時';
    return '子時';
  };

  const currentZodiac = getCurrentZodiacHourName();

  // 檢查日期時間是否真的存在（例如國曆 2/30、農曆小月的三十日）
  const validate = (): string => {
    if (![year, month, day, hour, minute].every(Number.isInteger)) return '請填寫完整的日期與時間';
    if (year < 1900 || year > 2100) return '年份請輸入 1900 到 2100 之間';
    if (month < 1 || month > 12) return '月份請輸入 1 到 12';
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return '時間格式不正確';
    if (isLunar) {
      const dayCount = LunarMonth.fromYm(year, month)?.getDayCount() ?? 30;
      if (day < 1 || day > dayCount) return `農曆 ${year} 年 ${month} 月只有 ${dayCount} 天`;
    } else {
      const d = new Date(year, month - 1, day);
      if (day < 1 || d.getMonth() !== month - 1) return `國曆 ${year} 年 ${month} 月沒有 ${day} 日`;
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    setError(msg);
    if (msg) return;
    onSubmit({
      name: name.trim() || '未命名',
      gender,
      isLunar,
      year,
      month,
      day,
      hour,
      minute,
    });
    onClose();
  };

  // 格式化目前日期供 HTML date 選擇器使用
  const datePickerValue = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const field = 'w-full h-12 rounded-full bg-fill px-5 text-[15px] text-label placeholder:text-label3 outline-none focus:ring-2 focus:ring-accent';
  const label = 'block mb-1.5 pl-5 text-[13px] text-label3';
  // 數字欄：留白較少，隱藏上下箭頭，手機上四位數年份才放得下
  const numField = 'w-full h-12 rounded-full bg-fill pl-3 pr-8 text-center text-[15px] text-label outline-none focus:ring-2 focus:ring-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';
  const track = 'flex p-1 rounded-full bg-grouped';
  const seg = (on: boolean) =>
    `flex-1 h-10 rounded-full text-[15px] transition-colors cursor-pointer ${on ? 'bg-panel text-white dark:bg-accent dark:text-on-accent' : 'text-label2 hover:text-label'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto font-apple" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-[28px] my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 pt-5">
          <h3 className="flex-1 text-[28px] font-light tracking-tight text-label">輸入生辰</h3>
          <button type="button" onClick={handleFillNow} className="h-10 px-4 rounded-full border border-separator text-[13px] text-label flex items-center gap-1.5 hover:bg-fill cursor-pointer">
            <Clock className="w-4 h-4" /> 此刻
          </button>
          <button type="button" onClick={onClose} aria-label="關閉" className="w-10 h-10 rounded-full border border-separator text-label flex items-center justify-center hover:bg-fill cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-label">
          <div>
            <label className={label} htmlFor="birth-name">姓名</label>
            <input id="birth-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="選填，留空會顯示「未命名」" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>性別</span>
              <div className={track}>
                <button type="button" onClick={() => setGender('male')} className={seg(gender === 'male')}>乾造 男</button>
                <button type="button" onClick={() => setGender('female')} className={seg(gender === 'female')}>坤造 女</button>
              </div>
            </div>
            <div>
              <span className={label}>曆法</span>
              <div className={track}>
                <button type="button" onClick={() => setIsLunar(false)} className={seg(!isLunar)}>國曆</button>
                <button type="button" onClick={() => setIsLunar(true)} className={seg(isLunar)}>農曆</button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between pr-2">
              <span className={label}>出生年月日{isLunar ? '（農曆）' : ''}</span>
              {/* 原生日曆快選 (國曆日曆，農曆模式不適用) */}
              {!isLunar && (
                <input
                  type="date"
                  value={datePickerValue}
                  onChange={handleDateChange}
                  aria-label="用日曆選日期"
                  className="mb-1.5 h-8 rounded-full bg-fill px-3 text-[13px] text-label2 outline-none cursor-pointer"
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([['年', year, setYear, 1900, 2100], ['月', month, setMonth, 1, 12], ['日', day, setDay, 1, 31]] as const).map(([unit, value, set, min, max]) => (
                <label key={unit} className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => set(Number(e.target.value))}
                    min={min}
                    max={max}
                    required
                    className={numField}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-label3 pointer-events-none">{unit}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between pr-2">
              <span className={label}>出生時辰</span>
              <span className="mb-1.5 text-[13px] text-label2">
                {currentZodiac}・{String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-[24px] bg-grouped">
              {ZODIAC_HOURS.map((item) => {
                const isSelected = currentZodiac === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectZodiacHour(item.hour)}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-full transition-colors cursor-pointer ${
                      isSelected ? 'bg-panel text-white dark:bg-accent dark:text-on-accent' : 'text-label2 hover:bg-card'
                    }`}
                  >
                    <span className="text-[15px]">{item.name}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-white/70 dark:text-on-accent/70' : 'text-label3'}`}>{item.range.replace(/ /g, '')}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([['時', hour, setHour, 0, 23], ['分', minute, setMinute, 0, 59]] as const).map(([unit, value, set, min, max]) => (
                <label key={unit} className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => set(Number(e.target.value))}
                    min={min}
                    max={max}
                    required
                    className={numField}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-label3 pointer-events-none">{unit}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[13px] text-danger text-center">{error}</p>
          )}
          <button
            type="submit"
            className="w-full h-12 rounded-full bg-accent text-on-accent text-[17px] font-medium hover:brightness-95 active:brightness-90 transition cursor-pointer"
          >
            開始排盤
          </button>
        </form>
      </div>
    </div>
  );
};
