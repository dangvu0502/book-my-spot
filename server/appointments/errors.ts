export class AppointmentError extends Error {
  public statusCode: number;
  public userMessage: string;

  constructor(message: string, statusCode: number = 400, userMessage?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.userMessage = userMessage || message;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AppointmentNotFoundError extends AppointmentError {
  constructor(id: string) {
    super(
      `Appointment with ID ${id} not found`,
      404,
      'Appointment not found'
    );
  }
}

export class AppointmentSlotUnavailableError extends AppointmentError {
  constructor() {
    super(
      'Appointment slot is no longer available',
      409,
      'This time slot is no longer available. Please select a different time.'
    );
  }
}

export class AppointmentCancellationError extends AppointmentError {
  constructor(reason: string) {
    super(
      `Cannot cancel appointment: ${reason}`,
      400,
      reason
    );
  }
}

export class AppointmentValidationError extends AppointmentError {
  constructor(reason: string) {
    super(
      `Appointment validation failed: ${reason}`,
      400,
      reason
    );
  }
}

export class AppointmentBusinessRuleError extends AppointmentError {
  constructor(reason: string) {
    super(
      `Business rule violation: ${reason}`,
      400,
      reason
    );
  }
}