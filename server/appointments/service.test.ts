import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppointmentService } from './service';

// Mock the storage module
vi.mock('../storage', () => ({
  storage: {
    createAppointmentIfAvailable: vi.fn(),
    getAppointment: vi.fn(),
    cancelAppointment: vi.fn(),
    getAppointmentsByDate: vi.fn(),
    getMetrics: vi.fn(),
  }
}));

describe('AppointmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('validateBusinessRules - Timezone Handling', () => {
    it('should allow booking at midnight (00:30) for 7:00 AM same day', async () => {
      // Simulate user at 00:30 on Sept 25, 2025 in GMT+7
      // They want to book for 7:00 AM the same day
      const mockDate = new Date('2025-09-25T00:30:00+07:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const appointmentData = {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        date: '2025-09-25', // Sept 25 in local time
        startTime: '07:00',
        timezoneOffset: -420, // GMT+7 (420 minutes ahead of UTC)
        notes: undefined
      };

      // This should NOT throw an error
      const validateMethod = AppointmentService['validateBusinessRules'];
      await expect(validateMethod.call(AppointmentService, appointmentData)).resolves.not.toThrow();
    });

    it('should reject booking appointments in the past', async () => {
      // Simulate user at 15:00 on Sept 25, 2025 in GMT+7
      // They try to book for 14:00 PM the same day (1 hour ago)
      const mockDate = new Date('2025-09-25T15:00:00+07:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const appointmentData = {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        date: '2025-09-25',
        startTime: '07:00', // 7 AM has already passed (it's 3 PM now)
        timezoneOffset: -420, // GMT+7
        notes: undefined
      };

      // This SHOULD throw an error since 7:00 AM has already passed (it's 3 PM now)
      const validateMethod = AppointmentService['validateBusinessRules'];
      await expect(validateMethod.call(AppointmentService, appointmentData))
        .rejects
        .toThrow('Cannot book appointments in the past')
    });

    it('should handle timezone boundaries correctly', async () => {
      // User in GMT+7 at 23:00 on Sept 24 books for Sept 25 morning
      const mockDate = new Date('2025-09-24T23:00:00+07:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const appointmentData = {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        date: '2025-09-25',
        startTime: '07:00',
        timezoneOffset: -420, // GMT+7
        notes: undefined
      };

      // Should allow booking for tomorrow
      const validateMethod = AppointmentService['validateBusinessRules'];
      await expect(validateMethod.call(AppointmentService, appointmentData)).resolves.not.toThrow();
    });

    it('should reject appointments outside business hours', async () => {
      const mockDate = new Date('2025-09-25T10:00:00+07:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const appointmentData = {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        date: '2025-09-25',
        startTime: '20:00', // 8 PM - outside business hours
        timezoneOffset: -420,
        notes: undefined
      };

      const validateMethod = AppointmentService['validateBusinessRules'];
      await expect(validateMethod.call(AppointmentService, appointmentData))
        .rejects
        .toThrow('Appointments are only available between 7:00 AM and 19:00 PM');
    });

    it('should handle different timezones correctly', async () => {
      // User in GMT+3 at 10 AM booking for 2 PM same day
      const mockDate = new Date('2025-09-25T10:00:00+03:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const appointmentData = {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        date: '2025-09-25',
        startTime: '14:00', // 2 PM in GMT+3
        timezoneOffset: -180, // GMT+3 (180 minutes ahead of UTC)
        notes: undefined
      };

      // This should NOT throw - appointment is 4 hours in the future
      const validateMethod = AppointmentService['validateBusinessRules'];
      await expect(validateMethod.call(AppointmentService, appointmentData)).resolves.not.toThrow();
    });

    it('should validate 30-minute intervals', async () => {
      const mockDate = new Date('2025-09-25T06:00:00+07:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const appointmentData = {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        date: '2025-09-25',
        startTime: '07:15', // Invalid - not on 30-minute interval
        timezoneOffset: -420,
        notes: undefined
      };

      const validateMethod = AppointmentService['validateBusinessRules'];
      await expect(validateMethod.call(AppointmentService, appointmentData))
        .rejects
        .toThrow('Appointments must be booked in 30-minute intervals');
    });

    it('should correctly calculate UTC time from local time and offset', async () => {
      const mockDate = new Date('2025-09-25T00:00:00Z'); // Midnight UTC
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      // User in GMT+7 (where it's already 7 AM on Sept 25)
      // Books for 8 AM their time
      const appointmentData = {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        date: '2025-09-25',
        startTime: '08:00',
        timezoneOffset: -420, // GMT+7
        notes: undefined
      };

      // 8 AM in GMT+7 is 1 AM UTC on Sept 25
      // Current time is midnight UTC, so this is 1 hour in the future
      const validateMethod = AppointmentService['validateBusinessRules'];
      await expect(validateMethod.call(AppointmentService, appointmentData)).resolves.not.toThrow();
    });

    it('CRITICAL: User at midnight should be able to book morning appointments', async () => {
      // This is the exact bug the user reported - at 00:00 on Sept 25,
      // they should be able to book for 7:00 AM the same day
      const midnightGMT7 = new Date('2025-09-25T00:00:00+07:00');
      vi.useFakeTimers();
      vi.setSystemTime(midnightGMT7);

      const appointmentData = {
        customerName: 'Midnight User',
        customerEmail: 'midnight@example.com',
        date: '2025-09-25',
        startTime: '07:00',
        timezoneOffset: -420, // GMT+7
        notes: 'Critical test - user reported bug'
      };

      // This MUST NOT throw an error
      const validateMethod = AppointmentService['validateBusinessRules'];
      await expect(validateMethod.call(AppointmentService, appointmentData)).resolves.not.toThrow();
    });
  });

  describe('generateConfirmationCode', () => {
    it('should generate correct confirmation code format', () => {
      const appointment = {
        date: '2025-09-25',
        startTime: '07:30'
      };

      const generateMethod = AppointmentService['generateConfirmationCode'];
      const code = generateMethod.call(AppointmentService, appointment);

      expect(code).toBe('APT-20250925-0730');
    });
  });
});