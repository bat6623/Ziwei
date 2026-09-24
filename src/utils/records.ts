import type { BirthInput, ZiweiChartData } from '../types/ziwei';

// 一筆命盤紀錄：只存重新排盤需要的生辰，不存算好的整張盤
export interface SavedRecord {
  id: string;
  createdAt: string;
  name: string;
  birthInput: BirthInput;
  solarBirth: string;
  fiveElementElement: string;
}

const CACHE_KEY = 'ziwei_saved_charts';
// 舊版 GitHub 同步留下的設定 (含金鑰)，功能已移除，看到就刪掉
const LEGACY_GITHUB_KEY = 'ziwei_github_sync';

// 取得命盤的原始生辰；舊版存檔沒有 birthInput，就從國曆字串還原
export function getBirthInput(chart: ZiweiChartData): BirthInput {
  if (chart.birthInput) return chart.birthInput;
  const [date, time = '00:00'] = chart.userInfo.solarBirth.split(' ');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return { name: chart.userInfo.name, gender: chart.userInfo.gender, isLunar: false, year, month, day, hour, minute };
}

export function toRecord(chart: ZiweiChartData): SavedRecord {
  return {
    id: chart.id,
    createdAt: chart.createdAt,
    name: chart.userInfo.name,
    birthInput: getBirthInput(chart),
    solarBirth: chart.userInfo.solarBirth,
    fiveElementElement: chart.userInfo.fiveElementElement,
  };
}

export function loadRecords(): SavedRecord[] {
  try {
    localStorage.removeItem(LEGACY_GITHUB_KEY);
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as (SavedRecord | ZiweiChartData)[];
    // 舊版存的是整張命盤，這裡轉成新格式
    return list.map((item) => ('userInfo' in item ? toRecord(item) : item));
  } catch {
    return [];
  }
}

export function saveRecords(records: SavedRecord[]): boolean {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}
