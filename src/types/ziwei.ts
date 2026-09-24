export type Gender = 'male' | 'female';
export type Yinyang = '陽男' | '陰男' | '陽女' | '陰女';
export type Brightness = '廟' | '旺' | '得' | '利' | '平' | '不得' | '陷' | '';
export type Mutagen = '祿' | '權' | '科' | '忌';
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

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
  isLaiYinPalace: boolean; // 是否為【來因宮】
  
  // 流年與大限縮寫
  flowYearPalaceName?: string; // 如: 年兄、年命、年父
  decadalPalaceName?: string; // 如: 大遷、大疾、大財
  
  // 星曜分類
  mainStars: Star[];
  luckyStars: Star[];
  badStars: Star[];
  minorStars: Star[];
  godStars: Star[];
  
  // 三神煞
  boshi: string;
  suiqian: string;
  jiangqian: string;
  changsheng: string;

  // 限運資訊
  decadalRange: [number, number];
  decadalStemBranch?: string;
  smallLimitYears: number[];
  lunarMonthName: string;
}

export interface FourPillars {
  year: string;
  month: string;
  day: string;
  time: string;
}

// 八字大運走勢單步結構
export interface LuckCycleStep {
  stemBranch: string; // 干支 (如 己巳)
  tenGod: string; // 十神 (如 食神, 傷官, 比肩)
  age: number; // 虛歲 (如 9歲, 19歲)
  year: number; // 公曆西元年 (如 1987)
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
    solarBirth: string; // 鐘錶時間
    trueSolarBirth: string; // 真太陽時
    lunarBirth: string; // 農曆時間
    fourPillars: FourPillars;
    nonTermFourPillars: FourPillars;
    startAgeNotice: string;
    startAgeDetail: string; // "出生後 7年 6月22天 八字起運"
    currentDecade: string;
    currentFlowYear: string;
    luckCycles: LuckCycleStep[]; // 八字大運走勢
  };

  palaces: PalaceData[];
}
