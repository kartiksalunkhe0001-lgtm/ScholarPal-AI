/**
 * Calendar utilities: Google Calendar URL builder and downloadable .ics calendar generator
 */

export function buildGoogleCalendarUrl(params: {
  title: string;
  description: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}): string {
  const cleanDate = params.startDate.replace(/-/g, '');
  const end = params.endDate ? params.endDate.replace(/-/g, '') : cleanDate;
  // All day event format: YYYYMMDD/YYYYMMDD (exclusive end, so next day if same day)
  const nextDay = getNextDayStr(params.endDate || params.startDate).replace(/-/g, '');

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', params.title);
  url.searchParams.set('details', params.description);
  if (params.location) {
    url.searchParams.set('location', params.location);
  }
  url.searchParams.set('dates', `${cleanDate}/${nextDay}`);
  return url.toString();
}

function getNextDayStr(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

/**
 * Generates an RFC 5545 compliant iCalendar (.ics) string with two VALARM reminders:
 * 1. 9:00 AM on the day before (TRIGGER:-P1DT15H)
 * 2. 9:00 AM on the event day
 */
export function generateIcsFile(params: {
  title: string;
  description: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  url?: string;
}): string {
  const cleanDate = params.startDate.replace(/-/g, '');
  const nextDay = getNextDayStr(params.startDate).replace(/-/g, '');
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0] + 'Z';
  const uid = `scholarpal_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@scholarpal.ai`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ScholarPal AI//Scholarship Calendar Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${cleanDate}`,
    `DTEND;VALUE=DATE:${nextDay}`,
    `SUMMARY:${escapeIcs(params.title)}`,
    `DESCRIPTION:${escapeIcs(params.description)}`,
    params.location ? `LOCATION:${escapeIcs(params.location)}` : '',
    params.url ? `URL:${params.url}` : '',
    'STATUS:CONFIRMED',
    // Alarm 1: 1 day before at 9:00 AM (relative trigger 15 hours before start of date)
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeIcs(params.title)} is tomorrow!`,
    'END:VALARM',
    // Alarm 2: Morning of the event
    'BEGIN:VALARM',
    'TRIGGER:PT9H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Scholarship deadline today: ${escapeIcs(params.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

function escapeIcs(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function downloadIcs(filename: string, icsContent: string) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
