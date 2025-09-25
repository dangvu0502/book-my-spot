import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAvailableSlots } from "@/hooks/useAppointments";
import { formatDate } from "@/lib/dateUtils";
import type { TimeSlot } from "@shared/schema";
import { EmptyState } from "../EmptyState";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { TimeSlotHeader } from "./TimeSlotHeader";
import { TimeSlotSkeleton } from "./TimeSlotSkeleton";

interface TimeSlotProps {
  selectedDate: Date;
  onSlotSelect: (slot: TimeSlot) => void;
  onCancelClick?: (slot: TimeSlot) => void;
}

export function TimeSlot({ selectedDate, onSlotSelect, onCancelClick }: TimeSlotProps) {
  const dateString = formatDate(selectedDate);
  const { data, isLoading, error } = useAvailableSlots(dateString);

  const handleCancelClick = (slot: TimeSlot) => {
    if (onCancelClick) {
      onCancelClick(slot);
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
            onSlotSelect={onSlotSelect}
            onCancelClick={handleCancelClick}
          />
        </CardContent>
      </Card>
  );
}