import { Holiday } from '../types';

/**
 * Calculates Easter Sunday for a given year using the Meeus/Jones/Butcher algorithm.
 * Returns a UTC Date set to Easter Sunday.
 */
export function getEasterDate(year: number): Date {
  const f = Math.floor;
  const a = year % 19;
  const b = f(year / 100);
  const c = year % 100;
  const d = f(b / 4);
  const e = b % 4;
  const g = f((8 * b + 13) / 25);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = f(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = f((a + 11 * h + 22 * l) / 451);
  const month = f((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Returns a Set of ISO date strings (YYYY-MM-DD) representing Brazilian national holidays
 * for a specific year, including variable holidays.
 */
export function getHolidaysForYear(year: number): Set<string> {
  const holidays = new Set<string>();

  // Fixed holidays (YYYY-MM-DD)
  const pad = (n: number) => n.toString().padStart(2, '0');
  holidays.add(`${year}-01-01`); // Confraternização Universal
  holidays.add(`${year}-04-21`); // Tiradentes
  holidays.add(`${year}-05-01`); // Dia do Trabalho
  holidays.add(`${year}-09-07`); // Independência do Brasil
  holidays.add(`${year}-10-12`); // Nossa Senhora Aparecida
  holidays.add(`${year}-11-02`); // Finados
  holidays.add(`${year}-11-15`); // Proclamação da República
  holidays.add(`${year}-11-20`); // Consciência Negra (National holiday)
  holidays.add(`${year}-12-25`); // Natal

  // Variable holidays based on Easter
  const easter = getEasterDate(year);
  
  // Good Friday (Sexta-feira Santa) is 2 days before Easter
  const goodFriday = new Date(easter);
  goodFriday.setUTCDate(easter.getUTCDate() - 2);
  holidays.add(`${year}-${pad(goodFriday.getUTCMonth() + 1)}-${pad(goodFriday.getUTCDate())}`);

  // Shrove Tuesday (Terça de Carnaval) is 47 days before Easter
  const carnivalTuesday = new Date(easter);
  carnivalTuesday.setUTCDate(easter.getUTCDate() - 47);
  holidays.add(`${year}-${pad(carnivalTuesday.getUTCMonth() + 1)}-${pad(carnivalTuesday.getUTCDate())}`);

  // Ash Wednesday (Quarta de Cinzas) is 46 days before Easter - optionally included, but let's stick to standard holidays
  // Corpus Christi is 60 days after Easter
  const corpusChristi = new Date(easter);
  corpusChristi.setUTCDate(easter.getUTCDate() + 60);
  holidays.add(`${year}-${pad(corpusChristi.getUTCMonth() + 1)}-${pad(corpusChristi.getUTCDate())}`);

  return holidays;
}

/**
 * Normalizes a date representation to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Counts the number of working days between two dates (inclusive)
 * excluding Saturdays, Sundays, and national holidays.
 */
export function countBusinessDays(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let businessDays = 0;
  const current = new Date(start);

  // Keep track of cached holidays by year to avoid recalculating
  const holidayCache = new Map<number, Set<string>>();

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = current.getFullYear();
      if (!holidayCache.has(year)) {
        holidayCache.set(year, getHolidaysForYear(year));
      }
      
      const isoStr = formatDateISO(current);
      const yearHolidays = holidayCache.get(year);
      
      if (!yearHolidays?.has(isoStr)) {
        businessDays++;
      }
    }
    
    current.setDate(current.getDate() + 1);
  }

  return businessDays;
}

/**
 * Helper to get the start and end dates of a set of years and months
 */
export function getPeriodDates(years: number[], months: number[]): { startDate: string; endDate: string } {
  if (years.length === 0) {
    return { startDate: '2026-01-01', endDate: '2026-12-31' };
  }
  
  const sortedYears = [...years].sort((a, b) => a - b);
  const startYear = sortedYears[0];
  const endYear = sortedYears[sortedYears.length - 1];
  
  let startMonth = 1;
  let endMonth = 12;
  
  if (months.length > 0) {
    const sortedMonths = [...months].sort((a, b) => a - b);
    startMonth = sortedMonths[0];
    endMonth = sortedMonths[sortedMonths.length - 1];
  }
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Last day of the end month
  const lastDay = new Date(endYear, endMonth, 0).getDate();
  
  return {
    startDate: `${startYear}-${pad(startMonth)}-01`,
    endDate: `${endYear}-${pad(endMonth)}-${pad(lastDay)}`
  };
}
