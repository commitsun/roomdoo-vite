export const formatDateToTimezone = (date: Date, timezone?: string): string => {
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error('Invalid date');
  }

  return `${year}-${month}-${day}`;
};
