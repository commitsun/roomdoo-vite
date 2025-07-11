const getDatesRange = (start: Date, end: Date): Array<Date> => {
  const result: Date[] = [];

  const startDate = new Date(start);
  const endDate = new Date(end);

  const startOffset = startDate.getTimezoneOffset();
  const endOffset = endDate.getTimezoneOffset();

  startDate.setMinutes(startDate.getMinutes() - startOffset);
  endDate.setMinutes(endDate.getMinutes() - endOffset);

  const tempDate = new Date(startDate);
  tempDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  result.push(new Date(tempDate));

  while (tempDate < endDate) {
    tempDate.setDate(tempDate.getDate() + 1);
    tempDate.setHours(0, 0, 0, 0);
    result.push(new Date(tempDate));
  }
  return result;
};

export const ONE_DAY_IN_MS = 86400000;

export const localeSpain = {
  /* starting with Sunday */
  days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
  daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
  months:
    'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split(
      '_',
    ),
  monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
  firstDayOfWeek: 1, // 0-6, 0 - Sunday, 1 Monday, ...
  format24h: true,
  pluralDay: 'dias',
};

const daysBetween = (startDate: Date, endDate: Date): number => {
  const startCopy = new Date(startDate);
  const endCopy = new Date(endDate);
  const startOffset = startCopy.getTimezoneOffset();
  const endOffset = endCopy.getTimezoneOffset();
  startCopy.setMinutes(startCopy.getMinutes() - startOffset);
  endCopy.setMinutes(endCopy.getMinutes() - endOffset);
  const differenceInMilliseconds = endCopy.getTime() - startCopy.getTime();
  const differenceInDays = Math.floor(differenceInMilliseconds / ONE_DAY_IN_MS);
  return differenceInDays;
};

const datesOverlaps = (startDateA: Date, endDateA: Date, startDateB: Date, endDateB: Date) =>
  startDateA.getTime() < endDateB.getTime() && endDateA.getTime() > startDateB.getTime();

const timeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;

  if (interval >= 1) {
    return `${Math.floor(interval)} año${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  interval = seconds / 2592000;
  if (interval >= 1) {
    return `${Math.floor(interval)} mes${Math.floor(interval) > 1 ? 'es' : ''}`;
  }
  interval = seconds / 86400;
  if (interval >= 1) {
    return `${Math.floor(interval)} día${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  interval = seconds / 3600;
  if (interval >= 1) {
    return `${Math.floor(interval)} hora${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  interval = seconds / 60;
  if (interval >= 1) {
    return `${Math.floor(interval)} minuto${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  return `${Math.floor(seconds)} segundo${Math.floor(seconds) > 1 ? 's' : ''}`;
};

const daysInMonth = (month: number, year: number): number => {
  if (month < 0 || month > 11) {
    throw new Error(`Invalid month (${month}), it should be between 0 and 11`);
  }
  if (month === 1) {
    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
      return 29;
    }
    return 28;
  }
  if ([3, 5, 8, 10].includes(month)) {
    return 30;
  }
  return 31;
};

const lastYearCorrespondingDate = (date: Date): Date => {
  const weekday = date.getDay();

  const lastYear = date.getFullYear() - 1;

  date.setHours(0, 0, 0, 0);
  const candidateDate = new Date(lastYear, date.getMonth(), date.getDate());
  while (candidateDate.getDay() !== weekday) {
    candidateDate.setDate(candidateDate.getDate() - 1);
  }
  return candidateDate;
};

const getLastMondayOfLastWeek = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToSubtract = ((dayOfWeek + 6) % 7) + 7;
  today.setDate(today.getDate() - daysToSubtract);
  return today;
};

const calculateDifferenceDays = (date1: Date, date2: Date): number => {
  const date1NoTime = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const date2NoTime = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  const millisecondsDifference = date2NoTime.getTime() - date1NoTime.getTime();

  const daysDifference = Math.floor(millisecondsDifference / (1000 * 60 * 60 * 24));

  return daysDifference;
};

const daysInMonthNotConsideringLeapYear = (month: number): number => {
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (month >= 1 && month <= 12) {
    return daysInMonths[month - 1];
  }
  throw new Error(`Invalid month (${month}), it should be between 0 and 11`);
};

const yearsFrom = (date: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const month = today.getMonth() - date.getMonth();
  const day = today.getDate() - date.getDate();
  if (month < 0 || (month === 0 && day < 0)) {
    age -= 1;
  }
  return age;
};

export default {
  daysInMonthNotConsideringLeapYear,
  daysInMonth,
  timeAgo,
  getDatesRange,
  daysBetween,
  datesOverlaps,
  lastYearCorrespondingDate,
  getLastMondayOfLastWeek,
  calculateDifferenceDays,
  yearsFrom,
};
