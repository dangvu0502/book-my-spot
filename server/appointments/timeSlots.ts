import { AppError } from '../middleware/errorHandler';

export class TimeSlotManager {
  private static readonly BUSINESS_HOURS = {
    start: 7,
    end: 19,
    defaultDuration: 30
  };

  static isValidTime(time: string): boolean {
    // Validate time format HH:MM
    const timeMatch = time.match(/^(\d{2}):(\d{2})$/);
    if (!timeMatch) return false;

    const [_, hourStr, minuteStr] = timeMatch;
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    // Check if within valid hour and minute ranges
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return false;
    }

    // Check if within business hours
    if (hour < this.BUSINESS_HOURS.start || hour >= this.BUSINESS_HOURS.end) {
      return false;
    }

    // Check that appointment END time (start + 30 min) doesn't exceed business hours
    const startMinutes = hour * 60 + minute;
    const endMinutes = startMinutes + this.BUSINESS_HOURS.defaultDuration;
    const maxEndMinutes = this.BUSINESS_HOURS.end * 60; // 19:00 = 1140 minutes

    if (endMinutes > maxEndMinutes) {
      return false;
    }

    return true;
  }

  static validateTimeSlot(time: string): void {
    if (!this.isValidTime(time)) {
      const maxStartTime = `${this.BUSINESS_HOURS.end - 1}:${60 - this.BUSINESS_HOURS.defaultDuration}`;
      throw new AppError(
        `Invalid time. Appointments must start between ${this.BUSINESS_HOURS.start}:00 and ${maxStartTime} (last appointment ends at ${this.BUSINESS_HOURS.end}:00)`,
        400
      );
    }
  }

  static calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + this.BUSINESS_HOURS.defaultDuration;

    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  static getBusinessHours() {
    return { ...this.BUSINESS_HOURS };
  }
}