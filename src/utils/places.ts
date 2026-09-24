// 出生地經度 (算真太陽時用)。只列 UTC+8 的地區：真太陽時是以東經 120 度 / UTC+8 為基準換算
export interface Place {
  name: string;
  longitude: number;
}

export const PLACE_GROUPS: { label: string; places: Place[] }[] = [
  {
    label: '台灣',
    places: [
      { name: '台北', longitude: 121.56 },
      { name: '新北', longitude: 121.47 },
      { name: '基隆', longitude: 121.74 },
      { name: '桃園', longitude: 121.3 },
      { name: '新竹', longitude: 120.97 },
      { name: '苗栗', longitude: 120.82 },
      { name: '台中', longitude: 120.68 },
      { name: '彰化', longitude: 120.54 },
      { name: '南投', longitude: 120.69 },
      { name: '雲林', longitude: 120.43 },
      { name: '嘉義', longitude: 120.45 },
      { name: '台南', longitude: 120.21 },
      { name: '高雄', longitude: 120.31 },
      { name: '屏東', longitude: 120.49 },
      { name: '宜蘭', longitude: 121.75 },
      { name: '花蓮', longitude: 121.6 },
      { name: '台東', longitude: 121.15 },
      { name: '澎湖', longitude: 119.57 },
      { name: '金門', longitude: 118.32 },
      { name: '馬祖', longitude: 119.95 },
    ],
  },
  {
    label: '港澳與中國',
    places: [
      { name: '香港', longitude: 114.17 },
      { name: '澳門', longitude: 113.54 },
      { name: '北京', longitude: 116.4 },
      { name: '上海', longitude: 121.47 },
      { name: '廣州', longitude: 113.26 },
      { name: '深圳', longitude: 114.06 },
      { name: '廈門', longitude: 118.09 },
      { name: '福州', longitude: 119.3 },
      { name: '杭州', longitude: 120.16 },
      { name: '南京', longitude: 118.8 },
      { name: '武漢', longitude: 114.31 },
      { name: '成都', longitude: 104.07 },
      { name: '重慶', longitude: 106.55 },
    ],
  },
  {
    label: '東南亞與其他',
    places: [
      { name: '新加坡', longitude: 103.82 },
      { name: '吉隆坡', longitude: 101.69 },
      { name: '馬尼拉', longitude: 120.98 },
      { name: '伯斯', longitude: 115.86 },
    ],
  },
];

export const ALL_PLACES: Place[] = PLACE_GROUPS.flatMap((g) => g.places);

// 記住上次選的出生地，下次輸入不用再選 (只存在這台裝置)
const LAST_PLACE_KEY = 'ziwei_last_place';

export interface PlacePref {
  place?: string;
  longitude?: number;
  useTrueSolarHour: boolean;
}

export function loadPlacePref(): PlacePref {
  try {
    const raw = localStorage.getItem(LAST_PLACE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as PlacePref;
      return {
        place: typeof p.place === 'string' ? p.place : undefined,
        longitude: typeof p.longitude === 'number' && Number.isFinite(p.longitude) ? p.longitude : undefined,
        useTrueSolarHour: p.useTrueSolarHour === true,
      };
    }
  } catch {
    // 讀不到就用預設
  }
  return { useTrueSolarHour: false };
}

export function savePlacePref(pref: PlacePref) {
  try {
    localStorage.setItem(LAST_PLACE_KEY, JSON.stringify(pref));
  } catch {
    // 無痕模式存不了，只是下次要重選
  }
}
