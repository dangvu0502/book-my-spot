import { AppError } from '../middleware/errorHandler';

export class TimeSlotManager {
  private static readonly BUSINESS_HOURS = {
    start: 7,
    end: 19,
    slotDuration: 30
  };

  private static _slots: string[] | null = null;

  static get slots(): string[] {
    if (!this._slots) {
      this._slots = this.generateDailyTimeSlots();
    }
    return this._slots;
  }

  private static generateDailyTimeSlots(): string[] {
    const slots: string[] = [];
    const { start, end, slotDuration } = this.BUSINESS_HOURS;

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        if (hour === end - 1 && minute > 30) {
          break;
        }

        slots.push(time);
      }
    }

    return slots;
  }

  static isValidTimeSlot(time: string): boolean {
    return this.slots.includes(time);
  }

  static validateTimeSlot(time: string): void {
    if (!this.isValidTimeSlot(time)) {
      throw new AppError(`Invalid time slot: ${time}`, 400);
    }
  }

  static calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + this.BUSINESS_HOURS.slotDuration;

    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  static getBusinessHours() {
    return { ...this.BUSINESS_HOURS };
  }
}