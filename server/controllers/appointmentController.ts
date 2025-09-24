import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointmentService';
import { insertAppointmentSchema } from '@shared/schema';
import { z } from 'zod';

const appointmentQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});


export class AppointmentController {
  static async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AppointmentService.createAppointment(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = appointmentQuerySchema.parse(req.query);
      const appointments = await AppointmentService.getAppointmentsByDate(date);

      res.json({
        success: true,
        date,
        appointments
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const result = await AppointmentService.cancelAppointment(id, reason);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }


  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      const metrics = await AppointmentService.getMetrics(date as string);
      
      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      next(error);
    }
  }

  static async healthCheck(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'Appointment service is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
}
