import { Solar, Lunar, LunarMonth } from 'lunar-javascript';
import { astro } from 'iztro';
import type {
  BirthInput,
  ZiweiChartData,
  PalaceData,
  EarthlyBranch,
  HeavenlyStem,
  PalaceName,
  Star,
  Brightness,
  Mutagen,
  Yinyang,
  LuckCycleStep,
  FlowLevel,
  FlowSelection
} from '../types/ziwei';

export const BRANCHES_ORDER: EarthlyBranch[] = ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'];

const BRANCH_INDEX: Record<EarthlyBranch, number> = {
  '巳': 0, '午': 1, '未': 2, '申': 3,
  '酉': 4, '戌': 5, '亥': 6, '子': 7,
  '丑': 8, '寅': 9, '卯': 10, '辰': 11
};

const DIRECTION_MAP: Record<EarthlyBranch, { direction: string; trigram: string }> = {
  '巳': { direction: '南偏東', trigram: '巽宮' },
  '午': { direction: '正南方', trigram: '離宮' },
  '未': { direction: '南偏西', trigram: '坤宮' },
  '申': { direction: '西偏南', trigram: '坤宮' },
  '酉': { direction: '正西方', trigram: '兌宮' },
  '戌': { direction: '西偏北', trigram: '乾宮' },
  '亥': { direction: '北偏西', trigram: '乾宮' },
  '子': { direction: '正北方', trigram: '坎宮' },
  '丑': { direction: '北偏東', trigram: '艮宮' },
  '寅': { direction: '東偏北', trigram: '艮宮' },
  '卯': { direction: '正東方', trigram: '震宮' },
  '辰': { direction: '東偏南', trigram: '巽宮' },
};

const STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

const PALACE_NAMES_ORDER: PalaceName[] = [
  '命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄',
  '遷移', '交友', '官祿', '田宅', '福德', '父母'
];

const SHORT_PALACE_NAMES: Record<PalaceName, string> = {
  '命宮': '命', '兄弟': '兄', '夫妻': '夫', '子女': '子',
  '財帛': '財', '疾厄': '疾', '遷移': '遷', '交友': '友',
  '官祿': '官', '田宅': '田', '福德': '福', '父母': '父'
};

const MASTER_STAR_MAP: Record<EarthlyBranch, string> = {
  '子': '貪狼', '丑': '巨門', '寅': '祿存', '卯': '文曲',
  '辰': '廉貞', '巳': '武曲', '午': '破軍', '未': '武曲',
  '申': '廉貞', '酉': '文曲', '戌': '祿存', '亥': '巨門'
};

const BODY_MASTER_MAP: Record<EarthlyBranch, string> = {
  '子': '鈴星', '丑': '天相', '寅': '天梁', '卯': '天同',
  '辰': '文昌', '巳': '天機', '午': '火星', '未': '天相',
  '申': '天梁', '酉': '天同', '戌': '文昌', '亥': '天機'
};

export const FOUR_MUTAGENS_MAP: Record<HeavenlyStem, Record<Mutagen, string>> = {
  '甲': { '祿': '廉貞', '權': '破軍', '科': '武曲', '忌': '太陽' },
  '乙': { '祿': '天機', '權': '天梁', '科': '紫微', '忌': '太陰' },
  '丙': { '祿': '天同', '權': '天機', '科': '文昌', '忌': '廉貞' },
  '丁': { '祿': '太陰', '權': '天同', '科': '天機', '忌': '巨門' },
  '戊': { '祿': '貪狼', '權': '太陰', '科': '右弼', '忌': '天機' },
  '己': { '祿': '武曲', '權': '貪狼', '科': '天梁', '忌': '文曲' },
  '庚': { '祿': '太陽', '權': '武曲', '科': '太陰', '忌': '天同' },
  '辛': { '祿': '巨門', '權': '太陽', '科': '文曲', '忌': '文昌' },
  '壬': { '祿': '天梁', '權': '紫微', '科': '左輔', '忌': '武曲' },
  '癸': { '祿': '破軍', '權': '巨門', '科': '太陰', '忌': '貪狼' }
};

const BRIGHTNESS_MAP: Record<string, Record<EarthlyBranch, Brightness>> = {
  '紫微': { '子': '平', '丑': '廟', '寅': '廟', '卯': '旺', '辰': '得', '巳': '旺', '午': '廟', '未': '廟', '申': '旺', '酉': '旺', '戌': '得', '亥': '旺' },
  '天機': { '子': '廟', '丑': '陷', '寅': '旺', '卯': '廟', '辰': '平', '巳': '平', '午': '廟', '未': '陷', '申': '旺', '酉': '廟', '戌': '平', '亥': '平' },
  '太陽': { '子': '陷', '丑': '不得', '寅': '旺', '卯': '廟', '辰': '旺', '巳': '旺', '午': '廟', '未': '得', '申': '得', '酉': '平', '戌': '不得', '亥': '陷' },
  '武曲': { '子': '旺', '丑': '廟', '寅': '得', '卯': '平', '辰': '廟', '巳': '平', '午': '旺', '未': '廟', '申': '得', '酉': '平', '戌': '廟', '亥': '平' },
  '天同': { '子': '旺', '丑': '陷', '寅': '廟', '卯': '平', '辰': '平', '巳': '廟', '午': '陷', '未': '陷', '申': '旺', '酉': '平', '戌': '平', '亥': '廟' },
  '廉貞': { '子': '平', '丑': '廟', '寅': '廟', '卯': '平', '辰': '利', '巳': '陷', '午': '平', '未': '廟', '申': '廟', '酉': '平', '戌': '利', '亥': '陷' },
  '天府': { '子': '廟', '丑': '廟', '寅': '廟', '卯': '得', '辰': '廟', '巳': '得', '午': '旺', '未': '廟', '申': '得', '酉': '陷', '戌': '廟', '亥': '得' },
  '太陰': { '子': '廟', '丑': '廟', '寅': '不得', '卯': '陷', '辰': '陷', '巳': '陷', '午': '陷', '未': '不得', '申': '平', '酉': '旺', '戌': '廟', '亥': '廟' },
  '貪狼': { '子': '旺', '丑': '廟', '寅': '平', '卯': '利', '辰': '廟', '巳': '陷', '午': '旺', '未': '廟', '申': '平', '酉': '利', '戌': '廟', '亥': '陷' },
  '巨門': { '子': '旺', '丑': '平', '寅': '廟', '卯': '廟', '辰': '陷', '巳': '旺', '午': '旺', '未': '平', '申': '廟', '酉': '廟', '戌': '陷', '亥': '旺' },
  '天相': { '子': '廟', '丑': '廟', '寅': '廟', '卯': '陷', '辰': '旺', '巳': '得', '午': '廟', '未': '廟', '申': '廟', '酉': '陷', '戌': '旺', '亥': '得' },
  '天梁': { '子': '廟', '丑': '旺', '寅': '廟', '卯': '廟', '辰': '廟', '巳': '陷', '午': '廟', '未': '旺', '申': '陷', '酉': '得', '戌': '廟', '亥': '陷' },
  '七殺': { '子': '旺', '丑': '廟', '寅': '廟', '卯': '平', '辰': '廟', '巳': '平', '午': '旺', '未': '廟', '申': '廟', '酉': '平', '戌': '廟', '亥': '平' },
  '破軍': { '子': '廟', '丑': '旺', '寅': '陷', '卯': '旺', '辰': '旺', '巳': '平', '午': '廟', '未': '旺', '申': '陷', '酉': '旺', '戌': '旺', '亥': '平' },
  '文昌': { '子': '廟', '丑': '廟', '寅': '陷', '卯': '利', '辰': '旺', '巳': '廟', '午': '陷', '未': '廟', '申': '得', '酉': '利', '戌': '旺', '亥': '廟' },
  '文曲': { '子': '廟', '丑': '廟', '寅': '平', '卯': '旺', '辰': '廟', '巳': '旺', '午': '陷', '未': '廟', '申': '平', '酉': '旺', '戌': '廟', '亥': '旺' }
};

function getFiveElement(stem: HeavenlyStem, branch: EarthlyBranch): { name: string; number: number } {
  const table: Record<string, { name: string; number: number }> = {
    '甲子': { name: '金四局', number: 4 }, '乙丑': { name: '金四局', number: 4 },
    '丙寅': { name: '火六局', number: 6 }, '丁卯': { name: '火六局', number: 6 },
    '戊辰': { name: '木三局', number: 3 }, '己巳': { name: '木三局', number: 3 },
    '庚午': { name: '土五局', number: 5 }, '辛未': { name: '土五局', number: 5 },
    '壬申': { name: '金四局', number: 4 }, '癸酉': { name: '金四局', number: 4 },
    '甲戌': { name: '火六局', number: 6 }, '乙亥': { name: '火六局', number: 6 },
    '丙子': { name: '水二局', number: 2 }, '丁丑': { name: '水二局', number: 2 },
    '戊寅': { name: '土五局', number: 5 }, '己卯': { name: '土五局', number: 5 },
    '庚辰': { name: '金四局', number: 4 }, '辛巳': { name: '金四局', number: 4 },
    '壬午': { name: '木三局', number: 3 }, '癸未': { name: '木三局', number: 3 },
    '甲申': { name: '水二局', number: 2 }, '乙酉': { name: '水二局', number: 2 },
    '丙戌': { name: '土五局', number: 5 }, '丁亥': { name: '土五局', number: 5 },
    '戊子': { name: '火六局', number: 6 }, '己丑': { name: '火六局', number: 6 },
    '庚寅': { name: '木三局', number: 3 }, '辛卯': { name: '木三局', number: 3 },
    '壬辰': { name: '水二局', number: 2 }, '癸巳': { name: '水二局', number: 2 },
    '甲午': { name: '金四局', number: 4 }, '乙未': { name: '金四局', number: 4 },
    '丙申': { name: '火六局', number: 6 }, '丁酉': { name: '火六局', number: 6 },
    '戊戌': { name: '木三局', number: 3 }, '己亥': { name: '木三局', number: 3 },
    '庚子': { name: '土五局', number: 5 }, '辛丑': { name: '土五局', number: 5 },
    '壬寅': { name: '金四局', number: 4 }, '癸卯': { name: '金四局', number: 4 },
    '甲辰': { name: '火六局', number: 6 }, '乙巳': { name: '火六局', number: 6 },
    '丙午': { name: '水二局', number: 2 }, '丁未': { name: '水二局', number: 2 },
    '戊申': { name: '土五局', number: 5 }, '己酉': { name: '土五局', number: 5 },
    '庚戌': { name: '金四局', number: 4 }, '辛亥': { name: '金四局', number: 4 },
    '壬子': { name: '木三局', number: 3 }, '癸丑': { name: '木三局', number: 3 },
    '甲寅': { name: '水二局', number: 2 }, '乙卯': { name: '水二局', number: 2 },
    '丙辰': { name: '土五局', number: 5 }, '丁巳': { name: '土五局', number: 5 },
    '戊午': { name: '火六局', number: 6 }, '己未': { name: '火六局', number: 6 },
    '庚申': { name: '木三局', number: 3 }, '辛酉': { name: '木三局', number: 3 },
    '壬戌': { name: '水二局', number: 2 }, '癸亥': { name: '水二局', number: 2 },
  };

  const key = `${stem}${branch}`;
  return table[key] || { name: '水二局', number: 2 };
}

// 十神計算輔助表
function getTenGod(dayStem: string, targetStem: string): string {
  const map: Record<string, Record<string, string>> = {
    '甲': { '甲': '比肩', '乙': '劫財', '丙': '食神', '丁': '傷官', '戊': '偏財', '己': '正財', '庚': '七殺', '辛': '正官', '壬': '偏印', '癸': '正印' },
    '乙': { '甲': '劫財', '乙': '比肩', '丙': '傷官', '丁': '食神', '戊': '正財', '己': '偏財', '庚': '正官', '辛': '七殺', '壬': '正印', '癸': '偏印' },
    '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫財', '戊': '食神', '己': '傷官', '庚': '偏財', '辛': '正財', '壬': '七殺', '癸': '正官' },
    '丁': { '甲': '正印', '乙': '偏印', '丙': '劫財', '丁': '比肩', '戊': '傷官', '己': '食神', '庚': '正財', '辛': '偏財', '壬': '正官', '癸': '七殺' },
    '戊': { '甲': '七殺', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫財', '庚': '食神', '辛': '傷官', '壬': '偏財', '癸': '正財' },
    '己': { '甲': '正官', '乙': '七殺', '丙': '正印', '丁': '偏印', '戊': '劫財', '己': '比肩', '庚': '傷官', '辛': '食神', '壬': '正財', '癸': '偏財' },
    '庚': { '甲': '偏財', '乙': '正財', '丙': '七殺', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫財', '壬': '食神', '癸': '傷官' },
    '辛': { '甲': '正財', '乙': '偏財', '丙': '正官', '丁': '七殺', '戊': '正印', '己': '偏印', '庚': '劫財', '辛': '比肩', '壬': '傷官', '癸': '食神' },
    '壬': { '甲': '食神', '乙': '傷官', '丙': '偏財', '丁': '正財', '戊': '七殺', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫財' },
    '癸': { '甲': '傷官', '乙': '食神', '丙': '正財', '丁': '偏財', '戊': '正官', '己': '七殺', '庚': '正印', '辛': '偏印', '壬': '劫財', '癸': '比肩' }
  };
  return map[dayStem]?.[targetStem] || '比肩';
}

const DEFAULT_LONGITUDE = 120;

// 五虎遁：年干決定正月 (寅月) 的月干
const TIGER_MONTH_STEM_START: Record<HeavenlyStem, number> = {
  '甲': 2, '己': 2, '乙': 4, '庚': 4, '丙': 6, '辛': 6, '丁': 8, '壬': 8, '戊': 0, '癸': 0
};
const LUNAR_MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '臘'];
const ZHI_ORDER: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 某流年中，該宮位對應第幾個流月 (斗君所在宮為正月，順行)
function getFlowMonthName(palaceBranch: EarthlyBranch, ziDou: EarthlyBranch, yearStem: HeavenlyStem, yearBranch: EarthlyBranch): string {
  const doujun = (ZHI_ORDER.indexOf(ziDou) + ZHI_ORDER.indexOf(yearBranch)) % 12;
  const m = (ZHI_ORDER.indexOf(palaceBranch) - doujun + 12) % 12;
  return `${LUNAR_MONTH_NAMES[m]}月${STEMS[(TIGER_MONTH_STEM_START[yearStem] + m) % 10]}`;
}

// 均時差 (分鐘)，NOAA 近似公式
function getEquationOfTime(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
  const g = (2 * Math.PI / 365) * (dayOfYear - 1 + (d.getHours() - 12) / 24);
  return 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
}

/**
 * 真太陽時 = 鐘錶時間 + 經度差 (每度 4 分鐘，以東經 120 度 / UTC+8 為準) + 均時差
 * 回傳的 Date 秒數保留，顯示時直接捨去 (跟文墨天機一致：07:10 → 07:06)
 */
export function getTrueSolarTime(input: BirthInput): Date {
  let y = input.year, m = input.month, d = input.day;
  if (input.isLunar) {
    const s = Lunar.fromYmdHms(input.year, input.month, input.day, input.hour, input.minute, 0).getSolar();
    y = s.getYear(); m = s.getMonth(); d = s.getDay();
  }
  const clock = new Date(y, m - 1, d, input.hour, input.minute);
  const lon = input.longitude ?? DEFAULT_LONGITUDE;
  return new Date(clock.getTime() + Math.round((getEquationOfTime(clock) + (lon - 120) * 4) * 60) * 1000);
}

const fmtDateTime = (d: Date) => {
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
};

// iztro 的星名與文墨天機用字不同時，以文墨天機為準
const ADJECTIVE_RENAME: Record<string, string> = { '截路': '截空', '空亡': '副截' };

export function calculateZiweiChart(input: BirthInput): ZiweiChartData {
  // 時辰改用真太陽時：先換算成真太陽時的國曆日期時間再排盤，畫面上仍顯示原本的鐘錶時間
  if (input.useTrueSolarHour) {
    const ts = getTrueSolarTime(input);
    const clockChart = calculateZiweiChart({ ...input, useTrueSolarHour: false });
    const chart = calculateZiweiChart({
      ...input, isLunar: false, useTrueSolarHour: false,
      year: ts.getFullYear(), month: ts.getMonth() + 1, day: ts.getDate(), hour: ts.getHours(), minute: ts.getMinutes(),
    });
    return {
      ...chart,
      userInfo: { ...chart.userInfo, solarBirth: clockChart.userInfo.solarBirth, trueSolarBirth: fmtDateTime(ts) },
      birthInput: input,
    };
  }

  let lunar: Lunar;
  let solar: Solar;

  if (input.isLunar) {
    lunar = Lunar.fromYmdHms(input.year, input.month, input.day, input.hour, input.minute, 0);
    solar = lunar.getSolar();
  } else {
    solar = Solar.fromYmdHms(input.year, input.month, input.day, input.hour, input.minute, 0);
    lunar = solar.getLunar();
  }

  const yearStem = lunar.getYearGan() as HeavenlyStem;
  const yearBranch = lunar.getYearZhi() as EarthlyBranch;
  const timeBranch = lunar.getTimeZhi() as EarthlyBranch;
  
  const isYangYear = ['甲', '丙', '戊', '庚', '壬'].includes(yearStem);
  let yinyangGender: Yinyang;
  if (input.gender === 'male') {
    yinyangGender = isYangYear ? '陽男' : '陰男';
  } else {
    yinyangGender = isYangYear ? '陽女' : '陰女';
  }

  const lunarDay = lunar.getDay();
  // 閏月：上半月（十五日以前）算本月，下半月算下個月
  const isLeapMonth = lunar.getMonth() < 0;
  const lunarMonth = Math.abs(lunar.getMonth()) + (isLeapMonth && lunarDay > 15 ? 1 : 0);
  const timeZhiIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(timeBranch);
  const yearZhiIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(yearBranch);

  let mingBranchIndex = (BRANCH_INDEX['寅'] + (lunarMonth - 1) - timeZhiIndex + 24) % 12;
  const mingBranch = BRANCHES_ORDER[mingBranchIndex];

  let shenBranchIndex = (BRANCH_INDEX['寅'] + (lunarMonth - 1) + timeZhiIndex) % 12;
  const shenBranch = BRANCHES_ORDER[shenBranchIndex];

  const stemStartMap: Record<HeavenlyStem, number> = {
    '甲': 2, '己': 2,
    '乙': 4, '庚': 4,
    '丙': 6, '辛': 6,
    '丁': 8, '壬': 8,
    '戊': 0, '癸': 0
  };
  const yinStemIndex = stemStartMap[yearStem];

  const palaceStems: HeavenlyStem[] = new Array(12);
  for (let i = 0; i < 12; i++) {
    const bName = BRANCHES_ORDER[i];
    const offsetFromYin = (BRANCH_INDEX[bName] - BRANCH_INDEX['寅'] + 12) % 12;
    palaceStems[i] = STEMS[(yinStemIndex + offsetFromYin) % 10];
  }

  const mingStem = palaceStems[mingBranchIndex];
  const fiveElem = getFiveElement(mingStem, mingBranch);

  let ziweiBranchIndex = 0;
  let quotient = Math.ceil(lunarDay / fiveElem.number);
  let remainder = (quotient * fiveElem.number) - lunarDay;
  let ziweiZhiIndex = 0;
  if (remainder % 2 === 0) {
    ziweiZhiIndex = (['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf('寅') + quotient - 1 + remainder + 24) % 12;
  } else {
    ziweiZhiIndex = (['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf('寅') + quotient - 1 - remainder + 24) % 12;
  }
  const ziweiZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][ziweiZhiIndex] as EarthlyBranch;
  ziweiBranchIndex = BRANCH_INDEX[ziweiZhi];

  const tianjiIndex = (ziweiBranchIndex - 1 + 12) % 12;
  const taiyangIndex = (ziweiBranchIndex - 3 + 12) % 12;
  const wuquIndex = (ziweiBranchIndex - 4 + 12) % 12;
  const tiantongIndex = (ziweiBranchIndex - 5 + 12) % 12;
  const lianzhenIndex = (ziweiBranchIndex - 8 + 12) % 12;

  const tianfuZhiIndex = (4 - ziweiZhiIndex + 12) % 12;
  const tianfuZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][tianfuZhiIndex] as EarthlyBranch;
  const tianfuBranchIndex = BRANCH_INDEX[tianfuZhi];

  const taiyinIndex = (tianfuBranchIndex + 1) % 12;
  const tanlangIndex = (tianfuBranchIndex + 2) % 12;
  const jumenIndex = (tianfuBranchIndex + 3) % 12;
  const tianxiangIndex = (tianfuBranchIndex + 4) % 12;
  const tianliangIndex = (tianfuBranchIndex + 5) % 12;
  const qishaiIndex = (tianfuBranchIndex + 6) % 12;
  const pojunIndex = (tianfuBranchIndex + 10) % 12;

  const yearMutagens = FOUR_MUTAGENS_MAP[yearStem];

  // 1. 紅鸞天喜
  const hongluanZhiIndex = (3 - yearZhiIndex + 12) % 12;
  const tianxiZhiIndex = (hongluanZhiIndex + 6) % 12;
  const hongluanZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][hongluanZhiIndex];
  const tianxiZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][tianxiZhiIndex];

  // 2. 天刑天姚
  const tianxingZhiIndex = (9 + (lunarMonth - 1)) % 12;
  const tianyaoZhiIndex = (1 + (lunarMonth - 1)) % 12;
  const tianxingZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][tianxingZhiIndex];
  const tianyaoZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][tianyaoZhiIndex];

  // 3. 孤辰寡宿
  let guchenZhi = '寅', guasuZhi = '戌';
  if (['亥','子','丑'].includes(yearBranch)) { guchenZhi = '寅'; guasuZhi = '戌'; }
  else if (['寅','卯','辰'].includes(yearBranch)) { guchenZhi = '巳'; guasuZhi = '丑'; }
  else if (['巳','午','未'].includes(yearBranch)) { guchenZhi = '申'; guasuZhi = '辰'; }
  else if (['申','酉','戌'].includes(yearBranch)) { guchenZhi = '亥'; guasuZhi = '未'; }

  // 4. 龍池鳳閣
  const longchiZhiIndex = (4 + yearZhiIndex) % 12;
  const fenggeZhiIndex = (10 - yearZhiIndex + 12) % 12;
  const longchiZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][longchiZhiIndex];
  const fenggeZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][fenggeZhiIndex];

  // 5. 三台八座
  const zuofuZhiIndex = (4 + (lunarMonth - 1)) % 12;
  const youbiZhiIndex = (10 - (lunarMonth - 1) + 12) % 12;
  const santaiZhiIndex = (zuofuZhiIndex + (lunarDay - 1)) % 12;
  const bazuoZhiIndex = (youbiZhiIndex - (lunarDay - 1) + 24) % 12;
  const santaiZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][santaiZhiIndex];
  const bazuoZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][bazuoZhiIndex];

  // 6. 咸池華蓋
  let xianchiZhi = '酉', huagaiZhi = '辰';
  if (['申','子','辰'].includes(yearBranch)) { xianchiZhi = '酉'; huagaiZhi = '辰'; }
  else if (['寅','午','戌'].includes(yearBranch)) { xianchiZhi = '卯'; huagaiZhi = '戌'; }
  else if (['巳','酉','丑'].includes(yearBranch)) { xianchiZhi = '午'; huagaiZhi = '丑'; }
  else if (['亥','卯','未'].includes(yearBranch)) { xianchiZhi = '子'; huagaiZhi = '未'; }

  const ZHI: EarthlyBranch[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const zhiAt = (idx: number) => ZHI[((idx % 12) + 12) % 12];
  const isForward = (yinyangGender === '陽男' || yinyangGender === '陰女');
  const dir = isForward ? 1 : -1;

  // 天魁天鉞 (年干)
  const kuiyueMap: Record<HeavenlyStem, [EarthlyBranch, EarthlyBranch]> = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'], '庚': ['丑', '未'], '辛': ['午', '寅'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳']
  };
  const [tiankuiZhi, tianyueZhi] = kuiyueMap[yearStem];

  // 祿存、擎羊、陀羅 (年干)
  const lucunMap: Record<HeavenlyStem, EarthlyBranch> = {
    '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
    '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
  };
  const lucunZhiIndex = ZHI.indexOf(lucunMap[yearStem]);
  const qingyangZhi = zhiAt(lucunZhiIndex + 1);
  const tuoluoZhi = zhiAt(lucunZhiIndex - 1);

  // 火星鈴星 (年支三合 + 時辰順數)
  let huoStart = 1, lingStart = 3; // 寅午戌：火丑、鈴卯
  if (['申','子','辰'].includes(yearBranch)) { huoStart = 2; lingStart = 10; }
  else if (['巳','酉','丑'].includes(yearBranch)) { huoStart = 3; lingStart = 10; }
  else if (['亥','卯','未'].includes(yearBranch)) { huoStart = 9; lingStart = 10; }
  const huoxingZhi = zhiAt(huoStart + timeZhiIndex);
  const lingxingZhi = zhiAt(lingStart + timeZhiIndex);

  // 地空地劫 (亥宮起子時，劫順空逆)
  const dijieZhi = zhiAt(11 + timeZhiIndex);
  const dikongZhi = zhiAt(11 - timeZhiIndex);

  // 長生十二神 (依五行局起長生，陽男陰女順行，陰男陽女逆行)
  const changshengStartMap: Record<number, number> = { 2: 8, 3: 11, 4: 5, 5: 8, 6: 2 };
  const changshengStart = changshengStartMap[fiveElem.number];
  const CHANGSHENG_NAMES = ['長生', '沐浴', '冠帶', '臨官', '帝旺', '衰', '病', '死', '墓', '絕', '胎', '養'];
  // 博士十二神 (祿存起博士，順逆同大限)
  const BOSHI_NAMES = ['博士', '力士', '青龍', '小耗', '將軍', '奏書', '飛廉', '喜神', '病符', '大耗', '伏兵', '官符'];
  // 歲前十二神 (年支起歲建，一律順行)
  const SUIQIAN_NAMES = ['歲建', '晦氣', '喪門', '貫索', '官符', '小耗', '歲破', '龍德', '白虎', '天德', '弔客', '病符'];
  // 將前十二神 (年支三合起將星，一律順行)
  const JIANGQIAN_NAMES = ['將星', '攀鞍', '歲驛', '息神', '華蓋', '劫煞', '災煞', '天煞', '指背', '咸池', '月煞', '亡神'];
  let jiangxingStart = 6; // 寅午戌：午
  if (['申','子','辰'].includes(yearBranch)) jiangxingStart = 0;
  else if (['巳','酉','丑'].includes(yearBranch)) jiangxingStart = 9;
  else if (['亥','卯','未'].includes(yearBranch)) jiangxingStart = 3;

  // 小限 (年支三合起一歲，男順女逆)
  let smallLimitStart = 4; // 寅午戌：辰
  if (['申','子','辰'].includes(yearBranch)) smallLimitStart = 10;
  else if (['巳','酉','丑'].includes(yearBranch)) smallLimitStart = 7;
  else if (['亥','卯','未'].includes(yearBranch)) smallLimitStart = 1;
  const smallLimitDir = input.gender === 'male' ? 1 : -1;

  // 子斗 = 子年斗君：子宮起正月逆數至生月，再起子時順數至生時
  // 任一流年的斗君 = 子斗 + 流年地支
  const ziDouIndex = ((0 - (lunarMonth - 1) + timeZhiIndex) % 12 + 12) % 12;
  const ziDouZhi = ZHI[ziDouIndex];

  const palaces: PalaceData[] = [];

  for (let i = 0; i < 12; i++) {
    const branch = BRANCHES_ORDER[i];
    const stem = palaceStems[i];
    const zhiIdx = ZHI.indexOf(branch);

    // 十二宮由命宮起逆時針排列 (命宮、兄弟、夫妻…)
    const palaceNameOffset = (BRANCH_INDEX[mingBranch] - BRANCH_INDEX[branch] + 12) % 12;
    const name = PALACE_NAMES_ORDER[palaceNameOffset];
    const isBodyPalace = branch === shenBranch;
    // 生年天干與宮位天干相同即為【來因宮】(子丑兩宮不取)
    const isLaiYinPalace = stem === yearStem && branch !== '子' && branch !== '丑';
    const dirInfo = DIRECTION_MAP[branch];

    // 流年與大限縮寫對照 (如: 年兄, 大遷)
    const shortName = SHORT_PALACE_NAMES[name];
    const flowYearPalaceName = `年${shortName}`;
    const decadalPalaceName = `大${shortName}`;

    // 主星 (甲級)
    const mainStars: Star[] = [];
    const checkAddMain = (starName: string, targetIdx: number) => {
      if (i === targetIdx) {
        let mutagen: Mutagen | undefined = undefined;
        for (const [m, sName] of Object.entries(yearMutagens)) {
          if (sName === starName) mutagen = m as Mutagen;
        }

        // 檢查宮幹引發的自化 (宮幹四化)
        const palaceMutagens = FOUR_MUTAGENS_MAP[stem];
        let selfMutagen: Mutagen | undefined = undefined;
        for (const [m, sName] of Object.entries(palaceMutagens)) {
          if (sName === starName) selfMutagen = m as Mutagen;
        }

        mainStars.push({
          id: `${starName}-${branch}`,
          name: starName,
          type: 'main',
          brightness: BRIGHTNESS_MAP[starName]?.[branch] || '',
          mutagen,
          selfMutagen,
          colorCategory: starName === '紫微' || starName === '天府' ? 'purple' : 'red'
        });
      }
    };

    checkAddMain('紫微', ziweiBranchIndex);
    checkAddMain('天機', tianjiIndex);
    checkAddMain('太陽', taiyangIndex);
    checkAddMain('武曲', wuquIndex);
    checkAddMain('天同', tiantongIndex);
    checkAddMain('廉貞', lianzhenIndex);
    checkAddMain('天府', tianfuBranchIndex);
    checkAddMain('太陰', taiyinIndex);
    checkAddMain('貪狼', tanlangIndex);
    checkAddMain('巨門', jumenIndex);
    checkAddMain('天相', tianxiangIndex);
    checkAddMain('天梁', tianliangIndex);
    checkAddMain('七殺', qishaiIndex);
    checkAddMain('破軍', pojunIndex);

    // 吉星煞星
    const luckyStars: Star[] = [];
    const badStars: Star[] = [];

    const wenchangZhiIndex = (10 - timeZhiIndex + 12) % 12;
    const wenquZhiIndex = (4 + timeZhiIndex) % 12;
    if (branch === ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][wenchangZhiIndex]) {
      let m: Mutagen | undefined = yearMutagens['科'] === '文昌' ? '科' : (yearMutagens['忌'] === '文昌' ? '忌' : undefined);
      luckyStars.push({ id: `wenchang-${branch}`, name: '文昌', type: 'lucky', brightness: BRIGHTNESS_MAP['文昌']?.[branch], mutagen: m, colorCategory: 'blue' });
    }
    if (branch === ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][wenquZhiIndex]) {
      let m: Mutagen | undefined = yearMutagens['科'] === '文曲' ? '科' : (yearMutagens['忌'] === '文曲' ? '忌' : undefined);
      luckyStars.push({ id: `wenqu-${branch}`, name: '文曲', type: 'lucky', brightness: BRIGHTNESS_MAP['文曲']?.[branch], mutagen: m, colorCategory: 'blue' });
    }

    if (branch === ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][zuofuZhiIndex]) {
      let m: Mutagen | undefined = yearMutagens['科'] === '左輔' ? '科' : undefined;
      luckyStars.push({ id: `zuofu-${branch}`, name: '左輔', type: 'lucky', mutagen: m, colorCategory: 'blue' });
    }
    if (branch === ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][youbiZhiIndex]) {
      let m: Mutagen | undefined = yearMutagens['科'] === '右弼' ? '科' : undefined;
      luckyStars.push({ id: `youbi-${branch}`, name: '右弼', type: 'lucky', mutagen: m, colorCategory: 'blue' });
    }

    if (branch === tiankuiZhi) luckyStars.push({ id: `tiankui-${branch}`, name: '天魁', type: 'lucky', colorCategory: 'blue' });
    if (branch === tianyueZhi) luckyStars.push({ id: `tianyue-${branch}`, name: '天鉞', type: 'lucky', colorCategory: 'blue' });
    if (branch === lucunMap[yearStem]) {
      luckyStars.push({ id: `lucun-${branch}`, name: '祿存', type: 'lucky', colorCategory: 'gold' });
    }

    if (branch === qingyangZhi) badStars.push({ id: `qingyang-${branch}`, name: '擎羊', type: 'bad', colorCategory: 'gray' });
    if (branch === tuoluoZhi) badStars.push({ id: `tuoluo-${branch}`, name: '陀羅', type: 'bad', colorCategory: 'gray' });
    if (branch === huoxingZhi) badStars.push({ id: `huoxing-${branch}`, name: '火星', type: 'bad', colorCategory: 'gray' });
    if (branch === lingxingZhi) badStars.push({ id: `lingxing-${branch}`, name: '鈴星', type: 'bad', colorCategory: 'gray' });
    if (branch === dikongZhi) badStars.push({ id: `dikong-${branch}`, name: '地空', type: 'bad', colorCategory: 'gray' });
    if (branch === dijieZhi) badStars.push({ id: `dijie-${branch}`, name: '地劫', type: 'bad', colorCategory: 'gray' });

    const minorStars: Star[] = [];
    if (branch === hongluanZhi) minorStars.push({ id: `hongluan-${branch}`, name: '紅鸞', type: 'gradeB' });
    if (branch === tianxiZhi) minorStars.push({ id: `tianxi-${branch}`, name: '天喜', type: 'gradeB' });
    if (branch === tianxingZhi) minorStars.push({ id: `tianxing-${branch}`, name: '天刑', type: 'gradeB' });
    if (branch === tianyaoZhi) minorStars.push({ id: `tianyao-${branch}`, name: '天姚', type: 'gradeB' });
    if (branch === guchenZhi) minorStars.push({ id: `guchen-${branch}`, name: '孤辰', type: 'gradeB' });
    if (branch === guasuZhi) minorStars.push({ id: `guasu-${branch}`, name: '寡宿', type: 'gradeB' });
    if (branch === longchiZhi) minorStars.push({ id: `longchi-${branch}`, name: '龍池', type: 'gradeB' });
    if (branch === fenggeZhi) minorStars.push({ id: `fengge-${branch}`, name: '鳳閣', type: 'gradeB' });
    if (branch === santaiZhi) minorStars.push({ id: `santai-${branch}`, name: '三台', type: 'gradeB' });
    if (branch === bazuoZhi) minorStars.push({ id: `bazuo-${branch}`, name: '八座', type: 'gradeB' });
    if (branch === xianchiZhi) minorStars.push({ id: `xianchi-${branch}`, name: '咸池', type: 'gradeB' });
    if (branch === huagaiZhi) minorStars.push({ id: `huagai-${branch}`, name: '華蓋', type: 'gradeB' });

    const boshi = BOSHI_NAMES[(((zhiIdx - lucunZhiIndex) * dir) % 12 + 12) % 12];
    const suiqian = SUIQIAN_NAMES[(zhiIdx - yearZhiIndex + 12) % 12];
    const jiangqian = JIANGQIAN_NAMES[(zhiIdx - jiangxingStart + 12) % 12];
    const changsheng = CHANGSHENG_NAMES[(((zhiIdx - changshengStart) * dir) % 12 + 12) % 12];
    const godStars: Star[] = [
      { id: `boshi-${branch}`, name: boshi, type: 'gradeC' },
      { id: `suiqian-${branch}`, name: suiqian, type: 'gradeC' }
    ];

    let decadalOffset = (BRANCH_INDEX[branch] - BRANCH_INDEX[mingBranch] + 12) % 12;
    if (!isForward) {
      decadalOffset = (BRANCH_INDEX[mingBranch] - BRANCH_INDEX[branch] + 12) % 12;
    }
    const startAge = fiveElem.number + decadalOffset * 10;
    const endAge = startAge + 9;

    // 流月：生年斗君所在宮為正月，順行
    const monthName = getFlowMonthName(branch, ziDouZhi, yearStem, yearBranch);

    // 流年歲數：生年支所在宮為 1 歲，順行
    const flowYearsList = Array.from({ length: 7 }, (_, idx) => ((zhiIdx - yearZhiIndex + 12) % 12) + 1 + idx * 12);
    // 小限歲數
    const smallLimitFirst = ((((zhiIdx - smallLimitStart) * smallLimitDir) % 12) + 12) % 12 + 1;
    const smallLimitYears = Array.from({ length: 7 }, (_, idx) => smallLimitFirst + idx * 12);

    palaces.push({
      index: i,
      branch,
      stem,
      name,
      direction: dirInfo.direction,
      directionEightTrigram: dirInfo.trigram,
      isBodyPalace,
      isLaiYinPalace,
      flowYearPalaceName,
      decadalPalaceName,
      mainStars,
      luckyStars,
      badStars,
      minorStars,
      godStars,
      boshi,
      suiqian,
      jiangqian,
      changsheng,
      decadalRange: [startAge, endAge],
      decadalStemBranch: `${stem}${branch}`,
      smallLimitYears,
      flowYearsList,
      lunarMonthName: monthName
    });
  }

  // 亮度與雜曜改由 iztro 計算 (已對照文墨天機一致)
  const hourIndex = input.hour === 23 ? 12 : Math.floor((input.hour + 1) / 2);
  const iz = astro.bySolar(`${solar.getYear()}-${solar.getMonth()}-${solar.getDay()}`, hourIndex, input.gender === 'male' ? '男' : '女', true, 'zh-TW');
  // 旬空、截空各佔兩宮：與年干同陰陽的地支為正，另一宮為副
  const yearStemIdx = STEMS.indexOf(yearStem);
  const xunHeadBranch = ((yearZhiIndex - yearStemIdx) % 12 + 12) % 12;
  const xunkongPair = [zhiAt(xunHeadBranch + 10), zhiAt(xunHeadBranch + 11)];
  const jiekongTable: Record<number, [number, number]> = { 0: [8, 9], 1: [6, 7], 2: [4, 5], 3: [2, 3], 4: [0, 1] };
  const jiekongPair = jiekongTable[yearStemIdx % 5].map((x) => ZHI[x]);
  const byPolarity = (pair: EarthlyBranch[]) =>
    ZHI.indexOf(pair[0]) % 2 === yearStemIdx % 2 ? pair : [pair[1], pair[0]];
  const [xunkongMain, xunkongSub] = byPolarity(xunkongPair);
  const [jiekongMain, jiekongSub] = byPolarity(jiekongPair);

  for (const p of palaces) {
    const ip = iz.palaces.find((x) => x.earthlyBranch === p.branch);
    if (!ip) continue;
    const brightnessOf = new Map<string, string>();
    [...ip.majorStars, ...ip.minorStars].forEach((s) => { if (s.brightness) brightnessOf.set(s.name, s.brightness); });
    [...p.mainStars, ...p.luckyStars, ...p.badStars].forEach((s) => {
      const b = brightnessOf.get(s.name);
      if (b) s.brightness = b as Brightness;
    });
    if (ip.minorStars.some((s) => s.name === '天馬')) {
      p.luckyStars.push({ id: `tianma-${p.branch}`, name: '天馬', type: 'lucky', brightness: brightnessOf.get('天馬') as Brightness | undefined, colorCategory: 'blue' });
    }
    const names = ip.adjectiveStars
      .map((s) => ADJECTIVE_RENAME[s.name] || s.name)
      .filter((n) => !['旬空', '截空', '副截', '副旬'].includes(n));
    if (p.branch === jiekongMain) names.push('截空');
    if (p.branch === jiekongSub) names.push('副截');
    if (p.branch === xunkongMain) names.push('旬空');
    if (p.branch === xunkongSub) names.push('副旬');
    if (p.suiqian === '龍德') names.push('龍德');
    if (p.jiangqian === '劫煞') names.push('劫煞');
    // 大耗：年支對宮，陽支再順一宮、陰支再逆一宮
    if (p.branch === zhiAt(yearZhiIndex + 6 + (yearZhiIndex % 2 === 0 ? 1 : -1))) names.push('大耗');
    p.minorStars = names.map((n) => ({ id: `${n}-${p.branch}`, name: n, type: 'gradeB' }));
  }

  const eightChar = lunar.getEightChar();

  const trueSolarBirth = fmtDateTime(getTrueSolarTime(input));

  // 計算八字大運走勢卡片 (8步大運，依節氣精算起運)
  const dayStem = eightChar.getDay().charAt(0); // 日干 (如 庚)
  const yun = eightChar.getYun(input.gender === 'male' ? 1 : 0, 2); // 流派 2：精算到分鐘
  const luckCycles: LuckCycleStep[] = yun.getDaYun().slice(1, 9).map((dy) => ({
    stemBranch: dy.getGanZhi(),
    tenGod: getTenGod(dayStem, dy.getGanZhi().charAt(0)),
    age: dy.getStartAge(),
    year: dy.getStartYear()
  }));
  const yunStartText = `出生後 ${yun.getStartYear()}年${yun.getStartMonth()}月${yun.getStartDay()}天 八字起運`;

  // 精準動態流年與虛歲計算
  const now = new Date();
  const currentSolar = Solar.fromYmdHms(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  );
  const currentLunar = currentSolar.getLunar();
  const currentYear = currentSolar.getYear();
  const birthYear = input.year;

  const nominalAge = Math.max(1, currentYear - birthYear + 1);

  let currentDecadeStr = `${fiveElem.number}-${fiveElem.number + 9} 歲`;
  const matchingPalace = palaces.find(p => nominalAge >= p.decadalRange[0] && nominalAge <= p.decadalRange[1]);
  if (matchingPalace) {
    currentDecadeStr = `${matchingPalace.decadalRange[0]}-${matchingPalace.decadalRange[1]} 歲`;
  }

  const currentFlowYearStr = `${currentYear} ${currentLunar.getYearInGanZhi()}年 虛歲${nominalAge}歲`;

  return {
    id: `ziwei-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userInfo: {
      name: input.name || '未命名',
      gender: input.gender,
      yinyangGender,
      fiveElementElement: fiveElem.name,
      fiveElementNumber: fiveElem.number,
      masterStar: MASTER_STAR_MAP[mingBranch],
      bodyMasterStar: BODY_MASTER_MAP[yearBranch],
      ziDou: ziDouZhi,
      solarBirth: `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')} ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`,
      trueSolarBirth,
      lunarBirth: `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}日 ${timeBranch}時`,
      fourPillars: {
        year: eightChar.getYear(),
        month: eightChar.getMonth(),
        day: eightChar.getDay(),
        time: eightChar.getTime()
      },
      nonTermFourPillars: {
        year: `${lunar.getYearGan()}${lunar.getYearZhi()}`,
        // 非節氣月柱照農曆月份起 (五虎遁)，不看節氣交接
        month: `${STEMS[(TIGER_MONTH_STEM_START[lunar.getYearGan() as HeavenlyStem] + Math.abs(lunar.getMonth()) - 1) % 10]}${ZHI_ORDER[(Math.abs(lunar.getMonth()) + 1) % 12]}`,
        day: `${lunar.getDayGan()}${lunar.getDayZhi()}`,
        time: `${lunar.getTimeGan()}${lunar.getTimeZhi()}`
      },
      startAgeNotice: `出生後 ${yun.getStartYear()}年 八字起運`,
      startAgeDetail: yunStartText,
      currentDecade: currentDecadeStr,
      currentFlowYear: currentFlowYearStr,
      luckCycles,
      lunarBirthYear: lunar.getYear()
    },
    palaces,
    birthInput: input
  };
}

// ===== 流運 (大限／流年／流月／流日／流時) =====

const LUCUN_BY_STEM: Record<HeavenlyStem, number> = { '甲': 2, '乙': 3, '丙': 5, '丁': 6, '戊': 5, '己': 6, '庚': 8, '辛': 9, '壬': 11, '癸': 0 };
const KUIYUE_BY_STEM: Record<HeavenlyStem, [number, number]> = {
  '甲': [1, 7], '戊': [1, 7], '庚': [1, 7], '乙': [0, 8], '己': [0, 8],
  '丙': [11, 9], '丁': [11, 9], '辛': [6, 2], '壬': [3, 5], '癸': [3, 5]
};
const CHANG_BY_STEM: Record<HeavenlyStem, number> = { '甲': 5, '乙': 6, '丙': 8, '丁': 9, '戊': 8, '己': 9, '庚': 11, '辛': 0, '壬': 2, '癸': 3 };
const QU_BY_STEM: Record<HeavenlyStem, number> = { '甲': 9, '乙': 8, '丙': 6, '丁': 5, '戊': 6, '己': 5, '庚': 3, '辛': 2, '壬': 0, '癸': 11 };
// 五鼠遁：日干決定子時的時干
const RAT_HOUR_STEM_START: Record<HeavenlyStem, number> = {
  '甲': 0, '己': 0, '乙': 2, '庚': 2, '丙': 4, '辛': 4, '丁': 6, '壬': 6, '戊': 8, '癸': 8
};
const SHORT_NAMES = ['命', '兄', '夫', '子', '財', '疾', '遷', '友', '官', '田', '福', '父'];
export const LUNAR_DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];
export const LUNAR_MONTH_LABELS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const zi = (i: number) => ZHI_ORDER[((i % 12) + 12) % 12];

// 大限流曜 (依大限宮干支)
function getDecadalStars(stem: HeavenlyStem, branch: EarthlyBranch): Record<string, EarthlyBranch> {
  const b = ZHI_ORDER.indexOf(branch);
  const lu = LUCUN_BY_STEM[stem];
  let ma = 8; // 寅午戌：申
  if ([8, 0, 4].includes(b)) ma = 2;
  else if ([5, 9, 1].includes(b)) ma = 11;
  else if ([11, 3, 7].includes(b)) ma = 5;
  const luan = (3 - b + 12) % 12;
  return {
    '大祿': zi(lu), '大羊': zi(lu + 1), '大陀': zi(lu - 1),
    '大魁': zi(KUIYUE_BY_STEM[stem][0]), '大鉞': zi(KUIYUE_BY_STEM[stem][1]),
    '大昌': zi(CHANG_BY_STEM[stem]), '大曲': zi(QU_BY_STEM[stem]),
    '大馬': zi(ma), '大鸞': zi(luan), '大喜': zi(luan + 6),
  };
}

function getLunarBirthYear(chart: ZiweiChartData): number {
  return chart.userInfo.lunarBirthYear ?? (parseInt(chart.userInfo.solarBirth.split('-')[0]) || new Date().getFullYear());
}

const yearGanZhi = (year: number) => ({
  stem: STEMS[(((year - 4) % 10) + 10) % 10],
  branch: ZHI_ORDER[(((year - 4) % 12) + 12) % 12],
});

// 大限選單清單 (依歲數排序)
export function getDecadeList(chart: ZiweiChartData) {
  return [...chart.palaces]
    .sort((a, b) => a.decadalRange[0] - b.decadalRange[0])
    .map((p) => ({ key: `${p.decadalRange[0]}-${p.decadalRange[1]}`, range: p.decadalRange, stem: p.stem, branch: p.branch }));
}

// 預設大限：包含目前虛歲者；還在童限時用第一個大限
export function getDefaultDecadeKey(chart: ZiweiChartData): string {
  const age = new Date().getFullYear() - getLunarBirthYear(chart) + 1;
  const list = getDecadeList(chart);
  return (list.find((d) => age >= d.range[0] && age <= d.range[1]) || list[0]).key;
}

/** 今年 (以農曆年算，過了春節才換年) 落在哪個大限；還沒出生或超過最後一個大限就回 null */
export function getThisYearFlow(chart: ZiweiChartData, today = new Date()): { decadeKey: string; year: number; age: number } | null {
  const year = Solar.fromDate(today).getLunar().getYear();
  const age = year - getLunarBirthYear(chart) + 1;
  if (age < 1) return null;
  const list = getDecadeList(chart);
  if (age < list[0].range[0]) return { decadeKey: 'child', year, age };
  const d = list.find((x) => age >= x.range[0] && age <= x.range[1]);
  return d ? { decadeKey: d.key, year, age } : null;
}

/** 今天對應的流年、流月、流日、流時 (農曆；閏月算當月) */
export function getTodayFlow(chart: ZiweiChartData, now = new Date()): FlowSelection | null {
  const y = getThisYearFlow(chart, now);
  if (!y) return null;
  const lunar = Solar.fromDate(now).getLunar();
  const hour = Math.floor(((now.getHours() + 1) % 24) / 2); // 23 點起算子時
  return { decadeKey: y.decadeKey, year: y.year, month: Math.abs(lunar.getMonth()), day: lunar.getDay(), hour };
}

// 某個大限 (或童限) 內的十個流年
export function getFlowYears(chart: ZiweiChartData, decadeKey: string) {
  const birth = getLunarBirthYear(chart);
  const list = getDecadeList(chart);
  const [from, to] = decadeKey === 'child'
    ? [1, list[0].range[0] - 1]
    : (list.find((d) => d.key === decadeKey) || list[0]).range;
  const years = [];
  for (let age = from; age <= to; age++) {
    const year = birth + age - 1;
    years.push({ year, age, ...yearGanZhi(year) });
  }
  return years;
}

// 流年某月的天數 (農曆)；查不到就回 30
export function getLunarMonthDayCount(year: number, month: number): number {
  try {
    return LunarMonth.fromYm(year, month)?.getDayCount() ?? 30;
  } catch {
    return 30;
  }
}

export function applyFlowSelection(base: ZiweiChartData, sel: FlowSelection): ZiweiChartData {
  const ziDouIdx = ZHI_ORDER.indexOf(base.userInfo.ziDou);
  const infoParts: string[] = [];
  const levels: { level: FlowLevel; branch: number; stem: HeavenlyStem }[] = [];

  // 大限
  const decade = sel.decadeKey && sel.decadeKey !== 'child'
    ? base.palaces.find((p) => `${p.decadalRange[0]}-${p.decadalRange[1]}` === sel.decadeKey)
    : undefined;
  if (decade) {
    levels.push({ level: '大', branch: ZHI_ORDER.indexOf(decade.branch), stem: decade.stem });
    infoParts.push(`${decade.stem}${decade.branch}大限 (${decade.decadalRange[0]}~${decade.decadalRange[1]}歲)`);
  } else if (sel.decadeKey === 'child') {
    infoParts.push('童限');
  }

  // 流年 → 流月 → 流日 → 流時 (每一層都從上一層推下來)
  if (sel.year !== null) {
    const y = yearGanZhi(sel.year);
    const yearBranch = ZHI_ORDER.indexOf(y.branch);
    levels.push({ level: '年', branch: yearBranch, stem: y.stem });
    infoParts.push(`${sel.year} ${y.stem}${y.branch}年 (虛歲${sel.year - getLunarBirthYear(base) + 1})`);

    if (sel.month !== null) {
      const monthBranch = (ziDouIdx + yearBranch + sel.month - 1) % 12; // 流年斗君起正月
      const monthStem = STEMS[(TIGER_MONTH_STEM_START[y.stem] + sel.month - 1) % 10];
      levels.push({ level: '月', branch: monthBranch, stem: monthStem });
      infoParts.push(`${LUNAR_MONTH_LABELS[sel.month - 1]} ${monthStem}${ZHI_ORDER[(sel.month + 1) % 12]}月`);

      if (sel.day !== null) {
        const dayBranch = (monthBranch + sel.day - 1) % 12; // 流月命宮起初一
        let dayStem: HeavenlyStem | null = null;
        let dayZhi = '';
        try {
          const d = Lunar.fromYmd(sel.year, sel.month, sel.day);
          dayStem = d.getDayGan() as HeavenlyStem;
          dayZhi = d.getDayZhi();
        } catch {
          dayStem = null;
        }
        if (dayStem) {
          levels.push({ level: '日', branch: dayBranch, stem: dayStem });
          infoParts.push(`${LUNAR_DAY_NAMES[sel.day - 1]} ${dayStem}${dayZhi}日`);

          if (sel.hour !== null) {
            const hourBranch = (dayBranch + sel.hour) % 12; // 流日命宮起子時
            const hourStem = STEMS[(RAT_HOUR_STEM_START[dayStem] + sel.hour) % 10];
            levels.push({ level: '時', branch: hourBranch, stem: hourStem });
            infoParts.push(`${hourStem}${ZHI_ORDER[sel.hour]}時`);
          }
        }
      }
    }
  }

  const deepest = levels.filter((l) => l.level !== '大').pop();
  const decadeLevel = levels.find((l) => l.level === '大');
  const decadalStarMap = decade ? getDecadalStars(decade.stem, decade.branch) : null;
  const birthYear = getLunarBirthYear(base);

  const palaces = base.palaces.map((palace) => {
    const pIdx = ZHI_ORDER.indexOf(palace.branch);
    const stars = [...palace.mainStars, ...palace.luckyStars];
    const flowMutagens: NonNullable<PalaceData['flowMutagens']> = [];
    // 只標大限與最細一層的四化，避免同一顆星堆太多標籤
    for (const l of [decadeLevel, deepest]) {
      if (!l) continue;
      for (const [m, starName] of Object.entries(FOUR_MUTAGENS_MAP[l.stem])) {
        if (stars.some((s) => s.name === starName)) flowMutagens.push({ starName, mutagen: m as Mutagen, level: l.level });
      }
    }

    let decadeYearInfo: PalaceData['decadeYearInfo'];
    if (decade) {
      for (let age = decade.decadalRange[0]; age <= decade.decadalRange[1]; age++) {
        const year = birthYear + age - 1;
        if (yearGanZhi(year).branch === palace.branch) decadeYearInfo = { year, age };
      }
    }

    return {
      ...palace,
      lunarMonthName: sel.year !== null
        ? getFlowMonthName(palace.branch, base.userInfo.ziDou, yearGanZhi(sel.year).stem, yearGanZhi(sel.year).branch)
        : palace.lunarMonthName,
      dynamicDecadalName: decadeLevel ? `大${SHORT_NAMES[(decadeLevel.branch - pIdx + 12) % 12]}` : undefined,
      decadalStars: decadalStarMap ? Object.keys(decadalStarMap).filter((k) => decadalStarMap[k] === palace.branch) : undefined,
      decadeYearInfo,
      flowLevelName: deepest ? `${deepest.level}${SHORT_NAMES[(deepest.branch - pIdx + 12) % 12]}` : undefined,
      flowMutagens,
    };
  });

  return {
    ...base,
    userInfo: {
      ...base.userInfo,
      activeFlowCycleInfo: infoParts.length ? infoParts.join(' • ') : undefined,
    },
    palaces,
  };
}
