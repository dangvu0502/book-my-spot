import { Router } from 'express';
import { AppointmentController } from './controller';
import { validateRequest, validateQuery } from '../middleware/validation';
import { insertAppointmentSchema, appointmentQuerySchema } from '@shared/schema';

const router = Router();

router.get('/appointments/health', AppointmentController.healthCheck);

// Get appointments and available slots for a date
router.get('/appointments',
  validateQuery(appointmentQuerySchema),
  AppointmentController.getAppointments
);

// Create a new appointment
router.post('/appointments',
  validateRequest(insertAppointmentSchema),
  AppointmentController.createAppointment
);

router.delete('/appointments/:id',
  AppointmentController.cancelAppointment
);

export const appointmentRoutes = router;