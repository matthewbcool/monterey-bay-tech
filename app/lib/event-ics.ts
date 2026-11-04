/**
 * Builds an RFC 5545 (iCalendar) payload for a Discord scheduled event so the
 * calendar page can offer a real "Add to calendar" download instead of a
 * button that does nothing.
 */

export interface CalendarExportEvent {
  id: string;
  name: string;
  description?: string;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  entity_metadata?: {
    location?: string;
  };
}

const DEFAULT_DURATION_MS = 60 * 60 * 1000;

/** Escape text per RFC 5545 section 3.3.11. */
const escapeText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/** Fold content lines at 75 octets per RFC 5545 section 3.1. */
const foldLine = (line: string): string => {
  if (line.length <= 75) return line;

  const chunks: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);

  while (rest.length > 0) {
    chunks.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }

  return chunks.join('\r\n');
};

/** UTC timestamp in the compact form iCalendar expects: 20261105T200000Z */
const formatIcsDate = (date: Date): string =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'event';

/**
 * Returns the calendar file contents, or null when the event has no usable
 * start time (nothing sensible can be exported in that case).
 */
export const buildEventIcs = (event: CalendarExportEvent): string | null => {
  const start = parseDate(event.scheduled_start_time);
  if (!start) return null;

  const end =
    parseDate(event.scheduled_end_time) ??
    new Date(start.getTime() + DEFAULT_DURATION_MS);

  const location = event.entity_metadata?.location?.trim();
  const isUrlLocation = location ? /^https?:\/\//i.test(location) : false;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Monterey Bay Tech//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@montereybaytech.org`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeText(event.name)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }
  if (location) {
    lines.push(`LOCATION:${escapeText(location)}`);
  }
  if (isUrlLocation && location) {
    lines.push(`URL:${location}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.map(foldLine).join('\r\n') + '\r\n';
};

/**
 * Triggers a client-side download of the event as a .ics file.
 * Returns false when the event could not be converted.
 */
export const downloadEventIcs = (event: CalendarExportEvent): boolean => {
  const ics = buildEventIcs(event);
  if (!ics || typeof window === 'undefined') return false;

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${slugify(event.name)}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Give the browser a beat to start the download before revoking the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);

  return true;
};
