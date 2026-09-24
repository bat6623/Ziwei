declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getLunar(): Lunar;
  }
  export class LunarMonth {
    static fromYm(year: number, month: number): LunarMonth | null;
    getDayCount(): number;
  }
  export class Lunar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar;
    static fromYmd(year: number, month: number, day: number): Lunar;
    getSolar(): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInGanZhi(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getEightChar(): {
      getYear(): string;
      getMonth(): string;
      getDay(): string;
      getTime(): string;
      getYun(gender: number, sect?: number): {
        getStartYear(): number;
        getStartMonth(): number;
        getStartDay(): number;
        getDaYun(): {
          getGanZhi(): string;
          getStartAge(): number;
          getStartYear(): number;
        }[];
      };
    };
  }
}
