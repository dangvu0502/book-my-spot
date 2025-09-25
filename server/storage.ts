import { type Appointment, type InsertAppointment } from "@shared/schema";
import { calculateEndTime, convertToUTCForStorage, BUSINESS_HOURS } from "@shared/timeValidation";
import { randomUUID } from "crypto";

export class Storage {
  private appointments: Map<string, Appointment>;

  constructor() {
    this.appointments = new Map();
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      apt => apt.date === date && apt.status === "active"
    );
  }

  async cancelAppointment(id: string, reason?: string): Promise<boolean> {
    const appointment = this.appointments.get(id);
    if (!appointment) return false;

    const updatedAppointment: Appointment = {
      ...appointment,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason || "Customer cancellation",
      updatedAt: new Date().toISOString(),
    };

    this.appointments.set(id, updatedAppointment);
    return true;
  }

  async createAppointmentIfAvailable(insertAppointment: InsertAppointment): Promise<Appointment | null> {
    // Convert local time to UTC for storage
    const { utcDate, utcTime } = convertToUTCForStorage(
      insertAppointment.date,
      insertAppointment.startTime,
      insertAppointment.timezone
    );
    const utcEndTime = calculateEndTime(utcTime, BUSINESS_HOURS.defaultDuration);

    // Check if slot is available using UTC date
    const existingAppointments = await this.getAppointmentsByDate(utcDate);
    const isAvailable = !existingAppointments.some(apt => apt.startTime === utcTime);

    if (!isAvailable) {
      return null;
    }

    // Create the appointment with UTC times
    const id = randomUUID();
    const now = new Date().toISOString();

    const appointment: Appointment = {
      id,
      customerName: insertAppointment.customerName,
      customerEmail: insertAppointment.customerEmail,
      date: utcDate,
      startTime: utcTime,
      endTime: utcEndTime,
      status: "active",
      notes: insertAppointment.notes || null,
      cancelledAt: null,
      cancellationReason: null,
      createdAt: now,
      updatedAt: now,
    };

    this.appointments.set(id, appointment);
    return appointment;
  }
}

export const storage = new Storage();