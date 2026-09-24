import React, { useEffect, useState } from 'react';
import { loadRecords, RECORDS_CHANGED, type SavedRecord } from '../utils/records';

interface RecentChartsProps {
  currentId: string;
  onLoadRecord: (record: SavedRecord) => void;
}

const MAX = 5;

/** 最近儲存的 5 筆命盤，一鍵切換 (沒有紀錄時不顯示) */
export const RecentCharts: React.FC<RecentChartsProps> = ({ currentId, onLoadRecord }) => {
  const [records, setRecords] = useState<SavedRecord[]>(() => loadRecords().slice(0, MAX));

  useEffect(() => {
    const refresh = () => setRecords(loadRecords().slice(0, MAX));
    window.addEventListener(RECORDS_CHANGED, refresh);
    window.addEventListener('storage', refresh); // 另一個分頁改了紀錄
    return () => {
      window.removeEventListener(RECORDS_CHANGED, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  if (records.length === 0) return null;
  // 目前這張盤的備註 (看全部紀錄，不只最近 5 筆)
  const note = loadRecords().find((r) => r.id === currentId)?.note;

  return (
    <>
    <nav aria-label="最近命盤" className="mt-5 flex items-center gap-2">
      <span className="shrink-0 text-[13px] text-label3">最近命盤</span>
      <div className="flex-1 min-w-0 flex gap-1.5 overflow-x-auto no-scrollbar">
        {records.map((r) => {
          const active = r.id === currentId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onLoadRecord(r)}
              aria-current={active ? 'true' : undefined}
              title={`${r.name}・${r.solarBirth}`}
              className={`shrink-0 h-9 max-w-[11rem] pl-1 pr-3.5 rounded-full flex items-center gap-2 text-[14px] transition-colors cursor-pointer ${
                active
                  ? 'bg-panel text-white dark:bg-accent dark:text-on-accent'
                  : 'bg-card text-label hover:bg-card2 active:bg-fill'
              }`}
            >
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-serif text-[13px] ${
                  active ? 'bg-white/15 dark:bg-black/10' : 'bg-grouped text-label2'
                }`}
              >
                {r.name.charAt(0)}
              </span>
              <span className="truncate">{r.name}</span>
              <span className={`shrink-0 text-[12px] ${active ? 'text-white/70 dark:text-on-accent/70' : 'text-label3'}`}>
                {r.solarBirth.slice(0, 4)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
    {note && (
      <p className="mt-3 rounded-[20px] bg-card px-4 py-2.5 text-[14px] text-label2 whitespace-pre-line">
        <span className="text-label3">備註　</span>{note}
      </p>
    )}
    </>
  );
};
