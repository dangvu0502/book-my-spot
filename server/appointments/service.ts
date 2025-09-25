import {
  type InsertAppointment,
  type CreateAppointmentResponse,
  type CancelAppointmentResponse,
  type GetAppointmentsByDateResponse
} from '@shared/schema';
import {
  BUSINESS_HOURS,
  checkAppointmentOverlap,
  isAppointmentInPast,
  isValidTimeFormat,
  isWithinBusinessHours
} from '@shared/timeValidation';
import { AppError } from '../middleware/errorHandler';
import { storage } from '../storage';

export class AppointmentService {
  private static readonly CANCELLATION_BUFFER_MINUTES = 30;

  static async createAppointment(appointmentData: InsertAppointment): Promise<CreateAppointmentResponse> {
    // Validate business rules
    await this.validateBusinessRules(appointmentData);

    // Atomically check and create appointment to prevent race conditions
    const appointment = await storage.createAppointmentIfAvailable(appointmentData);
    if (!appointment) {
      throw new AppError('This time slot is already booked', 409);
    }

    return {
      success: true,
      appointment
    };
  }

  static async cancelAppointment(id: string, reason?: string): Promise<CancelAppointmentResponse> {
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

  static async getAppointmentsByDate(date: string): Promise<GetAppointmentsByDateResponse> {
    const appointments = await storage.getAppointmentsByDate(date);

    return {
      appointments,
      businessHours: BUSINESS_HOURS
    };
  }



  private static async validateBusinessRules(appointmentData: InsertAppointment): Promise<void> {
    const { date, startTime, timezone } = appointmentData;

    // Validate basic time format and business hours
    if (!isValidTimeFormat(startTime) || !isWithinBusinessHours(startTime)) {
      const maxStartHour = BUSINESS_HOURS.end - 1;
      const maxStartMinute = 60 - BUSINESS_HOURS.defaultDuration;
      const maxStartTime = `${maxStartHour}:${maxStartMinute.toString().padStart(2, '0')}`;

      throw new AppError(
        `Invalid time. Appointments must start between ${BUSINESS_HOURS.start}:00 and ${maxStartTime} (last appointment ends at ${BUSINESS_HOURS.end}:00)`,
        400
      );
    }

    // Check if appointment is in the past
    if (isAppointmentInPast(date, startTime, timezone)) {
      throw new AppError('Cannot book appointments in the past', 400);
    }

    // Check for overlapping appointments
    const existingAppointments = await storage.getAppointmentsByDate(date);
    const hasOverlap = checkAppointmentOverlap(startTime, BUSINESS_HOURS.defaultDuration, existingAppointments || []);

    if (hasOverlap) {
      throw new AppError('This time slot overlaps with an existing appointment', 409);
    }
  }
}
