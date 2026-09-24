/**
 * 紫微斗數命盤資料結構與型別定義
 * 支援匯出/匯入/本機儲存與 Canvas/SVG 繪製
 */

export type Gender = 'male' | 'female'; // 性別
export type Yinyang = '陽男' | '陰男' | '陽女' | '陰女';

// 廟旺平陷狀態
export type Brightness = '廟' | '旺' | '得' | '利' | '平' | '不得' | '陷' | '';

// 四化類型
export type Mutagen = '祿' | '權' | '科' | '忌';

// 星曜定義
export interface Star {
  id: string;
  name: string;
  type: 'main' | 'lucky' | 'bad' | 'minor' | 'god'; // 主星 | 吉星 | 煞星 | 雜曜 | 神煞
  brightness?: Brightness;
  mutagen?: Mutagen; // 年干四化 (祿/權/科/忌)
  selfMutagen?: Mutagen; // 自化
  colorCategory?: 'red' | 'purple' | 'blue' | 'green' | 'orange' | 'gold' | 'gray';
}

// 12 地支宮位
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

// 宮位名稱
export type PalaceName =
  | '命宮'
  | '兄弟'
  | '夫妻'
  | '子女'
  | '財帛'
  | '疾厄'
  | '遷移'
  | '交友'
  | '官祿'
  | '田宅'
  | '福德'
  | '父母';

// 宮位資料結構
export interface PalaceData {
  index: number; // 0~11 對應 12 地支盤的位置 (巳0, 午1, 未2, 申3, 酉4, 戌5, 亥6, 子7, 丑8, 寅9, 卯10, 辰11)
  branch: EarthlyBranch; // 地支
  stem: HeavenlyStem; // 宮位天干
  name: PalaceName; // 基本十二宮名
  isBodyPalace: boolean; // 是否為「身宮」所在
  
  // 星曜分類
  mainStars: Star[]; // 主星 (紫微、天府等十四主星)
  luckyStars: Star[]; // 六吉星等 (左輔右弼文昌文曲天魁天鉞等)
  badStars: Star[]; // 六凶星 (火星鈴星羊陀空劫)
  minorStars: Star[]; // 雜曜小星 (紅鸞天喜天刑天姚華蓋咸池等)
  
  // 三神煞
  boshi: string; // 博士十二神
  suiqian: string; // 歲前十二神
  jiangqian: string; // 將前十二神
  changsheng: string; // 長生十二神 (長生、沐浴、冠帶...)

  // 限運資訊
  decadalRange: [number, number]; // 大限範圍，如 [2, 11]
  decadalStemBranch?: string; // 大限干支，如 辛巳
  smallLimitYears: number[]; // 小限年齡
  lunarMonthName: string; // 命盤代表農曆月份 (如 一月乙, 二月丙...)
  
  // 自化標記
  selfMutagens?: {
    starName: string;
    mutagen: Mutagen;
  }[];
}

// 避開保留關鍵字之八字四柱結構
export interface FourPillars {
  year: string;  // 年柱 (如: 丙申)
  month: string; // 月柱 (如: 庚寅)
  day: string;   // 日柱 (如: 戊申)
  time: string;  // 時柱 (如: 丁巳)
}

// 個人八字生辰輸入結構
export interface BirthInput {
  name: string;
  gender: Gender;
  isLunar: boolean; // 是否為農曆
  year: number;
  month: number;
  day: number;
  hour: number; // 0 ~ 23
  minute: number;
  isLeapMonth?: boolean; // 農曆是否閏月
}

// 完整命盤儲存資料結構 (JSON 可串行化)
export interface ZiweiChartData {
  id: string; // UUID 或 唯一識別碼
  createdAt: string; // 建立時間 ISO 格式
  updatedAt: string;
  notes?: string; // 備註筆記
  
  // 個人資訊 (中宮顯示)
  userInfo: {
    name: string;
    gender: Gender;
    yinyangGender: Yinyang; // 如：陰男、陽女
    fiveElementElement: string; // 如：水二局、金四局
    fiveElementNumber: number; // 局數 (2, 3, 4, 5, 6)
    
    masterStar: string; // 命主 (如：廉貞)
    bodyMasterStar: string; // 身主 (如：天相)
    ziDou: EarthlyBranch; // 子鬥 (如：午)
    
    solarBirth: string; // 西元鐘錶時間 "1956-02-11 10:05"
    lunarBirth: string; // 農曆時間 "乙未年臘月三十日 巳時"
    
    fourPillars: FourPillars; // 節氣四柱 (丙申 庚寅 戊申 丁巳)
    nonTermFourPillars: FourPillars; // 非節氣四柱 (乙未 己丑 戊申 丁巳)
    
    startAgeNotice: string; // 八字起運說明 (如：出生後 7年10月 2天 八字起運)
    currentDecade: string; // 當前大限 (如: 48-57 歲)
    currentFlowYear: string; // 當前流年 (如: 2026 丙午年 虛歲72歲)
  };

  // 12 宮位資料（按照環形 4x4 Grid 地支固定順序排列）
  palaces: PalaceData[];
}
