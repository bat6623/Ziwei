import { Solar, Lunar } from 'lunar-javascript';
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
  Yinyang
} from '../types/ziwei';

export const BRANCHES_ORDER: EarthlyBranch[] = ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'];

const BRANCH_INDEX: Record<EarthlyBranch, number> = {
  '巳': 0, '午': 1, '未': 2, '申': 3,
  '酉': 4, '戌': 5, '亥': 6, '子': 7,
  '丑': 8, '寅': 9, '卯': 10, '辰': 11
};

// 八卦與傳統地理方位表
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

const FOUR_MUTAGENS_MAP: Record<HeavenlyStem, Record<Mutagen, string>> = {
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

export function calculateZiweiChart(input: BirthInput): ZiweiChartData {
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

  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();
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

  // 計算乙級星位置：
  // 1. 紅鸞天喜 (依年支：卯起子年逆數)
  const hongluanZhiIndex = (3 - yearZhiIndex + 12) % 12; // 卯為3
  const tianxiZhiIndex = (hongluanZhiIndex + 6) % 12;
  const hongluanZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][hongluanZhiIndex];
  const tianxiZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][tianxiZhiIndex];

  // 2. 天刑天姚 (依農曆月：酉起一月順安天刑，丑起一月順安天姚)
  const tianxingZhiIndex = (9 + (lunarMonth - 1)) % 12; // 酉為9
  const tianyaoZhiIndex = (1 + (lunarMonth - 1)) % 12; // 丑為1
  const tianxingZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][tianxingZhiIndex];
  const tianyaoZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][tianyaoZhiIndex];

  // 3. 孤辰寡宿 (依年支)
  let guchenZhi = '寅', guasuZhi = '戌';
  if (['亥','子','丑'].includes(yearBranch)) { guchenZhi = '寅'; guasuZhi = '戌'; }
  else if (['寅','卯','辰'].includes(yearBranch)) { guchenZhi = '巳'; guasuZhi = '丑'; }
  else if (['巳','午','未'].includes(yearBranch)) { guchenZhi = '申'; guasuZhi = '辰'; }
  else if (['申','酉','戌'].includes(yearBranch)) { guchenZhi = '亥'; guasuZhi = '未'; }

  // 4. 龍池鳳閣 (依年支：辰起子年順安龍池，戌起子年逆安鳳閣)
  const longchiZhiIndex = (4 + yearZhiIndex) % 12; // 辰為4
  const fenggeZhiIndex = (10 - yearZhiIndex + 12) % 12; // 戌為10
  const longchiZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][longchiZhiIndex];
  const fenggeZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][fenggeZhiIndex];

  // 5. 三台八座 (依左輔右弼與生日安)
  const zuofuZhiIndex = (4 + (lunarMonth - 1)) % 12;
  const youbiZhiIndex = (10 - (lunarMonth - 1) + 12) % 12;
  const santaiZhiIndex = (zuofuZhiIndex + (lunarDay - 1)) % 12;
  const bazuoZhiIndex = (youbiZhiIndex - (lunarDay - 1) + 24) % 12;
  const santaiZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][santaiZhiIndex];
  const bazuoZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][bazuoZhiIndex];

  // 6. 咸池華蓋 (依年支三合)
  let xianchiZhi = '酉', huagaiZhi = '辰';
  if (['申','子','辰'].includes(yearBranch)) { xianchiZhi = '酉'; huagaiZhi = '辰'; }
  else if (['寅','午','戌'].includes(yearBranch)) { xianchiZhi = '卯'; huagaiZhi = '戌'; }
  else if (['巳','酉','丑'].includes(yearBranch)) { xianchiZhi = '午'; huagaiZhi = '丑'; }
  else if (['亥','卯','未'].includes(yearBranch)) { xianchiZhi = '子'; huagaiZhi = '未'; }

  const palaces: PalaceData[] = [];

  for (let i = 0; i < 12; i++) {
    const branch = BRANCHES_ORDER[i];
    const stem = palaceStems[i];

    const palaceNameOffset = (BRANCH_INDEX[branch] - BRANCH_INDEX[mingBranch] + 12) % 12;
    const name = PALACE_NAMES_ORDER[palaceNameOffset];
    const isBodyPalace = branch === shenBranch;
    const dirInfo = DIRECTION_MAP[branch];

    // 主星 (甲級)
    const mainStars: Star[] = [];
    const checkAddMain = (starName: string, targetIdx: number) => {
      if (i === targetIdx) {
        let mutagen: Mutagen | undefined = undefined;
        for (const [m, sName] of Object.entries(yearMutagens)) {
          if (sName === starName) mutagen = m as Mutagen;
        }
        mainStars.push({
          id: `${starName}-${branch}`,
          name: starName,
          type: 'main',
          brightness: BRIGHTNESS_MAP[starName]?.[branch] || '',
          mutagen,
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

    const lucunMap: Record<HeavenlyStem, EarthlyBranch> = {
      '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
      '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
    };
    if (branch === lucunMap[yearStem]) {
      luckyStars.push({ id: `lucun-${branch}`, name: '祿存', type: 'lucky', colorCategory: 'gold' });
    }

    // 乙級雜曜收集 (Grade B Stars)
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

    // 丙級神煞收集 (Grade C Stars)
    const godStars: Star[] = [
      { id: `boshi-${branch}`, name: ['博士', '力士', '青龍', '小耗', '將軍', '奏書', '飛廉', '喜神', '病符', '大耗', '伏兵', '官符'][i % 12], type: 'gradeC' },
      { id: `suiqian-${branch}`, name: ['歲建', '晦氣', '喪門', '貫索', '官符', '小耗', '大耗', '龍德', '白虎', '天德', '吊客', '病符'][i % 12], type: 'gradeC' }
    ];

    let isForward = (yinyangGender === '陽男' || yinyangGender === '陰女');
    let decadalOffset = (BRANCH_INDEX[branch] - BRANCH_INDEX[mingBranch] + 12) % 12;
    if (!isForward) {
      decadalOffset = (BRANCH_INDEX[mingBranch] - BRANCH_INDEX[branch] + 12) % 12;
    }
    const startAge = fiveElem.number + decadalOffset * 10;
    const endAge = startAge + 9;

    const lunarMonthNames = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '臘'];
    const monthName = `${lunarMonthNames[i % 12]}月${stem}`;

    palaces.push({
      index: i,
      branch,
      stem,
      name,
      direction: dirInfo.direction,
      directionEightTrigram: dirInfo.trigram,
      isBodyPalace,
      mainStars,
      luckyStars,
      badStars,
      minorStars,
      godStars,
      boshi: ['博士', '力士', '青龍', '小耗', '將軍', '奏書', '飛廉', '喜神', '病符', '大耗', '伏兵', '官符'][i % 12],
      suiqian: ['歲建', '晦氣', '喪門', '貫索', '官符', '小耗', '大耗', '龍德', '白虎', '天德', '吊客', '病符'][i % 12],
      jiangqian: ['將星', '攀鞍', '歲驛', '息神', '華蓋', '劫煞', '災煞', '天煞', '指背', '咸池', '月煞', '亡神'][i % 12],
      changsheng: ['長生', '沐浴', '冠帶', '臨官', '帝旺', '衰', '病', '死', '墓', '絕', '胎', '養'][i % 12],
      decadalRange: [startAge, endAge],
      decadalStemBranch: `${stem}${branch}`,
      smallLimitYears: [i + 1, i + 13, i + 25, i + 37, i + 49, i + 61, i + 73],
      lunarMonthName: monthName
    });
  }

  const eightChar = lunar.getEightChar();

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
      ziDou: '午',
      solarBirth: `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')} ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`,
      lunarBirth: `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${timeBranch}時`,
      fourPillars: {
        year: eightChar.getYear(),
        month: eightChar.getMonth(),
        day: eightChar.getDay(),
        time: eightChar.getTime()
      },
      nonTermFourPillars: {
        year: `${lunar.getYearGan()}${lunar.getYearZhi()}`,
        month: `${lunar.getMonthGan()}${lunar.getMonthZhi()}`,
        day: `${lunar.getDayGan()}${lunar.getDayZhi()}`,
        time: `${lunar.getTimeGan()}${lunar.getTimeZhi()}`
      },
      startAgeNotice: `出生後 ${fiveElem.number} 年起運`,
      currentDecade: `${fiveElem.number + 40}-${fiveElem.number + 49} 歲`,
      currentFlowYear: `2026 丙午年 虛歲72歲`
    },
    palaces
  };
}
