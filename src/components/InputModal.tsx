import React, { useState } from 'react';
import type { BirthInput, Gender } from '../types/ziwei';
import { Calendar, User, Clock, Sparkles, X, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 p-4 border-b border-amber-400 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-100" />
            <h3 className="text-lg font-bold font-serif tracking-wide">輸入生辰八字排盤</h3>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-lg hover:bg-amber-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-slate-800">
          {/* 快選按鈕工具列 */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500">快捷操作：</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFillNow}
                className="text-xs bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 px-3 py-1 rounded-full flex items-center gap-1 transition font-bold"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-600" />
                填入此刻時間
              </button>
            </div>
          </div>

          {/* 姓名與性別 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-600" /> 姓名 / 代稱
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                placeholder="選填，留空會顯示「未命名」"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">性別</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    gender === 'male'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  乾造 (男)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    gender === 'female'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  坤造 (女)
                </button>
              </div>
            </div>
          </div>

          {/* 出生曆法 */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">出生曆法</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsLunar(false)}
                className={`py-2 text-xs font-bold rounded-lg border transition ${
                  !isLunar
                    ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                陽曆 (西元)
              </button>
              <button
                type="button"
                onClick={() => setIsLunar(true)}
                className={`py-2 text-xs font-bold rounded-lg border transition ${
                  isLunar
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                農曆 (陰曆)
              </button>
            </div>
          </div>

          {/* 日期快選 (含日曆 Pickers) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> 出生年月日
              </label>
              {/* 原生日曆快選 (國曆日曆，農曆模式不適用) */}
              {!isLunar && <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400">日曆點選:</span>
                <input
                  type="date"
                  value={datePickerValue}
                  onChange={handleDateChange}
                  className="text-xs bg-slate-100 border border-slate-300 rounded px-2 py-0.5 text-slate-700 cursor-pointer focus:outline-none"
                />
              </div>}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400">年</span>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={1900}
                  max={2100}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-sm font-bold text-center focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">月</span>
                <input
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  min={1}
                  max={12}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-sm font-bold text-center focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">日</span>
                <input
                  type="number"
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  min={1}
                  max={31}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-sm font-bold text-center focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* 十二地支時辰快捷選擇器 */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> 出生時辰快捷點選 (十二地支)
              </label>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                目前選定：{currentZodiac} ({String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')})
              </span>
            </div>

            {/* 地支時辰快選按鈕網格 (4x3 Grid) */}
            <div className="grid grid-cols-4 gap-1.5">
              {ZODIAC_HOURS.map((item) => {
                const isSelected = currentZodiac === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectZodiacHour(item.hour)}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition text-center cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-black'
                        : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <span className="text-xs font-bold font-serif flex items-center gap-0.5">
                      {item.name}
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </span>
                    <span className={`text-[9px] ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                      {item.range}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 精細小時/分鐘數字調校 */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">小時 (0~23 時)</label>
                <input
                  type="number"
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  min={0}
                  max={23}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-sm text-center font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">分鐘 (0~59 分)</label>
                <input
                  type="number"
                  value={minute}
                  onChange={(e) => setMinute(Number(e.target.value))}
                  min={0}
                  max={59}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 text-sm text-center font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* 排盤提交按鈕 */}
          <div className="pt-3 border-t border-slate-200">
            {error && (
              <p role="alert" className="mb-2 text-xs font-bold text-rose-600 text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black py-3 rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 text-base tracking-widest cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-white" />
              開始精準紫微排盤
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
