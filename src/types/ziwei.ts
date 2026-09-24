export type Gender = 'male' | 'female';
export type Yinyang = '陽男' | '陰男' | '陽女' | '陰女';
export type Brightness = '廟' | '旺' | '得' | '利' | '平' | '不得' | '陷' | '';
export type Mutagen = '祿' | '權' | '科' | '忌';
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

// 頁面切換模式: 飛星 | 三合 | 四化
export type ChartTabMode = 'feixing' | 'sanhe' | 'sihua';

// 流運層級：大限、流年、流月、流日、流時
export type FlowLevel = '大' | '年' | '月' | '日' | '時';

// 使用者在流運選單選的項目 (null = 未選)
export interface FlowSelection {
  decadeKey: string | null; // 'child' 或 '33-42'
  year: number | null;
  month: number | null;     // 1-12 (農曆)
  day: number | null;       // 1-30 (農曆)
  hour: number | null;      // 0-11 (子=0)
}

export interface Star {
  id: string;
  name: string;
  type: 'main' | 'lucky' | 'bad' | 'minor' | 'god' | 'gradeB' | 'gradeC';
  brightness?: Brightness;
  mutagen?: Mutagen;
  selfMutagen?: Mutagen;
  colorCategory?: 'red' | 'purple' | 'blue' | 'green' | 'orange' | 'gold' | 'gray';
}

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

export interface PalaceData {
  index: number;
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  name: PalaceName;
  direction: string;
  directionEightTrigram: string;
  isBodyPalace: boolean;
  isLaiYinPalace: boolean;
  
  flowYearPalaceName?: string;
  decadalPalaceName?: string;
  
  mainStars: Star[];
  luckyStars: Star[];
  badStars: Star[];
  minorStars: Star[];
  godStars: Star[];
  
  boshi: string;
  suiqian: string;
  jiangqian: string;
  changsheng: string;

  decadalRange: [number, number];
  decadalStemBranch?: string;
  smallLimitYears: number[];
  lunarMonthName: string;

  // 流年與小限歲數序列 (圖 2)
  flowYearsList?: number[];
  
  // 動態流運 (選了大限／流年／流月／流日／流時之後才有)
  dynamicDecadalName?: string;          // 大限宮名，如「大命」
  decadalStars?: string[];              // 大限流曜，如「大昌」「大羊」
  decadeYearInfo?: { year: number; age: number }; // 此大限內流年經過本宮的年份與虛歲
  flowLevelName?: string;               // 最細一層流運的宮名，如「年命」「月財」
  flowMutagens?: { starName: string; mutagen: Mutagen; level: FlowLevel }[];
}

export interface FourPillars {
  year: string;
  month: string;
  day: string;
  time: string;
}

export interface LuckCycleStep {
  stemBranch: string;
  tenGod: string;
  age: number;
  year: number;
}

export interface BirthInput {
  name: string;
  gender: Gender;
  isLunar: boolean;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  isLeapMonth?: boolean;
  /** 出生地名稱 (只用來顯示)；沒填代表用預設的東經 120 度 */
  place?: string;
  /** 出生地經度，算真太陽時用 */
  longitude?: number;
  /** true：時辰改用真太陽時決定 (預設用鐘錶時間) */
  useTrueSolarHour?: boolean;
}

export interface ZiweiChartData {
  id: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  
  userInfo: {
    name: string;
    gender: Gender;
    yinyangGender: Yinyang;
    fiveElementElement: string;
    fiveElementNumber: number;
    masterStar: string;
    bodyMasterStar: string;
    ziDou: EarthlyBranch;
    solarBirth: string;
    trueSolarBirth: string;
    lunarBirth: string;
    fourPillars: FourPillars;
    nonTermFourPillars: FourPillars;
    startAgeNotice: string;
    startAgeDetail: string;
    currentDecade: string;
    currentFlowYear: string;
    activeFlowCycleInfo?: string;
    lunarBirthYear?: number;
    luckCycles: LuckCycleStep[];
  };

  palaces: PalaceData[];
  birthInput?: BirthInput;
}
