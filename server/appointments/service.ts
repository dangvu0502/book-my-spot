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
    const slots = await this.getAvailableTimeSlots(date, appointments);

    return {
      appointments,
      slots,
      businessHours: TimeSlotManager.getBusinessHours()
    };
  }

  static async getAvailableTimeSlots(date: string, appointments?: any[]): Promise<TimeSlot[]> {
    const allSlots = TimeSlotManager.slots;
    const bookedAppointments = appointments || await storage.getAppointmentsByDate(date);

    const bookedAppointmentsMap = new Map(
      bookedAppointments
        .filter(apt => apt.status === 'active')
        .map(apt => [apt.startTime, apt])
    );

    return allSlots.map(time => {
      const booking = bookedAppointmentsMap.get(time);
      const slotData: TimeSlot = {
        time: time,
        available: !booking,
        slotId: `${date}-${time}`,
        bookedBy: booking?.customerName,
        appointmentId: booking?.id
      };

      return slotData;
    });
  }

  private static async validateBusinessRules(appointmentData: InsertAppointment): Promise<void> {
    const { date, startTime, timezoneOffset } = appointmentData;

    // Validate time slot against predefined slots
    TimeSlotManager.validateTimeSlot(startTime);

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
  }

  private static generateConfirmationCode(appointment: any): string {
    const dateStr = appointment.date.replace(/-/g, '');
    const timeStr = appointment.startTime.replace(':', '');
    return `APT-${dateStr}-${timeStr}`;
  }

}
