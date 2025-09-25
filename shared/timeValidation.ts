import { DateTime, Interval } from 'luxon';

export const BUSINESS_HOURS = {
  start: 7,
  end: 19,
  defaultDuration: 30
} as const;

export function isValidTimeFormat(time: string): boolean {
  try {
    const dt = DateTime.fromFormat(time, 'H:mm'); // H allows single digit hours
    return dt.isValid && dt.hour >= 0 && dt.hour <= 23 && dt.minute >= 0 && dt.minute <= 59;
  } catch {
    return false;
  }
}

export function isWithinBusinessHours(time: string, duration: number = BUSINESS_HOURS.defaultDuration): boolean {
  try {
    const dt = DateTime.fromFormat(time, 'H:mm');
    if (!dt.isValid) return false;

    const { hour } = dt;

    // Check if start time is within business hours
    if (hour < BUSINESS_HOURS.start || hour >= BUSINESS_HOURS.end) {
      return false;
    }

    // Check that appointment end time doesn't exceed business hours using Luxon
    const endTime = dt.plus({ minutes: duration });

    return endTime.hour < BUSINESS_HOURS.end ||
           (endTime.hour === BUSINESS_HOURS.end && endTime.minute === 0);
  } catch {
    return false;
  }
}


export function calculateEndTime(startTime: string, duration: number = BUSINESS_HOURS.defaultDuration): string {
  const dt = DateTime.fromFormat(startTime, 'H:mm');
  if (!dt.isValid) throw new Error('Invalid time format');

  const endTime = dt.plus({ minutes: duration });
  return endTime.toFormat('HH:mm');
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function hasTimeOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  // Use Luxon Interval for overlap checking
  const today = DateTime.now().startOf('day');

  const interval1 = Interval.fromDateTimes(
    today.plus({ minutes: start1 }),
    today.plus({ minutes: end1 })
  );

  const interval2 = Interval.fromDateTimes(
    today.plus({ minutes: start2 }),
    today.plus({ minutes: end2 })
  );

  return interval1.overlaps(interval2);
}

export function createUTCDateTime(date: string, time: string, timezone: string): number {
  // Create DateTime in user's timezone
  const localDateTime = DateTime.fromISO(`${date}T${time}:00`, { zone: timezone });

  // Convert to UTC timestamp
  return localDateTime.toUTC().toMillis();
}

export function isAppointmentInPast(date: string, time: string, timezone: string): boolean {
  const appointmentUTC = createUTCDateTime(date, time, timezone);
  const nowUTC = DateTime.now().toUTC().toMillis();

  return appointmentUTC <= nowUTC;
}

export function checkAppointmentOverlap(
  newStartTime: string,
  newDuration: number,
  existingAppointments: Array<{
    startTime: string;
    endTime: string;
    status: string;
  }>
): boolean {
  const newStartMinutes = timeToMinutes(newStartTime);
  const newEndMinutes = newStartMinutes + newDuration;

  return existingAppointments?.some((apt) => {
    if (apt.status !== 'active') return false;

    const aptStartMinutes = timeToMinutes(apt.startTime);
    const aptEndMinutes = timeToMinutes(apt.endTime);

    return hasTimeOverlap(newStartMinutes, newEndMinutes, aptStartMinutes, aptEndMinutes);
  }) || false;
}

export function convertToUTCForStorage(date: string, time: string, timezone: string): {
  utcDate: string;
  utcTime: string;
} {
  const localDateTime = DateTime.fromISO(`${date}T${time}:00`, { zone: timezone });
  const utcDateTime = localDateTime.toUTC();

  return {
    utcDate: utcDateTime.toISODate()!, // YYYY-MM-DD
    utcTime: utcDateTime.toFormat('HH:mm'), // HH:mm
  };
}


export function convertFromUTCForDisplay(utcDate: string, utcTime: string, timezone: string): {
  localDate: string;
  localTime: string;
} {
  const utcDateTime = DateTime.fromISO(`${utcDate}T${utcTime}:00Z`);
  const localDateTime = utcDateTime.setZone(timezone);

  return {
    localDate: localDateTime.toISODate()!, // YYYY-MM-DD
    localTime: localDateTime.toFormat('HH:mm'), // HH:mm
  };
}

