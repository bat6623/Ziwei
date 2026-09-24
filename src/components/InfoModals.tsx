import React from 'react';
import { X } from 'lucide-react';
import { APP_VERSION, BUILD_TIME, GIT_SHA } from '../utils/appVersion';

interface InfoModalsProps {
  activeTab: 'help' | 'about' | null;
  onClose: () => void;
}

const HELP_ITEMS = [
  { title: '三合', text: '完整盤面。點一個宮位，灰色虛線連出它的對宮與三方四正；再點一次取消。' },
  { title: '飛星', text: '大字精簡盤。點一個宮位，空心框標出它的宮干把祿、權、科、忌飛到哪顆星；實心框是生年四化。' },
  { title: '四化', text: '從生年四化所在的宮位，連線到它的對宮。' },
  { title: '大限與流運', text: '在命盤下方依序選大限 → 流年 → 流月 → 流日 → 流時。每選一層，宮名和四化都會跟著換；再點一次同一格就取消。' },
  { title: '生辰微調', text: '中宮的「日↑ 日↓ 時↑ 時↓」會把生辰往後或往前推一天、一個時辰，重新排盤。' },
  { title: '儲存與備份', text: '「儲存目前命盤」會存到這台裝置（有連 GitHub 時也存到 GitHub）。「匯出紀錄檔」可以存到 iCloud 雲碟，換裝置時再匯入。' },
];

export const InfoModals: React.FC<InfoModalsProps> = ({ activeTab, onClose }) => {
  if (!activeTab) return null;

  return (
    <div className="fixed inset-0 z-[55] bg-black/30 flex items-end sm:items-center justify-center font-apple animate-fade-in" onClick={onClose}>
      <div
        className="bg-grouped w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-grouped/90 backdrop-blur-xl relative flex items-center justify-center h-14 px-4">
          <span className="text-[17px] font-semibold text-label">{activeTab === 'help' ? '使用說明' : '關於'}</span>
          <button type="button" onClick={onClose} aria-label="關閉" className="absolute right-3 w-8 h-8 rounded-full bg-fill text-label3 flex items-center justify-center active:bg-fill2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {activeTab === 'help' && (
          <div className="px-4 pb-2">
            <ul className="bg-card rounded-2xl overflow-hidden divide-y divide-separator/60">
              {HELP_ITEMS.map((item) => (
                <li key={item.title} className="px-4 py-3">
                  <div className="text-[17px] text-label">{item.title}</div>
                  <p className="mt-0.5 text-[15px] text-label2/80 leading-snug">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="px-4 pb-2 space-y-5">
            <div className="flex flex-col items-center pt-2">
              <div className="w-20 h-20 rounded-[22px] bg-gradient-to-b from-amber-400 to-amber-600 text-white flex items-center justify-center font-serif font-bold text-4xl shadow-sm">
                紫
              </div>
              <h4 className="mt-3 text-[20px] font-semibold text-label">紫微斗數神算命盤</h4>
              <p className="text-[15px] text-label3">版本 {APP_VERSION}</p>
            </div>

            <ul className="bg-card rounded-2xl overflow-hidden divide-y divide-separator/60 text-[17px]">
              <li className="flex justify-between px-4 py-3">
                <span className="text-label">版本</span>
                <span className="text-label3">{APP_VERSION}</span>
              </li>
              <li className="flex justify-between px-4 py-3">
                <span className="text-label">建置時間</span>
                <span className="text-label3">{BUILD_TIME}</span>
              </li>
              {GIT_SHA && (
                <li className="flex justify-between px-4 py-3">
                  <span className="text-label">程式版本</span>
                  <span className="text-label3 font-mono text-[15px]">{GIT_SHA}</span>
                </li>
              )}
            </ul>

            <div>
              <h5 className="px-4 mb-1.5 text-[13px] uppercase tracking-wide text-label3">計算依據</h5>
              <ul className="bg-card rounded-2xl overflow-hidden divide-y divide-separator/60 text-[15px] text-label2">
                <li className="px-4 py-3">安星、亮度、雜曜與流運已對照開源排盤程式 iztro 驗證</li>
                <li className="px-4 py-3">農曆、節氣四柱與八字起運使用 lunar-javascript 計算</li>
                <li className="px-4 py-3">真太陽時以東經 120 度加均時差估算，尚未依出生地調整</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
