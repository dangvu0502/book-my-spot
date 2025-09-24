import type { Appointment, TimeSlot } from '@shared/schema';

const WORKING_HOURS = {
  start: 7,  // 7 AM
  end: 19,   // 7 PM
  slotDuration: 30 // 30 minutes per slot
};

export function calculateAvailableSlots(appointments: Appointment[], date: string): {
  slots: TimeSlot[];
  availableSlots: number;
  totalSlots: number;
} {
  const slots: TimeSlot[] = [];
  const bookedTimes = new Map<string, Appointment>();

  // Create a map of booked times
  appointments.forEach(apt => {
    bookedTimes.set(apt.startTime, apt);
  });

  // Generate all possible time slots for the day (30-minute intervals)
  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    for (let minute = 0; minute < 60; minute += WORKING_HOURS.slotDuration) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const appointment = bookedTimes.get(timeString);

      const slot: TimeSlot = {
        slotId: `${date}-${timeString}`,
        time: timeString,
        available: !appointment,
        bookedBy: appointment ? appointment.customerName : undefined,
        isUserBooking: false // This would need to be determined based on current user
      };

      slots.push(slot);
    }
  }

  const availableSlots = slots.filter(s => s.available).length;

  return {
    slots,
    availableSlots,
    totalSlots: slots.length
  };
}