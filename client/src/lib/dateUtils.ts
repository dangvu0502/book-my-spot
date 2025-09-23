import { format, addDays, startOfWeek, endOfWeek, isSameDay, isWeekend, isBefore, isToday } from 'date-fns';

export const formatDate = (date: Date, formatStr: string = 'yyyy-MM-dd'): string => {
  return format(date, formatStr);
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'MMMM d, yyyy');
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const generateCalendarDays = (currentDate: Date): Date[] => {
  const start = startOfWeek(currentDate);
  const days: Date[] = [];
  
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    days.push(addDays(start, i));
  }
  
  return days;
};

export const isDateSelectable = (date: Date): boolean => {
  return !isBefore(date, new Date()) && !isWeekend(date);
};

export const isCurrentTimeSlot = (date: Date, timeSlot: string): boolean => {
  if (!isToday(date)) return false;
  
  const now = new Date();
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  
  // Consider it current if within 30 minutes
  const timeDiff = Math.abs(now.getTime() - slotTime.getTime());
  return timeDiff <= 30 * 60 * 1000; // 30 minutes in milliseconds
};

export const getTimeSlotStatus = (
  date: Date,
  timeSlot: string,
  isBooked: boolean,
  bookedByCurrentUser?: boolean
): 'available' | 'booked' | 'user-booking' | 'past' => {
  const now = new Date();
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const slotDateTime = new Date(date);
  slotDateTime.setHours(hours, minutes, 0, 0);
  
  if (isBefore(slotDateTime, now)) {
    return 'past';
  }
  
  if (isBooked) {
    return bookedByCurrentUser ? 'user-booking' : 'booked';
  }
  
  return 'available';
};
