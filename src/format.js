// Small helpers to show dates and times nicely (NZ style)

export function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-NZ', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}${suffix}`;
}

export function todayISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function addDaysISO(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export const STATUS_VARIANT = {
  booked: 'success',
  cancelled: 'secondary',
  completed: 'primary',
};
