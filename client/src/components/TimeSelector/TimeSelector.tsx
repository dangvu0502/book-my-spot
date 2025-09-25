import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimeSlot } from "@/hooks/useTimeSlot";
import { useModalStore } from "@/stores/modalStore";
import { BUSINESS_HOURS } from "@shared/timeValidation";
import { ExistingBookings } from "./ExistingBookings";
import { TimeInput } from "./TimeInput";
import { AvailabilityStatus } from "./AvailabilityStatus";
import { QuickActions } from "./QuickActions";

interface TimeSelectorProps {
  selectedDate: Date;
}

export function TimeSelector({ selectedDate }: TimeSelectorProps) {
  const { openBookingModal, openBookingDetailsModal, openCancelModal } = useModalStore();

  const {
    timeValue,
    setTimeValue,
    isAvailable,
    isLoading,
    existingBookings,
    findNextAvailable,
    createBookingData,
  } = useTimeSlot({
    selectedDate
  });

  const handleBookAppointment = () => {
    const bookingData = createBookingData();
    if (!bookingData) return;

    openBookingModal(bookingData, selectedDate);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          Book Your Appointment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <ExistingBookings
          bookings={existingBookings}
          onBookingClick={openBookingDetailsModal}
          onCancelClick={openCancelModal}
        />

        <QuickActions
          onFindNext={findNextAvailable}
          isLoading={isLoading}
        />

        <TimeInput
          value={timeValue}
          onChange={setTimeValue}
          businessHours={BUSINESS_HOURS}
        />

        <AvailabilityStatus isAvailable={isAvailable} />

        <Button
          onClick={handleBookAppointment}
          disabled={!isAvailable || isLoading}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  );
}