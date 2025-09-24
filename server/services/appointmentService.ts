import { storage } from '../storage';
import { AppError } from '../middleware/errorHandler';
import { type InsertAppointment, type TimeSlot, type AvailableSlotsResponse } from '@shared/schema';

export class AppointmentService {
  private static readonly BUSINESS_HOURS = {
    start: 7, // 7 AM
    end: 19,  // 7 PM
    slotDuration: 30 // 30 minutes
  };

  private static readonly MAX_BOOKINGS_PER_CUSTOMER = 3;
  private static readonly CANCELLATION_BUFFER_MINUTES = 30;

  static async createAppointment(appointmentData: InsertAppointment): Promise<any> {
    // Validate business rules
    await this.validateBusinessRules(appointmentData);

    // Check customer booking limit
    const customerBookings = await storage.getActiveAppointmentCountForEmail(appointmentData.customerEmail);
    if (customerBookings >= this.MAX_BOOKINGS_PER_CUSTOMER) {
      throw new AppError(`Maximum of ${this.MAX_BOOKINGS_PER_CUSTOMER} active bookings per customer`, 400);
    }

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

  static async getAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
    }

    // Check if date is in the past
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (targetDate < today) {
      throw new AppError('Cannot book appointments in the past', 400);
    }


    // Get existing appointments for the date
    const existingAppointments = await storage.getAppointmentsByDate(date);
    
    // Generate all possible time slots
    const slots: TimeSlot[] = [];
    const { start, end, slotDuration } = this.BUSINESS_HOURS;
    
    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const slotId = `${date}-${timeString}`;
        
        // Check if this slot is booked
        const existingAppointment = existingAppointments.find(apt => apt.startTime === timeString);
        
        if (existingAppointment) {
          slots.push({
            time: timeString,
            available: false,
            bookedBy: this.anonymizeCustomerName(existingAppointment.customerName),
            slotId,
            appointmentId: existingAppointment.id
          });
        } else {
          slots.push({
            time: timeString,
            available: true,
            slotId
          });
        }
      }
    }

    const availableSlots = slots.filter(slot => slot.available).length;

    return {
      date,
      slots,
      totalSlots: slots.length,
      availableSlots
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

  private static anonymizeCustomerName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase() + '.';
    }
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastInitial}.`;
  }
}
