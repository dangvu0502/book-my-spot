import { useState, useEffect } from "react";
import { formatDate } from "@/lib/dateUtils";
import { useAppointments } from "@/hooks/useAppointments";
import type { Appointment } from "@shared/schema";

interface UseTimeSlotLogicProps {
  selectedDate: Date;
  duration: number;
  businessHours: {
    start: number;
    end: number;
  };
}

export function useTimeSlot({
  selectedDate,
  duration,
  businessHours
}: UseTimeSlotLogicProps) {
  const dateString = formatDate(selectedDate);
  const { data, isLoading } = useAppointments(dateString);

  const [timeValue, setTimeValue] = useState<string>("09:00");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const existingBookings = data?.appointments?.filter(
    (apt: Appointment) => apt.status === 'active'
  ) || [];

  // Check if selected time is available
  useEffect(() => {
    if (!data || !timeValue) {
      setIsAvailable(null);
      return;
    }

    // Validate time format
    const timeMatch = timeValue.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) {
      setIsAvailable(false);
      return;
    }

    const [_, hourStr, minuteStr] = timeMatch;
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    // Check basic time validity
    if (hour < businessHours.start || hour >= businessHours.end || minute < 0 || minute > 59) {
      setIsAvailable(false);
      return;
    }

    // Check if time is in the past
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const selectedTimeMinutes = hour * 60 + minute;
      if (selectedTimeMinutes <= currentMinutes) {
        setIsAvailable(false);
        return;
      }
    }

    const selectedTimeMinutes = hour * 60 + minute;
    const endTimeMinutes = selectedTimeMinutes + duration;

    // Check if within business hours
    if (endTimeMinutes > businessHours.end * 60) {
      setIsAvailable(false);
      return;
    }

    // Check against existing appointments
    const hasConflict = data.appointments?.some((apt: Appointment) => {
      if (apt.status !== 'active') return false;

      const aptStartMinutes = timeToMinutes(apt.startTime);
      const aptEndMinutes = timeToMinutes(apt.endTime);

      // Check for overlap
      return (selectedTimeMinutes < aptEndMinutes && endTimeMinutes > aptStartMinutes);
    });

    setIsAvailable(!hasConflict);
  }, [timeValue, duration, data, selectedDate, businessHours]);

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const findNextAvailable = () => {
    if (!data) return;

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    // Start from current time if today, otherwise from business start
    let searchStart = businessHours.start * 60;
    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      searchStart = Math.max(currentMinutes + 15, searchStart); // At least 15 mins from now
    }

    const durationMinutes = duration;
    const appointments = data.appointments?.filter((apt: Appointment) => apt.status === 'active') || [];

    // Sort appointments by start time
    appointments.sort((a: Appointment, b: Appointment) => {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    let foundTime: number | null = null;

    // If no appointments, first available is searchStart
    if (appointments.length === 0) {
      foundTime = searchStart;
    } else {
      // Check before first appointment
      if (searchStart + durationMinutes <= timeToMinutes(appointments[0].startTime)) {
        foundTime = searchStart;
      } else {
        // Check between appointments
        for (let i = 0; i < appointments.length - 1; i++) {
          const gapStart = timeToMinutes(appointments[i].endTime);
          const gapEnd = timeToMinutes(appointments[i + 1].startTime);

          const slotStart = Math.max(gapStart, searchStart);
          if (slotStart + durationMinutes <= gapEnd) {
            foundTime = slotStart;
            break;
          }
        }

        // Check after last appointment
        if (!foundTime) {
          const afterLast = timeToMinutes(appointments[appointments.length - 1].endTime);
          const slotStart = Math.max(afterLast, searchStart);
          if (slotStart + durationMinutes <= businessHours.end * 60) {
            foundTime = slotStart;
          }
        }
      }
    }

    if (foundTime !== null) {
      const time = minutesToTime(foundTime);
      setTimeValue(time);
    }
  };

  const createBookingData = () => {
    if (!timeValue) return null;

    const timeMatch = timeValue.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) return null;

    const [_, hourStr, minuteStr] = timeMatch;
    const selectedTime = `${hourStr.padStart(2, '0')}:${minuteStr}`;

    return {
      time: selectedTime,
      available: true,
      slotId: `${dateString}-${selectedTime}`,
    };
  };

  return {
    timeValue,
    setTimeValue,
    isAvailable,
    isLoading,
    existingBookings,
    findNextAvailable,
    createBookingData,
    dateString
  };
}