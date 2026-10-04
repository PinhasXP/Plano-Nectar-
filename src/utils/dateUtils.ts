export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const MONTH_SHORT_NAMES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export const WEEKDAY_SHORT_PT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
export const WEEKDAY_FULL_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export interface DayInfo {
  dayNumber: number; // 1..31
  weekdayIndex: number; // 0 (Sun) .. 6 (Sat)
  weekdayShort: string; // SEG, TER, etc.
  weekdayFull: string;
  isWeekend: boolean;
  isToday: boolean;
  formattedDate: string; // "01/10/2026"
}

export function getDaysInMonth(year: number, monthIndex: number): DayInfo[] {
  const daysInMonthCount = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const days: DayInfo[] = [];

  for (let day = 1; day <= daysInMonthCount; day++) {
    const dateObj = new Date(year, monthIndex, day);
    const weekdayIndex = dateObj.getDay();
    const isWeekend = weekdayIndex === 0 || weekdayIndex === 6;
    const isToday = year === currentYear && monthIndex === currentMonth && day === currentDay;

    days.push({
      dayNumber: day,
      weekdayIndex,
      weekdayShort: WEEKDAY_SHORT_PT[weekdayIndex],
      weekdayFull: WEEKDAY_FULL_PT[weekdayIndex],
      isWeekend,
      isToday,
      formattedDate: `${String(day).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}/${year}`,
    });
  }

  return days;
}
