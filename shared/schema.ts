import { sql } from "drizzle-orm";
import { text, integer } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  status: text("status", { enum: ["active", "cancelled"] }).default("active").notNull(),
  notes: text("notes"),
  cancelledAt: text("cancelled_at"), // ISO datetime string
  cancellationReason: text("cancellation_reason"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Helper function to sanitize HTML/script content
const sanitizeString = (str: string) => {
  // Remove any HTML tags and script content
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  customerName: true,
  customerEmail: true,
  date: true,
  startTime: true,
  notes: true,
}).extend({
  customerName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .transform(sanitizeString)
    .refine(val => val.length >= 2, "Name must be at least 2 characters after sanitization"),
  customerEmail: z.string()
    .email("Invalid email format")
    .transform(email => email.toLowerCase().trim()),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  notes: z.string()
    .max(500, "Notes must be under 500 characters")
    .transform(sanitizeString)
    .optional(),
  timezoneOffset: z.number(), // Client's timezone offset in minutes (required)
});

export const selectAppointmentSchema = createSelectSchema(appointments);

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Metrics type for dashboard
export type AppointmentMetrics = {
  todayAppointments: number;
  availableSlots: number;
  totalSlots: number;
  weeklyAppointments: number;
  cancellations: number;
  cancellationRate: number;
};

// Time slot type
export type TimeSlot = {
  time: string;
  available: boolean;
  bookedBy?: string;
  slotId: string;
  isUserBooking?: boolean;
  appointmentId?: string;
};

// Available slots response
export type AvailableSlotsResponse = {
  date: string;
  slots: TimeSlot[];
  totalSlots: number;
  availableSlots: number;
};
