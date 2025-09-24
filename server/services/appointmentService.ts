import { storage } from '../storage';
import { AppError } from '../middleware/errorHandler';
import { type InsertAppointment, type TimeSlot, type AvailableSlotsResponse } from '@shared/schema';

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
    const { date, startTime } = appointmentData;

    // Check if date is in the past
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      throw new AppError('Cannot book appointments in the past', 400);
    }


    // Validate business hours
    const [hours, minutes] = startTime.split(':').map(Number);
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
