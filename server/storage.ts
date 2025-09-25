import { type Appointment, type InsertAppointment, type AppointmentMetrics } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Appointment CRUD operations
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]>;
  getAppointmentsByEmail(email: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  cancelAppointment(id: string, reason?: string): Promise<boolean>;
  deleteOldAppointments(daysOld: number): Promise<number>;

  // Validation helpers
  isSlotAvailable(date: string, startTime: string): Promise<boolean>;
  getActiveAppointmentCountForEmail(email: string): Promise<number>;

  // Atomic operations to prevent race conditions
  createAppointmentIfAvailable(appointment: InsertAppointment): Promise<Appointment | null>;
}

export class MemStorage implements IStorage {
  private appointments: Map<string, Appointment>;
  private slotLocks: Map<string, boolean>; // For preventing race conditions

  constructor() {
    this.appointments = new Map();
    this.slotLocks = new Map();
    // this.seedData();
  }

  private seedData() {
    // Add some sample appointments for demonstration
    const today = new Date().toISOString().split('T')[0];
    const sampleAppointments: Appointment[] = [
      {
        id: "1",
        customerName: "Sarah Mitchell",
        customerEmail: "sarah.m@email.com",
        date: today,
        startTime: "08:00",
        endTime: "08:30",
        status: "active",
        notes: null,
        cancelledAt: null,
        cancellationReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        customerName: "Mike Rodriguez",
        customerEmail: "mike.r@email.com",
        date: today,
        startTime: "09:30",
        endTime: "10:00",
        status: "active",
        notes: "First consultation",
        cancelledAt: null,
        cancellationReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    sampleAppointments.forEach(apt => {
      this.appointments.set(apt.id, apt);
    });
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      apt => apt.date === date && apt.status === "active"
    );
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      apt => apt.date >= startDate && apt.date <= endDate && apt.status === "active"
    );
  }

  async getAppointmentsByEmail(email: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      apt => apt.customerEmail === email && apt.status === "active"
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const now = new Date().toISOString();

    // Calculate end time (30 minutes after start)
    const [hours, minutes] = insertAppointment.startTime.split(':').map(Number);
    const endMinutes = minutes + 30;
    const endHours = hours + Math.floor(endMinutes / 60);
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

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

  async deleteOldAppointments(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffString = cutoffDate.toISOString();

    let deletedCount = 0;
    const toDelete: string[] = [];
    
    this.appointments.forEach((appointment, id) => {
      if (appointment.createdAt < cutoffString) {
        toDelete.push(id);
      }
    });
    
    toDelete.forEach(id => {
      this.appointments.delete(id);
      deletedCount++;
    });
    return deletedCount;
  }

  async isSlotAvailable(date: string, startTime: string): Promise<boolean> {
    const existingAppointments = await this.getAppointmentsByDate(date);
    return !existingAppointments.some(apt => apt.startTime === startTime);
  }

  async getActiveAppointmentCountForEmail(email: string): Promise<number> {
    const appointments = await this.getAppointmentsByEmail(email);
    return appointments.length;
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
      const isAvailable = await this.isSlotAvailable(insertAppointment.date, insertAppointment.startTime);
      if (!isAvailable) {
        return null;
      }

      // Create the appointment
      const appointment = await this.createAppointment(insertAppointment);
      return appointment;
    } finally {
      // Always release the lock
      this.slotLocks.delete(slotKey);
    }
  }
}

export const storage = new MemStorage();
