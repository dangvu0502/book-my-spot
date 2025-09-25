import { z } from "zod";

// Common validation schemas
export const appointmentQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

// Base Appointment schema with all fields
export const appointmentSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
  endTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format - calculated from startTime
  status: z.enum(["active", "cancelled"]),
  notes: z.string().nullable(),
  cancelledAt: z.string().nullable(), // ISO datetime string
  cancellationReason: z.string().nullable(),
  createdAt: z.string(), // ISO datetime string
  updatedAt: z.string(), // ISO datetime string
});

export type Appointment = z.infer<typeof appointmentSchema>;

// Schema for inserting appointments (picks required fields + adds validation and timezoneOffset)
export const insertAppointmentSchema = appointmentSchema.pick({
  customerName: true,
  customerEmail: true,
  date: true,
  startTime: true,
}).extend({
  customerName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .transform(sanitizeString)
    .refine(val => val.length >= 2, "Name must be at least 2 characters after sanitization"),
  customerEmail: z.string()
    .email("Invalid email format")
    .transform(email => email.toLowerCase().trim()),
  notes: z.string()
    .max(500, "Notes must be under 500 characters")
    .transform(sanitizeString)
    .optional(),
  timezoneOffset: z.number(), // Client's timezone offset in minutes (required for creation)
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Time slot type
export type TimeSlot = {
  time: string;
  available: boolean;
  bookedBy?: string;
  slotId: string;
  isUserBooking?: boolean;
  appointmentId?: string;
};


// API Response schemas
export const createAppointmentResponseSchema = z.object({
  success: z.literal(true),
  appointment: appointmentSchema.extend({
    confirmationCode: z.string(),
  }),
});

export const cancelAppointmentResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export const getAppointmentsByDateResponseSchema = z.object({
  appointments: z.array(appointmentSchema),
  businessHours: z.object({
    start: z.number(),
    end: z.number(),
    defaultDuration: z.number(),
  }),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  statusCode: z.number(),
});

// API Response types
export type CreateAppointmentResponse = z.infer<typeof createAppointmentResponseSchema>;
export type CancelAppointmentResponse = z.infer<typeof cancelAppointmentResponseSchema>;
export type GetAppointmentsByDateResponse = z.infer<typeof getAppointmentsByDateResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Helper function to sanitize HTML/script content
function sanitizeString(str: string) {
  // Remove any HTML tags and script content
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};