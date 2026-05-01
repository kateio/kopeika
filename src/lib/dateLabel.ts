const DAY_MS = 86400000;

const WEEKDAYS = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

export function dayLabel(dateStr: string, now: Date = new Date()): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = today.getTime() - date.getTime();

  if (diff < DAY_MS && diff >= 0) return 'Сегодня';
  if (diff < 2 * DAY_MS && diff >= DAY_MS) return 'Вчера';

  const dayOfWeek = date.getDay();
  if (diff < 7 * DAY_MS && diff >= 0) return WEEKDAYS[dayOfWeek];

  const day = date.getDate();
  const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);
  return `${day} ${month}`;
}
