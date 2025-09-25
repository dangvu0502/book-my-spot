import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@shared/schema";

interface ExistingBookingsProps {
  bookings: Appointment[];
  onBookingClick: (apt: Appointment) => void;
  onCancelClick?: (apt: Appointment) => void;
}

export function ExistingBookings({
  bookings,
  onBookingClick,
  onCancelClick
}: ExistingBookingsProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">
        Booked Times Today {bookings.length > 0 && `(${bookings.length})`}
      </h4>
      {bookings.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {bookings.map((apt: Appointment) => (
            <div
              key={apt.id}
              className="relative group flex flex-col items-start p-3 border rounded-lg hover:bg-accent transition-colors text-left h-[72px] cursor-pointer"
              onClick={() => onBookingClick(apt)}
            >
              <div className="font-medium text-sm">
                {apt.startTime} - {apt.endTime}
              </div>
              <span className="text-xs text-muted-foreground truncate w-full mt-1">
                {apt.customerName}
              </span>
              {onCancelClick && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelClick(apt);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/10">
          <svg
            className="h-8 w-8 text-muted-foreground/50 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-muted-foreground">No appointments yet</p>
          <p className="text-xs text-muted-foreground mt-1">All time slots are available</p>
        </div>
      )}
    </div>
  );
}