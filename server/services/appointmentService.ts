import { storage } from '../storage';
import { AppError } from '../middleware/errorHandler';
import { type InsertAppointment } from '@shared/schema';

export class AppointmentService {
  private static readonly BUSINESS_HOURS = {
    start: 7, // 7 AM
    end: 19,  // 7 PM
    slotDuration: 30 // 30 minutes
  };

  // private static readonly MAX_BOOKINGS_PER_CUSTOMER = 3;
  private static readonly CANCELLATION_BUFFER_MINUTES = 30;

  static async createAppointment(appointmentData: InsertAppointment): Promise<any> {
    // Validate business rules
    await this.validateBusinessRules(appointmentData);

    // Atomically check and create appointment to prevent race conditions
    const appointment = await storage.createAppointmentIfAvailable(appointmentData);
    if (!appointment) {
      throw new AppError('This time slot is already booked', 409);
    }

    // Generate confirmation code
    const confirmationCode = this.generateConfirmationCode(appointment);

    return {
      success: true,
      appointment: {
        ...appointment,
        confirmationCode
      }
    };
  }

  static async cancelAppointment(id: string, reason?: string): Promise<any> {
    const appointment = await storage.getAppointment(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (appointment.status === 'cancelled') {
      throw new AppError('Appointment is already cancelled', 400);
    }

    // Check cancellation buffer
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}:00`);
    const now = new Date();
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff < this.CANCELLATION_BUFFER_MINUTES) {
      throw new AppError(`Appointments can only be cancelled at least ${this.CANCELLATION_BUFFER_MINUTES} minutes in advance`, 400);
    }

    const success = await storage.cancelAppointment(id, reason);
    if (!success) {
      throw new AppError('Failed to cancel appointment', 500);
    }

    return {
      success: true,
      message: 'Appointment cancelled successfully'
    };
  }

  static async getAppointmentsByDate(date: string) {
    return await storage.getAppointmentsByDate(date);
  }

  static async getMetrics(date?: string) {
    return await storage.getMetrics(date);
  }

  private static async validateBusinessRules(appointmentData: InsertAppointment): Promise<void> {
    const { date, startTime, timezoneOffset } = appointmentData;

    // Parse hours and minutes for business hours validation
    const [hours, minutes] = startTime.split(':').map(Number);

    // Create a date string with the time
    // JavaScript will interpret this as UTC if no timezone is specified
    const appointmentDateTimeString = `${date}T${startTime}:00`;

    // Parse this as a UTC date/time (JS default behavior)
    const appointmentDateTime = new Date(appointmentDateTimeString);

    // The user selected this time in their local timezone, but JS parsed it as UTC
    // We need to convert from the user's local time to UTC
    // timezoneOffset is the number of minutes to subtract from local time to get UTC
    // For GMT+7: offset is -420 (negative because it's ahead of UTC)
    // User's 7:00 AM in GMT+7 = UTC 00:00 (subtract 7 hours)
    // So we subtract the offset: time - (-420) = time + 420
    const appointmentUTC = appointmentDateTime.getTime() - (timezoneOffset * 60 * 1000);

    // Get current time in UTC
    const nowUTC = Date.now();

    // Check if appointment is in the past (compare UTC times)
    if (appointmentUTC <= nowUTC) {
      throw new AppError('Cannot book appointments in the past', 400);
    }


    // Validate business hours
    const { start, end } = this.BUSINESS_HOURS;

    if (hours < start || hours >= end || (hours === end - 1 && minutes > 30)) {
      throw new AppError(`Appointments are only available between ${start}:00 AM and ${end}:00 PM`, 400);
    }

    // Validate time slot format (must be 30-minute intervals)
    if (minutes !== 0 && minutes !== 30) {
      throw new AppError('Appointments must be booked in 30-minute intervals', 400);
    }
  }

  private static generateConfirmationCode(appointment: any): string {
    const dateStr = appointment.date.replace(/-/g, '');
    const timeStr = appointment.startTime.replace(':', '');
    return `APT-${dateStr}-${timeStr}`;
  }

}
