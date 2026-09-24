import React, { useState } from 'react';
import type { BirthInput, Gender } from '../types/ziwei';
import { Calendar, User, Clock, Sparkles, X } from 'lucide-react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: BirthInput) => void;
}

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

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setName('測試範例');
    setGender('male');
    setIsLunar(false);
    setYear(1956);
    setMonth(2);
    setDay(11);
    setHour(10);
    setMinute(5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1 transition shadow-2xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              帶入測試範例資料 (1956/02/11 巳時)
            </button>
          </div>

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
                placeholder="請輸入姓名 (如：張三)"
                required
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> 年 (西元/農曆)
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1900}
                max={2050}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">月</label>
              <input
                type="number"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                min={1}
                max={12}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">日</label>
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                min={1}
                max={31}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> 時 (0~23 時)
              </label>
              <input
                type="number"
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                min={0}
                max={23}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">分</label>
              <input
                type="number"
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                min={0}
                max={59}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
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
