import { Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailableSlots } from "@/hooks/useAppointments";
import { formatDate, formatTime, isCurrentTimeSlot, getTimeSlotStatus } from "@/lib/dateUtils";
import type { TimeSlot } from "@shared/schema";

interface TimeSlotGridProps {
  selectedDate: Date;
  onSlotSelect: (slot: TimeSlot) => void;
}

export function TimeSlotGrid({ selectedDate, onSlotSelect }: TimeSlotGridProps) {
  const dateString = formatDate(selectedDate);
  const { data, isLoading, error } = useAvailableSlots(dateString);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="time-grid">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
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
    
    let buttonClass = "time-slot p-3 rounded-lg text-sm font-medium transition-all";
    let disabled = false;
    
    switch (status) {
      case 'available':
        buttonClass += " bg-success/10 border border-success/20 hover:border-success text-success";
        break;
      case 'booked':
        buttonClass += " bg-destructive/10 border border-destructive/20 text-destructive cursor-not-allowed opacity-75";
        disabled = true;
        break;
      case 'user-booking':
        buttonClass += " bg-warning/10 border border-warning/20 text-warning";
        break;
      case 'past':
        buttonClass += " bg-muted/50 border border-muted text-muted-foreground cursor-not-allowed opacity-50";
        disabled = true;
        break;
    }
    
    if (isCurrentTime) {
      buttonClass += " current-time-indicator";
    }

    return (
      <Button
        key={slot.slotId}
        variant="ghost"
        className={buttonClass}
        disabled={disabled}
        onClick={() => !disabled && onSlotSelect(slot)}
        data-testid={`button-timeslot-${slot.time}`}
      >
        <div className="flex flex-col items-center">
          <span className="font-semibold">{formatTime(slot.time)}</span>
          <span className="text-xs opacity-75">
            {status === 'available' ? 'Available' : 
             status === 'user-booking' ? 'Your Booking' :
             status === 'booked' ? slot.bookedBy : 'Past'}
          </span>
        </div>
      </Button>
    );
  };

  return (
    <Card>
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
              <div className="w-3 h-3 bg-success rounded"></div>
              <span className="text-muted-foreground">
                Available (<span data-testid="text-available-count">{data.availableSlots}</span>)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-destructive rounded"></div>
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
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <Sun className="h-4 w-4 text-warning mr-2" />
              Morning (7:00 AM - 12:00 PM)
            </h3>
            <div className="time-grid">
              {morningSlots.map(renderTimeSlot)}
            </div>
          </div>
        )}

        {/* Afternoon Section */}
        {afternoonSlots.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <Sun className="h-4 w-4 text-warning mr-2" />
              Afternoon (12:00 PM - 5:00 PM)
            </h3>
            <div className="time-grid">
              {afternoonSlots.map(renderTimeSlot)}
            </div>
          </div>
        )}

        {/* Evening Section */}
        {eveningSlots.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <Moon className="h-4 w-4 text-primary mr-2" />
              Evening (5:00 PM - 7:00 PM)
            </h3>
            <div className="time-grid">
              {eveningSlots.map(renderTimeSlot)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
