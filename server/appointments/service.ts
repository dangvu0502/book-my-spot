import { storage } from '../storage';
import { AppError } from '../middleware/errorHandler';
import { type InsertAppointment, type TimeSlot } from '@shared/schema';
import { TimeSlotManager } from './timeSlots';

export class AppointmentService {
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
    const appointments = await storage.getAppointmentsByDate(date);

    return {
      appointments,
      businessHours: TimeSlotManager.getBusinessHours()
    };
  }



  private static async validateBusinessRules(appointmentData: InsertAppointment): Promise<void> {
    const { date, startTime, timezoneOffset } = appointmentData;

    // Validate basic time format and business hours
    TimeSlotManager.validateTimeSlot(startTime);

    // Create a date string with the time
    const appointmentDateTimeString = `${date}T${startTime}:00`;
    const appointmentDateTime = new Date(appointmentDateTimeString);

    // Convert to UTC
    const appointmentUTC = appointmentDateTime.getTime() - (timezoneOffset * 60 * 1000);
    const nowUTC = Date.now();

    // Check if appointment is in the past
    if (appointmentUTC <= nowUTC) {
      throw new AppError('Cannot book appointments in the past', 400);
    }

    // Check for overlapping appointments
    const existingAppointments = await storage.getAppointmentsByDate(date);
    const newStartMinutes = this.timeToMinutes(startTime);
    const newEndMinutes = newStartMinutes + 30; // Fixed 30-minute duration

    const hasOverlap = existingAppointments.some((apt: any) => {
      if (apt.status !== 'active') return false;

      const existingStartMinutes = this.timeToMinutes(apt.startTime);
      const existingEndMinutes = this.timeToMinutes(apt.endTime);

      // Check if new appointment overlaps with existing one
      return (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes);
    });

    if (hasOverlap) {
      throw new AppError('This time slot overlaps with an existing appointment', 409);
    }
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static generateConfirmationCode(appointment: any): string {
    const dateStr = appointment.date.replace(/-/g, '');
    const timeStr = appointment.startTime.replace(':', '');
    return `APT-${dateStr}-${timeStr}`;
  }

}
