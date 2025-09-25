import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppointments } from "@/hooks/useAppointments";
import { formatDate } from "@/lib/dateUtils";
import type { TimeSlot } from "@shared/schema";
import { EmptyState } from "../EmptyState";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { TimeSlotHeader } from "./TimeSlotHeader";
import { TimeSlotSkeleton } from "./TimeSlotSkeleton";
import { useModalStore } from "@/stores/modalStore";

interface TimeSlotProps {
  selectedDate: Date;
}

export function TimeSlot({ selectedDate }: TimeSlotProps) {
  const dateString = formatDate(selectedDate);
  const { data, isLoading, error } = useAppointments(dateString);
  const { openBookingModal, openCancelModal, openBookingDetailsModal } = useModalStore();

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      openBookingModal(slot, selectedDate);
    }
  };

  const handleCancelClick = (slot: TimeSlot) => {
    const dateString = selectedDate.toISOString().split('T')[0];
    openCancelModal(
      slot.appointmentId || "",
      slot.bookedBy || "",
      slot.time,
      dateString
    );
  };

  const handleBookingDetailsClick = (slot: TimeSlot) => {
    // Find the full appointment data from the appointments array
    const appointment = data?.appointments?.find(apt =>
      apt.id === slot.appointmentId || apt.startTime === slot.time
    );

    if (appointment) {
      openBookingDetailsModal(appointment);
    }
  };

  // Loading state
  if (isLoading) {
    return <TimeSlotSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load time slots</p>
        </CardContent>
      </Card>
    );
  }

  // No data
  if (!data) return null;

  // Empty state - no slots available
  if (data.slots.length === 0) {
    return (
      <EmptyState
        type="no-slots"
        message="No time slots are available for this date. Please select a different date or check back later."
      />
    );
  }

  return (
    <Card data-testid="time-slots-section">
        <CardHeader>
          <TimeSlotHeader
            selectedDate={selectedDate}
            availableSlots={data.availableSlots}
            totalSlots={data.totalSlots}
          />
        </CardHeader>

        <CardContent>
          <TimeSlotGrid
            slots={data.slots}
            selectedDate={selectedDate}
            onSlotSelect={handleSlotSelect}
            onCancelClick={handleCancelClick}
            onBookingDetailsClick={handleBookingDetailsClick}
          />
        </CardContent>
      </Card>
  );
}