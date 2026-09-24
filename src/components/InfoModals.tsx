import React from 'react';
import { X, Sparkles, Compass, Zap, Layers, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

interface InfoModalsProps {
  activeTab: 'help' | 'about' | null;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalsProps> = ({ activeTab, onClose }) => {
  if (!activeTab) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold font-serif text-base">
              {activeTab === 'help' ? '助' : '關'}
            </div>
            <h3 className="text-lg font-black text-slate-900 font-serif">
              {activeTab === 'help' ? '紫微斗數排盤 - 使用幫助' : '關於文墨天機專業版'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 幫助內容 */}
        {activeTab === 'help' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950 space-y-1">
              <h4 className="font-extrabold flex items-center gap-1.5 text-amber-900 text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" /> 排盤切換與連線模式說明
              </h4>
              <p>本系統提供傳統三合派、飛星四化派三大核心視圖，點擊底部選單可隨時切換：</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                <h5 className="font-bold text-purple-900 flex items-center gap-1.5 text-xs">
                  <Zap className="w-4 h-4 text-purple-600" /> 1. 飛星模式 (Feixing Mode)
                </h5>
                <p className="text-purple-950">
                  點擊盤面上任何一個宮位，系統即刻根據該宮位天干（甲乙丙丁…），演算其四化（祿、權、科、忌）飛入何宮，並以帶有箭頭的紫色虛線精確指示飛星軌跡。再次點擊可取消連線。
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
                <h5 className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                  <Compass className="w-4 h-4 text-blue-600" /> 2. 三合模式 (Sanhe Mode)
                </h5>
                <p className="text-blue-950">
                  點擊任意宮位，自動高亮該宮位之「本宮、對宮（遷移/衝照）、事業宮（官祿）、財帛宮」三方四正拱照關係，並繪製黃金三合三角星圖。
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <h5 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <Layers className="w-4 h-4 text-emerald-600" /> 3. 四化模式 (Sihua Mode)
                </h5>
                <p className="text-emerald-950">
                  全面標示生年四化（祿、權、科、忌）分佈與對宮衝照連線，助您快速判斷本命化祿化忌焦點。
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" /> 4. 大限與流運切換
                </h5>
                <p className="text-slate-600">
                  在中宮下方設有【大限、流年/小限、流月、流日、流時】五層動態選單，點擊可快速切換查看特定流年大限走勢。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 關於內容 */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans text-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-black font-serif text-3xl shadow-md mx-auto mb-2">
              紫
            </div>
            <h4 className="text-base font-black text-slate-900 font-serif">
              文墨天機專業版 • 紫微斗數算命系統
            </h4>
            <p className="text-slate-500 text-[11px]">
              版本: pro 2.5.20 (C5VUC) • 專業安星演算法
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-2 text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>精確計算真太陽時與節氣/非節氣八字四柱</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>完整包含 14 主星廟旺平陷、六吉六煞、乙丙級神煞與博士十二神</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>動態計算虛歲、八字大運走勢與來因宮生年自化標記</span>
              </div>
            </div>

            <div className="pt-2 text-slate-400 text-[10px] flex items-center justify-center gap-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for Chinese Astrology Enthusiasts</span>
            </div>
          </div>
        )}

        {/* Bottom Confirm Button */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-xs cursor-pointer"
          >
            確定了解
          </button>
        </div>
      </div>
    </div>
  );
};
