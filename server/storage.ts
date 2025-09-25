import { type Appointment, type InsertAppointment } from "@shared/schema";
import { calculateEndTime, BUSINESS_HOURS } from "@shared/timeValidation";
import { randomUUID } from "crypto";

export class Storage {
  private appointments: Map<string, Appointment>;
  private slotLocks: Map<string, boolean>;

  constructor() {
    this.appointments = new Map();
    this.slotLocks = new Map();
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
    const slotKey = `${insertAppointment.date}-${insertAppointment.startTime}`;

    // Check if slot is being processed (locked)
    if (this.slotLocks.get(slotKey)) {
      return null;
    }

    // Lock the slot
    this.slotLocks.set(slotKey, true);

    try {
      // Check if slot is available
      const existingAppointments = await this.getAppointmentsByDate(insertAppointment.date);
      const isAvailable = !existingAppointments.some(apt => apt.startTime === insertAppointment.startTime);

      if (!isAvailable) {
        return null;
      }

      // Create the appointment
      const id = randomUUID();
      const now = new Date().toISOString();
      const endTime = calculateEndTime(insertAppointment.startTime, BUSINESS_HOURS.defaultDuration);

      const appointment: Appointment = {
        ...insertAppointment,
        id,
        endTime,
        status: "active",
        cancelledAt: null,
        cancellationReason: null,
        createdAt: now,
        updatedAt: now,
        notes: insertAppointment.notes || null,
      };

      this.appointments.set(id, appointment);
      return appointment;
    } finally {
      // Always release the lock
      this.slotLocks.delete(slotKey);
    }
  }
}

export const storage = new Storage();