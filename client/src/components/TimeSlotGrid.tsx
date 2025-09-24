import { useState } from "react";
import { Sun, Moon, RefreshCw, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./EmptyState";
import { useAvailableSlots, useCancelAppointment } from "@/hooks/useAppointments";
import { formatDate, formatTime, isCurrentTimeSlot, getTimeSlotStatus } from "@/lib/dateUtils";
import type { TimeSlot } from "@shared/schema";
import { CancelModal } from "./CancelModal";

interface TimeSlotGridProps {
  selectedDate: Date;
  onSlotSelect: (slot: TimeSlot) => void;
}

export function TimeSlotGrid({ selectedDate, onSlotSelect }: TimeSlotGridProps) {
  const dateString = formatDate(selectedDate);
  const { data, isLoading, error } = useAvailableSlots(dateString);
  const cancelAppointment = useCancelAppointment();
  const [cancelModalData, setCancelModalData] = useState<{
    isOpen: boolean;
    appointmentId: string;
    customerName: string;
    time: string;
  }>({ isOpen: false, appointmentId: "", customerName: "", time: "" });

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-48 skeleton" />
          <Skeleton className="h-4 w-32 skeleton mt-2" />
        </CardHeader>
        <CardContent>
          <div className="time-grid">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg skeleton" style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load time slots</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Show empty state if no slots available
  if (data.slots.length === 0) {
    return (
      <EmptyState
        type="no-slots"
        message="No time slots are available for this date. Please select a different date or check back later."
      />
    );
  }

  const morningSlots = data.slots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 7 && hour < 12;
  });

  const afternoonSlots = data.slots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 12 && hour < 17;
  });

  const eveningSlots = data.slots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 17;
  });

  const renderTimeSlot = (slot: TimeSlot) => {
    const status = getTimeSlotStatus(selectedDate, slot.time, !slot.available, slot.isUserBooking);
    const isCurrentTime = isCurrentTimeSlot(selectedDate, slot.time);

    let buttonClass = "time-slot p-2 rounded-lg text-sm font-medium w-full h-auto";
    let disabled = false;

    switch (status) {
      case 'available':
        buttonClass += " time-slot-card--available";
        break;
      case 'booked':
        buttonClass += " time-slot-card--booked cursor-not-allowed";
        disabled = true;
        break;
      case 'user-booking':
        buttonClass += " time-slot-card--selected";
        break;
      case 'past':
        buttonClass += " bg-muted/50 border border-muted text-muted-foreground cursor-not-allowed disabled-elegant";
        disabled = true;
        break;
    }

    if (isCurrentTime) {
      buttonClass += " ring-2 ring-blue-500 ring-offset-2";
    }

    return (
      <div id={slot.slotId} className="relative">
        <Button
          variant="ghost"
          className={buttonClass}
          disabled={disabled}
          onClick={() => !disabled && status === 'available' && onSlotSelect(slot)}
          data-testid={`button-timeslot-${slot.time}`}
        >
          <div className="flex flex-col items-center gap-1 w-full">
            <span className="font-semibold text-base">{formatTime(slot.time)}</span>
            <span className="text-xs opacity-90">
              {status === 'available' ? 'Available' :
               status === 'user-booking' ? 'Your Booking' :
               status === 'booked' ? slot.bookedBy : 'Past'}
            </span>
          </div>
        </Button>
        {status === 'booked' && slot.appointmentId && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setCancelModalData({
                isOpen: true,
                appointmentId: slot.appointmentId || "",
                customerName: slot.bookedBy || "",
                time: slot.time
              });
            }}
            title="Cancel appointment"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card data-testid="time-slots-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Available Time Slots</h2>
            <p className="text-sm text-muted-foreground" data-testid="text-selected-date">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 dark:bg-slate-300 rounded"></div>
              <span className="text-muted-foreground">
                Available (<span data-testid="text-available-count">{data.availableSlots}</span>)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-destructive dark:bg-slate-400 rounded"></div>
              <span className="text-muted-foreground">
                Booked (<span data-testid="text-booked-count">{data.totalSlots - data.availableSlots}</span>)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Morning Section */}
        {morningSlots.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
              <Sun className="h-4 w-4 text-warning mr-2" />
              Morning (7:00 AM - 12:00 PM)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {morningSlots.map((slot) => renderTimeSlot(slot))}
            </div>
          </div>
        )}

        {/* Afternoon Section */}
        {afternoonSlots.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
              <Sun className="h-4 w-4 text-warning mr-2" />
              Afternoon (12:00 PM - 5:00 PM)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {afternoonSlots.map((slot) => renderTimeSlot(slot))}
            </div>
          </div>
        )}

        {/* Evening Section */}
        {eveningSlots.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
              <Moon className="h-4 w-4 text-primary mr-2" />
              Evening (5:00 PM - 7:00 PM)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {eveningSlots.map((slot) => renderTimeSlot(slot))}
            </div>
          </div>
        )}
      </CardContent>

      {cancelModalData.isOpen && (
        <CancelModal
          isOpen={cancelModalData.isOpen}
          onClose={() => setCancelModalData({ isOpen: false, appointmentId: "", customerName: "", time: "" })}
          appointmentId={cancelModalData.appointmentId}
          customerName={cancelModalData.customerName}
          time={cancelModalData.time}
          date={dateString}
        />
      )}
    </Card>
  );
}
