export type Gender = 'male' | 'female';
export type Yinyang = '陽男' | '陰男' | '陽女' | '陰女';
export type Brightness = '廟' | '旺' | '得' | '利' | '平' | '不得' | '陷' | '';
export type Mutagen = '祿' | '權' | '科' | '忌';
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

export interface Star {
  id: string;
  name: string;
  type: 'main' | 'lucky' | 'bad' | 'minor' | 'god' | 'gradeB' | 'gradeC'; // 甲級/乙級/丙級星曜
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
  direction: string; // 傳統方位 (如: 正南方、南偏東、坎宮正北)
  directionEightTrigram: string; // 八卦方位 (如: 離宮、坎宮、巽宮)
  isBodyPalace: boolean;
  
  // 星曜分類
  mainStars: Star[]; // 十四主星 (甲級)
  luckyStars: Star[]; // 六吉星 / 六凶星 (甲級/副星)
  badStars: Star[];
  minorStars: Star[]; // 雜曜 (乙級星)
  godStars: Star[]; // 神煞 (丙級星)
  
  // 三神煞
  boshi: string; // 博士十二神
  suiqian: string; // 歲前十二神
  jiangqian: string; // 將前十二神
  changsheng: string; // 長生十二神

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
    lunarBirth: string;
    fourPillars: FourPillars;
    nonTermFourPillars: FourPillars;
    startAgeNotice: string;
    currentDecade: string;
    currentFlowYear: string;
  };

  palaces: PalaceData[];
}
