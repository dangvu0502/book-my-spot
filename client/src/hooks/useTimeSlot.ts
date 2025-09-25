import { useState } from "react";
import { formatDate } from "@/lib/dateUtils";
import { useAppointments } from "@/hooks/useAppointments";
import {
  isValidTimeFormat,
  isWithinBusinessHours,
  isAppointmentInPast,
  timeToMinutes,
  hasTimeOverlap,
  minutesToTime,
  BUSINESS_HOURS,
} from "@shared/timeValidation";
import type {
  Appointment,
  GetAppointmentsByDateResponse,
} from "@shared/schema";
import { DateTime } from "luxon";

interface UseTimeSlotLogicProps {
  selectedDate: Date;
  duration?: number;
}

function calculateAvailability(params: {
  timeValue: string;
  data: GetAppointmentsByDateResponse | undefined;
  selectedDate: Date;
  duration: number;
}): boolean | null {
  const { timeValue, data, selectedDate, duration } = params;

  if (!data || !timeValue) return null;

  if (!isValidTimeFormat(timeValue)) return false;
  if (!isWithinBusinessHours(timeValue, duration)) return false;

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDateString = DateTime.fromJSDate(selectedDate).toISODate()!;
  if (isAppointmentInPast(localDateString, timeValue, userTimezone))
    return false;

  // Check against existing appointments
  const selectedStartMinutes = timeToMinutes(timeValue);
  const selectedEndMinutes = selectedStartMinutes + duration;

  const hasConflict = data.appointments?.some((apt: Appointment) => {
    if (apt.status !== "active") return false;

    const aptStartMinutes = timeToMinutes(apt.startTime);
    const aptEndMinutes = timeToMinutes(apt.endTime);

    return hasTimeOverlap(
      selectedStartMinutes,
      selectedEndMinutes,
      aptStartMinutes,
      aptEndMinutes,
    );
  });

  return !hasConflict;
}

export function useTimeSlot({
  selectedDate,
  duration = BUSINESS_HOURS.defaultDuration,
}: UseTimeSlotLogicProps) {
  const dateString = formatDate(selectedDate);
  const { data, isLoading } = useAppointments(dateString);

  const [timeValue, setTimeValue] = useState<string>("09:00");

  const existingBookings =
    data?.appointments?.filter((apt: Appointment) => apt.status === "active") ||
    [];

  // Calculate availability
  const isAvailable = calculateAvailability({
    timeValue,
    data,
    selectedDate,
    duration,
  });

  const findNextAvailable = () => {
    if (!data) return;

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    // Start from current time if today, otherwise from business start
    let searchStart = BUSINESS_HOURS.start * 60;
    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      searchStart = Math.max(currentMinutes + 15, searchStart); // At least 15 mins from now
    }

    const appointments =
      data.appointments?.filter(
        (apt: Appointment) => apt.status === "active",
      ) || [];

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
      if (searchStart + duration <= timeToMinutes(appointments[0].startTime)) {
        foundTime = searchStart;
      } else {
        // Check between appointments
        for (let i = 0; i < appointments.length - 1; i++) {
          const gapStart = timeToMinutes(appointments[i].endTime);
          const gapEnd = timeToMinutes(appointments[i + 1].startTime);

          const slotStart = Math.max(gapStart, searchStart);
          if (slotStart + duration <= gapEnd) {
            foundTime = slotStart;
            break;
          }
        }

        // Check after last appointment
        if (!foundTime) {
          const afterLast = timeToMinutes(
            appointments[appointments.length - 1].endTime,
          );
          const slotStart = Math.max(afterLast, searchStart);
          if (slotStart + duration <= BUSINESS_HOURS.end * 60) {
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
    const selectedTime = `${hourStr.padStart(2, "0")}:${minuteStr}`;

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
    dateString,
  };
}
