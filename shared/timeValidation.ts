export const BUSINESS_HOURS = {
  start: 7,
  end: 19,
  defaultDuration: 30
} as const;

export function isValidTimeFormat(time: string): boolean {
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return false;

  const [_, hourStr, minuteStr] = timeMatch;
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

export function isWithinBusinessHours(time: string, duration: number = BUSINESS_HOURS.defaultDuration): boolean {
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return false;

  const [_, hourStr, minuteStr] = timeMatch;
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);

  // Check if start time is within business hours
  if (hour < BUSINESS_HOURS.start || hour >= BUSINESS_HOURS.end) {
    return false;
  }

  // Check that appointment end time doesn't exceed business hours
  const startMinutes = hour * 60 + minute;
  const endMinutes = startMinutes + duration;
  const maxEndMinutes = BUSINESS_HOURS.end * 60;

  return endMinutes <= maxEndMinutes;
}

export function isPastTime(time: string, date: Date): boolean {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (!isToday) return false;

  const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return false;

  const [_, hourStr, minuteStr] = timeMatch;
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const selectedMinutes = hour * 60 + minute;

  return selectedMinutes <= currentMinutes;
}

export function calculateEndTime(startTime: string, duration: number = BUSINESS_HOURS.defaultDuration): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;

  const endHours = Math.floor(totalMinutes / 60) % 24; // Handle 24-hour rollover
  const endMinutes = totalMinutes % 60;

  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
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
  return start1 < end2 && end1 > start2;
}

export function createUTCDateTime(date: string, time: string, timezoneOffset: number): number {
  const appointmentDateTimeString = `${date}T${time}:00`;

  // Create date object treating the input as UTC to avoid local timezone issues
  const appointmentDateTime = new Date(appointmentDateTimeString + 'Z');

  // Convert from the user's timezone to UTC by adding the timezone offset
  // (offset is negative for timezones ahead of UTC, so adding it subtracts the hours)
  return appointmentDateTime.getTime() + (timezoneOffset * 60 * 1000);
}

export function isAppointmentInPast(date: string, time: string, timezoneOffset: number): boolean {
  const appointmentUTC = createUTCDateTime(date, time, timezoneOffset);
  const nowUTC = Date.now();

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