import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BUSINESS_HOURS,
  isValidTimeFormat,
  isWithinBusinessHours,
  calculateEndTime,
  timeToMinutes,
  minutesToTime,
  hasTimeOverlap,
  createUTCDateTime,
  isAppointmentInPast,
  checkAppointmentOverlap
} from './timeValidation';

describe('timeValidation', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  describe('BUSINESS_HOURS', () => {
    it('should have correct business hours configuration', () => {
      expect(BUSINESS_HOURS.start).toBe(7);
      expect(BUSINESS_HOURS.end).toBe(19);
      expect(BUSINESS_HOURS.defaultDuration).toBe(30);
    });
  });

  describe('isValidTimeFormat', () => {
    it('should accept valid time formats', () => {
      expect(isValidTimeFormat('09:00')).toBe(true);
      expect(isValidTimeFormat('9:00')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
      expect(isValidTimeFormat('00:00')).toBe(true);
      expect(isValidTimeFormat('12:30')).toBe(true);
      expect(isValidTimeFormat('1:05')).toBe(true);
    });

    it('should reject invalid time formats', () => {
      expect(isValidTimeFormat('25:00')).toBe(false); // Invalid hour
      expect(isValidTimeFormat('12:60')).toBe(false); // Invalid minute
      expect(isValidTimeFormat('abc')).toBe(false); // Not a time
      expect(isValidTimeFormat('12')).toBe(false); // Missing minutes
      expect(isValidTimeFormat('12:5')).toBe(false); // Single digit minute
      expect(isValidTimeFormat('')).toBe(false); // Empty string
    });

    it('should handle edge cases', () => {
      expect(isValidTimeFormat('0:00')).toBe(true);
      expect(isValidTimeFormat('23:00')).toBe(true);
      expect(isValidTimeFormat('12:59')).toBe(true);
    });
  });

  describe('isWithinBusinessHours', () => {
    it('should accept times within business hours', () => {
      expect(isWithinBusinessHours('07:00')).toBe(true); // Start of business hours
      expect(isWithinBusinessHours('12:00')).toBe(true); // Middle of day
      expect(isWithinBusinessHours('18:30')).toBe(true); // Last valid start (ends at 19:00)
    });

    it('should reject times outside business hours', () => {
      expect(isWithinBusinessHours('06:59')).toBe(false); // Before business hours
      expect(isWithinBusinessHours('19:00')).toBe(false); // At closing time
      expect(isWithinBusinessHours('20:00')).toBe(false); // After business hours
    });

    it('should handle custom durations', () => {
      // 60-minute appointment
      expect(isWithinBusinessHours('18:00', 60)).toBe(true); // Ends at 19:00
      expect(isWithinBusinessHours('18:01', 60)).toBe(false); // Would end at 19:01

      // 15-minute appointment
      expect(isWithinBusinessHours('18:45', 15)).toBe(true); // Ends at 19:00
      expect(isWithinBusinessHours('18:46', 15)).toBe(false); // Would end at 19:01
    });

    it('should handle invalid time format', () => {
      expect(isWithinBusinessHours('invalid')).toBe(false);
      expect(isWithinBusinessHours('25:00')).toBe(false);
    });
  });


  describe('calculateEndTime', () => {
    it('should calculate end time with default duration', () => {
      expect(calculateEndTime('09:00')).toBe('09:30');
      expect(calculateEndTime('14:30')).toBe('15:00');
      expect(calculateEndTime('18:45')).toBe('19:15');
    });

    it('should calculate end time with custom duration', () => {
      expect(calculateEndTime('09:00', 60)).toBe('10:00');
      expect(calculateEndTime('14:15', 45)).toBe('15:00');
      expect(calculateEndTime('18:30', 15)).toBe('18:45');
    });

    it('should handle hour rollover', () => {
      expect(calculateEndTime('09:45')).toBe('10:15');
      expect(calculateEndTime('23:45')).toBe('00:15');
      expect(calculateEndTime('23:30', 60)).toBe('00:30');
    });

    it('should pad single digits', () => {
      expect(calculateEndTime('9:05')).toBe('09:35');
      expect(calculateEndTime('12:01', 59)).toBe('13:00');
    });
  });

  describe('timeToMinutes', () => {
    it('should convert time strings to minutes', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('01:00')).toBe(60);
      expect(timeToMinutes('12:30')).toBe(750);
      expect(timeToMinutes('23:59')).toBe(1439);
    });

    it('should handle single digit hours', () => {
      expect(timeToMinutes('9:15')).toBe(555);
      expect(timeToMinutes('5:45')).toBe(345);
    });
  });

  describe('minutesToTime', () => {
    it('should convert minutes to time strings', () => {
      expect(minutesToTime(0)).toBe('00:00');
      expect(minutesToTime(60)).toBe('01:00');
      expect(minutesToTime(750)).toBe('12:30');
      expect(minutesToTime(1439)).toBe('23:59');
    });

    it('should handle edge cases', () => {
      expect(minutesToTime(15)).toBe('00:15');
      expect(minutesToTime(90)).toBe('01:30');
      expect(minutesToTime(1440)).toBe('24:00'); // Midnight of next day
    });

    it('should pad single digits', () => {
      expect(minutesToTime(65)).toBe('01:05');
      expect(minutesToTime(540)).toBe('09:00');
    });
  });

  describe('hasTimeOverlap', () => {
    it('should detect overlapping time ranges', () => {
      // Complete overlap
      expect(hasTimeOverlap(540, 570, 540, 570)).toBe(true); // 9:00-9:30 vs 9:00-9:30

      // Partial overlap at start
      expect(hasTimeOverlap(540, 570, 555, 585)).toBe(true); // 9:00-9:30 vs 9:15-9:45

      // Partial overlap at end
      expect(hasTimeOverlap(555, 585, 540, 570)).toBe(true); // 9:15-9:45 vs 9:00-9:30

      // One inside another
      expect(hasTimeOverlap(540, 600, 555, 570)).toBe(true); // 9:00-10:00 vs 9:15-9:30
      expect(hasTimeOverlap(555, 570, 540, 600)).toBe(true); // 9:15-9:30 vs 9:00-10:00
    });

    it('should not detect non-overlapping time ranges', () => {
      // Adjacent times
      expect(hasTimeOverlap(540, 570, 570, 600)).toBe(false); // 9:00-9:30 vs 9:30-10:00

      // Separate times
      expect(hasTimeOverlap(540, 570, 600, 630)).toBe(false); // 9:00-9:30 vs 10:00-10:30

      // Reverse order
      expect(hasTimeOverlap(600, 630, 540, 570)).toBe(false); // 10:00-10:30 vs 9:00-9:30
    });

    it('should handle edge cases', () => {
      // Zero duration ranges
      expect(hasTimeOverlap(540, 540, 540, 570)).toBe(false); // No duration at start
      expect(hasTimeOverlap(540, 570, 540, 540)).toBe(false); // No duration at end

      // Same start times
      expect(hasTimeOverlap(540, 570, 540, 600)).toBe(true); // 9:00-9:30 vs 9:00-10:00

      // Same end times
      expect(hasTimeOverlap(540, 570, 555, 570)).toBe(true); // 9:00-9:30 vs 9:15-9:30
    });
  });

  describe('createUTCDateTime', () => {
    it('should create UTC timestamp from date, time, and timezone', () => {
      // Test with GMT+7 timezone (Asia/Bangkok) - using a fixed date for consistency
      const testDate = '2024-07-15'; // Use a fixed date that won't become outdated
      const utc = createUTCDateTime(testDate, '14:30', 'Asia/Bangkok');

      // 2024-07-15T14:30:00 in GMT+7 should be 2024-07-15T07:30:00 UTC
      const expected = new Date('2024-07-15T07:30:00Z').getTime();
      expect(utc).toBe(expected);
    });

    it('should handle different timezones', () => {
      const testDate = '2024-07-15';

      // EST (GMT-4 in summer)
      const utcEst = createUTCDateTime(testDate, '09:00', 'America/New_York');
      const expectedEst = new Date('2024-07-15T13:00:00Z').getTime(); // EDT is UTC-4 in summer
      expect(utcEst).toBe(expectedEst);

      // UTC
      const utcUTC = createUTCDateTime(testDate, '12:00', 'UTC');
      const expectedUTC = new Date('2024-07-15T12:00:00Z').getTime();
      expect(utcUTC).toBe(expectedUTC);
    });
  });

  describe('isAppointmentInPast', () => {
    it('should detect past appointments', () => {
      const now = new Date('2024-07-15T10:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      // Appointment 1 hour ago in GMT+7 (16:00 Bangkok = 09:00 UTC, which is 1 hour before 10:00 UTC)
      expect(isAppointmentInPast('2024-07-15', '16:00', 'Asia/Bangkok')).toBe(true);

      // Appointment 1 hour in future in GMT+7 (18:00 Bangkok = 11:00 UTC, which is 1 hour after 10:00 UTC)
      expect(isAppointmentInPast('2024-07-15', '18:00', 'Asia/Bangkok')).toBe(false);
    });

    it('should handle timezone boundaries', () => {
      const now = new Date('2024-07-15T23:30:00Z'); // 23:30 UTC
      vi.useFakeTimers();
      vi.setSystemTime(now);

      // Tomorrow 07:00 in GMT+7 should be today 00:00 UTC (30 minutes future)
      expect(isAppointmentInPast('2024-07-16', '07:00', 'Asia/Bangkok')).toBe(false);

      // Tomorrow 08:00 in GMT+7 should be today 01:00 UTC (1.5 hours future)
      expect(isAppointmentInPast('2024-07-16', '08:00', 'Asia/Bangkok')).toBe(false);
    });
  });

  describe('checkAppointmentOverlap', () => {
    const existingAppointments = [
      { startTime: '09:00', endTime: '09:30', status: 'active' },
      { startTime: '10:15', endTime: '11:00', status: 'active' },
      { startTime: '14:00', endTime: '14:30', status: 'cancelled' }, // Should be ignored
      { startTime: '16:00', endTime: '16:30', status: 'active' }
    ];

    it('should detect overlapping appointments', () => {
      // Overlaps with first appointment
      expect(checkAppointmentOverlap('09:15', 30, existingAppointments)).toBe(true);

      // Overlaps with second appointment
      expect(checkAppointmentOverlap('10:30', 30, existingAppointments)).toBe(true);

      // Overlaps with last appointment
      expect(checkAppointmentOverlap('15:45', 30, existingAppointments)).toBe(true);
    });

    it('should not detect non-overlapping appointments', () => {
      // Between first and second
      expect(checkAppointmentOverlap('09:30', 30, existingAppointments)).toBe(false);

      // Between second and last
      expect(checkAppointmentOverlap('11:00', 30, existingAppointments)).toBe(false);

      // Before first appointment
      expect(checkAppointmentOverlap('08:00', 30, existingAppointments)).toBe(false);

      // After last appointment
      expect(checkAppointmentOverlap('17:00', 30, existingAppointments)).toBe(false);
    });

    it('should ignore cancelled appointments', () => {
      // This time overlaps with the cancelled appointment but should be allowed
      expect(checkAppointmentOverlap('14:15', 30, existingAppointments)).toBe(false);
    });

    it('should handle empty appointment list', () => {
      expect(checkAppointmentOverlap('09:00', 30, [])).toBe(false);
      expect(checkAppointmentOverlap('09:00', 30, undefined as any)).toBe(false);
    });

    it('should handle custom durations', () => {
      // 60-minute appointment that would overlap
      expect(checkAppointmentOverlap('08:30', 60, existingAppointments)).toBe(true);

      // 15-minute appointment that fits
      expect(checkAppointmentOverlap('09:45', 15, existingAppointments)).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should work together for typical appointment booking scenario', () => {
      const startTime = '14:30';

      // Validate format
      expect(isValidTimeFormat(startTime)).toBe(true);

      // Check business hours
      expect(isWithinBusinessHours(startTime)).toBe(true);

      // Check not in past using a future date relative to our mocked time
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      const futureDateString = futureDate.toISOString().split('T')[0];
      expect(isAppointmentInPast(futureDateString, startTime, 'UTC')).toBe(false);

      // Calculate end time
      const endTime = calculateEndTime(startTime);
      expect(endTime).toBe('15:00');

      // Convert to minutes for overlap checking
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      // Check overlap with existing appointment 15:00-15:30
      const existingStart = timeToMinutes('15:00');
      const existingEnd = timeToMinutes('15:30');

      expect(hasTimeOverlap(startMinutes, endMinutes, existingStart, existingEnd)).toBe(false);

      // Check overlap with conflicting appointment 14:15-14:45
      const conflictStart = timeToMinutes('14:15');
      const conflictEnd = timeToMinutes('14:45');

      expect(hasTimeOverlap(startMinutes, endMinutes, conflictStart, conflictEnd)).toBe(true);
    });

    it('should work together for complete server validation flow', () => {
      const now = new Date('2024-07-15T06:00:00Z'); // 6 AM UTC
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const appointmentData = {
        date: '2024-07-15',
        startTime: '14:00', // 2 PM local time
        timezone: 'Asia/Bangkok' // GMT+7
      };

      const existingAppointments = [
        { startTime: '13:30', endTime: '14:00', status: 'active' },
        { startTime: '15:00', endTime: '15:30', status: 'active' }
      ];

      // Full validation flow
      expect(isValidTimeFormat(appointmentData.startTime)).toBe(true);
      expect(isWithinBusinessHours(appointmentData.startTime)).toBe(true);
      expect(isAppointmentInPast(appointmentData.date, appointmentData.startTime, appointmentData.timezone)).toBe(false);
      expect(checkAppointmentOverlap(appointmentData.startTime, 30, existingAppointments)).toBe(false);
    });
  });

  describe('timezone date validation regression tests', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should correctly validate appointments on current day in user timezone', () => {
      // Regression test for bug where local date was converted to UTC date
      // causing "07:00" on today to be rejected as "not available"

      // Set current time to 6 AM in New York timezone
      const mockNow = new Date('2024-07-15T06:00:00-04:00'); // 6 AM EDT = 10 AM UTC
      vi.setSystemTime(mockNow);

      const userTimezone = 'America/New_York'; // EDT
      const todayLocal = '2024-07-15'; // Today in local timezone

      // These times should NOT be in the past on the same day
      expect(isAppointmentInPast(todayLocal, '07:00', userTimezone)).toBe(false);
      expect(isAppointmentInPast(todayLocal, '08:00', userTimezone)).toBe(false);
      expect(isAppointmentInPast(todayLocal, '14:30', userTimezone)).toBe(false);

      // Times earlier than current time (6 AM) should be in the past
      expect(isAppointmentInPast(todayLocal, '05:00', userTimezone)).toBe(true);
      expect(isAppointmentInPast(todayLocal, '05:59', userTimezone)).toBe(true);
    });

    it('should prevent regression where local date was incorrectly converted to UTC date', () => {
      // This test ensures that when we validate appointments on "today",
      // we use the local date, not accidentally convert it to UTC date first

      // Use a known timezone where DST behavior is predictable
      const mockNow = new Date('2024-07-15T10:00:00Z'); // 10 AM UTC = 6 AM EST
      vi.setSystemTime(mockNow);

      const userTimezone = 'America/New_York';
      const todayLocal = '2024-07-15'; // Today in local timezone

      // This should work: 7 AM today in EST should not be in the past when it's currently 6 AM EST
      expect(isAppointmentInPast(todayLocal, '07:00', userTimezone)).toBe(false);

      // And times clearly before current time should be in past
      expect(isAppointmentInPast(todayLocal, '05:00', userTimezone)).toBe(true);
    });

    it('should handle cross-timezone validation correctly', () => {
      // Test with different timezones to ensure UTC conversion works
      const mockNow = new Date('2024-07-15T08:00:00Z'); // 8 AM UTC
      vi.setSystemTime(mockNow);

      // Bangkok is UTC+7, so 8 AM UTC = 3 PM Bangkok
      const bangkokDate = '2024-07-15';
      expect(isAppointmentInPast(bangkokDate, '16:00', 'Asia/Bangkok')).toBe(false); // 4 PM Bangkok
      expect(isAppointmentInPast(bangkokDate, '14:00', 'Asia/Bangkok')).toBe(true);  // 2 PM Bangkok (before 3 PM)

      // New York is UTC-4 in summer, so 8 AM UTC = 4 AM New York
      const nyDate = '2024-07-15';
      expect(isAppointmentInPast(nyDate, '05:00', 'America/New_York')).toBe(false); // 5 AM NY
      expect(isAppointmentInPast(nyDate, '03:00', 'America/New_York')).toBe(true);  // 3 AM NY (before 4 AM)
    });

    it('should validate business hours regardless of timezone', () => {
      // Business hours validation should work consistently across timezones
      // This ensures the frontend validation matches backend validation

      const testTimes = ['07:00', '07:30', '12:00', '18:30', '19:00'];

      testTimes.forEach(time => {
        const isValid = isValidTimeFormat(time);
        const withinHours = isWithinBusinessHours(time);

        expect(isValid).toBe(true); // All test times should be valid format

        if (time === '19:00') {
          // 19:00 is at closing time, should not be within business hours
          expect(withinHours).toBe(false);
        } else {
          // All others should be within business hours
          expect(withinHours).toBe(true);
        }
      });
    });
  });
});