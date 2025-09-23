import type { Express } from "express";
import { createServer, type Server } from "http";
import compression from "compression";
import cors from "cors";
import { AppointmentController } from "./controllers/appointmentController";
import { validateRequest, validateQuery } from "./middleware/validation";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

const appointmentQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

const slotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Global middleware
  app.use(compression());
  app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? true : process.env.FRONTEND_URL,
    credentials: true
  }));
  
  // Apply rate limiting to all API routes
  app.use('/api', rateLimiter);

  // Health check endpoint
  app.get('/api/health', AppointmentController.healthCheck);

  // Appointment routes
  app.get('/api/appointments', 
    validateQuery(appointmentQuerySchema),
    AppointmentController.getAppointments
  );

  app.post('/api/appointments',
    validateRequest(insertAppointmentSchema),
    AppointmentController.createAppointment
  );

  app.delete('/api/appointments/:id',
    AppointmentController.cancelAppointment
  );

  app.get('/api/appointments/slots',
    validateQuery(slotsQuerySchema),
    AppointmentController.getAvailableSlots
  );

  app.get('/api/metrics',
    AppointmentController.getMetrics
  );

  // Error handling middleware (must be last)
  app.use(notFound);
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
