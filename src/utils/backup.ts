import type { ZiweiChartData } from '../types/ziwei';
import { toRecord, type SavedRecord } from './records';
import { calculateZiweiChart } from './ziweiEngine';

// 紀錄檔格式：包一層說明，之後格式改版時才認得出來
interface BackupFile {
  app: 'ziwei';
  version: 1;
  exportedAt: string;
  records: SavedRecord[];
}

const isTouchDevice = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

type SaveFilePicker = (opts: {
  suggestedName: string;
  types: { description: string; accept: Record<string, string[]> }[];
}) => Promise<{ createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }> }>;

/**
 * 匯出紀錄檔。依裝置選最方便存進 iCloud 的方式：
 * 手機平板 → 系統分享選單 (可選「儲存到檔案」)；
 * 支援存檔視窗的電腦瀏覽器 → 直接選資料夾；
 * 其他 → 一般下載。
 * 回傳 'cancelled' 代表使用者自己關掉視窗。
 */
export async function exportRecords(records: SavedRecord[]): Promise<'shared' | 'saved' | 'downloaded' | 'cancelled'> {
  const body: BackupFile = { app: 'ziwei', version: 1, exportedAt: new Date().toISOString(), records };
  const fileName = `紫微命盤紀錄_${today()}.json`;
  const blob = new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' });

  if (isTouchDevice() && navigator.canShare) {
    const file = new File([blob], fileName, { type: 'application/json' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: fileName });
        return 'shared';
      } catch (e) {
        if ((e as Error).name === 'AbortError') return 'cancelled';
        // 分享失敗就改用下載
      }
    }
  }

  const picker = (window as unknown as { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker;
  if (picker && !isTouchDevice()) {
    try {
      const handle = await picker({
        suggestedName: fileName,
        types: [{ description: '紫微命盤紀錄', accept: { 'application/json': ['.json'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return 'saved';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}

const isValidRecord = (r: unknown): r is SavedRecord => {
  const x = r as SavedRecord;
  const b = x?.birthInput;
  return !!x && typeof x.id === 'string' && !!b
    && [b.year, b.month, b.day, b.hour, b.minute].every((n) => Number.isInteger(n))
    && (b.gender === 'male' || b.gender === 'female');
};

/** 讀取紀錄檔；接受本工具匯出的格式、單純的清單，以及舊版存整張命盤的格式 */
export async function parseBackupFile(file: File): Promise<{ records: SavedRecord[]; skipped: number }> {
  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error('這不是有效的紀錄檔');
  }
  const list = Array.isArray(data) ? data : (data as BackupFile)?.records;
  if (!Array.isArray(list)) throw new Error('檔案裡找不到命盤紀錄');

  const records: SavedRecord[] = [];
  let skipped = 0;
  for (const item of list) {
    const rec = item && typeof item === 'object' && 'userInfo' in item ? toRecord(item as ZiweiChartData) : item;
    if (!isValidRecord(rec)) {
      skipped++;
      continue;
    }
    // 顯示用的欄位一律依生辰重算，不沿用檔案裡寫的
    try {
      const chart = calculateZiweiChart(rec.birthInput);
      records.push({ ...rec, name: rec.name || chart.userInfo.name, solarBirth: chart.userInfo.solarBirth, fiveElementElement: chart.userInfo.fiveElementElement });
    } catch {
      skipped++; // 生辰本身不存在 (例如農曆小月的三十日)
    }
  }
  return { records, skipped };
}

/** 合併：同一筆 (id 相同) 以匯入的為準，其餘保留 */
export function mergeRecords(current: SavedRecord[], incoming: SavedRecord[]) {
  const ids = new Set(current.map((r) => r.id));
  const added = incoming.filter((r) => !ids.has(r.id)).length;
  const incomingIds = new Set(incoming.map((r) => r.id));
  const merged = [...incoming, ...current.filter((r) => !incomingIds.has(r.id))];
  return { merged, added, updated: incoming.length - added };
}
