import { Button } from "@/components/ui/button";
import { formatTime, getTimeSlotStatus } from "@/lib/dateUtils";
import type { TimeSlot } from "@shared/schema";
import { X, Eye, User } from "lucide-react";

interface TimeSlotButtonProps {
  slot: TimeSlot;
  selectedDate: Date;
  onSlotSelect: (slot: TimeSlot) => void;
  onCancelClick: (slot: TimeSlot) => void;
  onBookingDetailsClick?: (slot: TimeSlot) => void;
}

export function TimeSlotButton({ slot, selectedDate, onSlotSelect, onCancelClick, onBookingDetailsClick }: TimeSlotButtonProps) {
  const status = getTimeSlotStatus(selectedDate, slot.time, !slot.available, slot.isUserBooking);

  const getSlotStyles = () => {
    const baseClass = "time-slot p-2 rounded-lg text-sm font-medium w-full h-auto";

    switch (status) {
      case 'available':
        return `${baseClass} time-slot-card--available cursor-pointer`;
      case 'booked':
        return `${baseClass} time-slot-card--booked cursor-pointer`;
      case 'user-booking':
        return `${baseClass} time-slot-card--selected cursor-pointer`;
      case 'past':
        return `${baseClass} bg-muted/50 border border-muted text-muted-foreground cursor-not-allowed disabled-elegant`;
      default:
        return baseClass;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'user-booking':
        return 'Your Booking';
      case 'booked':
        return slot.bookedBy;
      case 'past':
        return 'Past';
      default:
        return '';
    }
  };

  const isDisabled = status === 'past';
  const isClickable = status === 'available';
  const isBookedSlot = status === 'booked' || status === 'user-booking';

  return (
    <div id={slot.slotId} className="relative">
      <Button
        variant="ghost"
        className={`${getSlotStyles()} ${isBookedSlot ? 'group' : ''}`}
        disabled={isDisabled}
        onClick={() => {
          if (isClickable) {
            onSlotSelect(slot);
          } else if (isBookedSlot && onBookingDetailsClick) {
            onBookingDetailsClick(slot);
          }
        }}
        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
        data-testid={`button-timeslot-${slot.time}`}
      >
        <div className="flex flex-col items-center gap-1 w-full">
          <span className="font-semibold text-base">{formatTime(slot.time)}</span>
          <span className="text-xs opacity-90">{getStatusLabel()}</span>

          {/* Hover overlay for booked slots */}
          {isBookedSlot && (
            <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Eye className="h-3 w-3" />
            </div>
          )}
        </div>
      </Button>

      {status === 'booked' && slot.appointmentId && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onCancelClick(slot);
          }}
          title="Cancel appointment"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}