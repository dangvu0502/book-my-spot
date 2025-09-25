import type { Express } from "express";
import { createServer, type Server } from "http";
import compression from "compression";
import cors from "cors";
import { appointmentRoutes } from "./appointments"; 
import { errorHandler, notFound } from "./middleware/errorHandler";


export async function registerRoutes(app: Express): Promise<Server> {
  // Global middleware
  app.use(compression());
  app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? true : process.env.FRONTEND_URL,
    credentials: true
  }));
  
  // Mount appointment routes
  app.use('/api', appointmentRoutes);

  // Error handling middleware (must be last)
  // Only apply notFound to API routes to avoid interfering with client routing
  app.use('/api/*', notFound);
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
