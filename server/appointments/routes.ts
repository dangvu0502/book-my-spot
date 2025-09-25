import { Router } from 'express';
import { AppointmentController } from './controller';
import { validateRequest, validateQuery } from '../middleware/validation';
import { insertAppointmentSchema, appointmentQuerySchema } from '@shared/schema';

const router = Router();

router.get('/appointments/health', AppointmentController.healthCheck);

router.get('/appointments',
  validateQuery(appointmentQuerySchema),
  AppointmentController.getAppointments
);

router.post('/appointments',
  validateRequest(insertAppointmentSchema),
  AppointmentController.createAppointment
);

router.delete('/appointments/:id',
  AppointmentController.cancelAppointment
);

export const appointmentRoutes = router;