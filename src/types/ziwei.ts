export type Gender = 'male' | 'female';
export type Yinyang = '陽男' | '陰男' | '陽女' | '陰女';
export type Brightness = '廟' | '旺' | '得' | '利' | '平' | '不得' | '陷' | '';
export type Mutagen = '祿' | '權' | '科' | '忌';
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

// 頁面切換模式: 飛星 | 三合 | 四化
export type ChartTabMode = 'feixing' | 'sanhe' | 'sihua';

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

  // 動態流運標籤與四化
  isCurrentFlowYearPalace?: boolean;
  isCurrentDecadalPalace?: boolean;
  dynamicDecadalName?: string;
  dynamicFlowYearName?: string;
  flowMutagens?: { starName: string; mutagen: Mutagen; label: string }[];
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
    luckCycles: LuckCycleStep[];
  };

  palaces: PalaceData[];
}
