import { BookingModal } from "@/components/BookingModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Header } from "@/components/Header";
import { TimeSlot } from "@/components/TimeSlot";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { TimeSlot as TimeSlotType } from "@shared/schema";
import { addDays, startOfToday } from "date-fns";
import { useState } from "react";

export default function AppointmentBooking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotType | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);
  const today = startOfToday();

  const handleSlotSelect = (slot: TimeSlotType) => {
    if (slot.available) {
      setSelectedSlot(slot);
      setShowBookingModal(true);
    }
  };

  const handleBookingSuccess = (appointment: any) => {
    setConfirmedAppointment(appointment);
    setShowBookingModal(false);
    setShowConfirmationModal(true);
  };

  const handleBookingModalClose = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
  };

  const handleConfirmationModalClose = () => {
    setShowConfirmationModal(false);
    setConfirmedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-auto flex flex-col gap-4 items-center lg:items-start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setMonth(date);
                }
              }}
              disabled={(date) => date < today}
              month={month}
              onMonthChange={setMonth}
              className="border rounded-lg"
            />

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDate(today);
                  setMonth(today);
                }}
                className="w-full"
              >
                Today
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prevDay = addDays(selectedDate, -1);
                    setSelectedDate(prevDay);
                    setMonth(prevDay);
                  }}
                  className="w-full"
                  disabled={selectedDate <= today}
                >
                  Previous Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextDay = addDays(selectedDate, 1);
                    setSelectedDate(nextDay);
                    setMonth(nextDay);
                  }}
                  className="w-full"
                >
                  Next Day
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prevWeek = addDays(selectedDate, -7);
                    setSelectedDate(prevWeek);
                    setMonth(prevWeek);
                  }}
                  className="w-full"
                  disabled={addDays(selectedDate, -7) < today}
                >
                  Previous Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextWeek = addDays(selectedDate, 7);
                    setSelectedDate(nextWeek);
                    setMonth(nextWeek);
                  }}
                  className="w-full"
                >
                  Next Week
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1">
              <TimeSlot
              selectedDate={selectedDate}
              onSlotSelect={handleSlotSelect}
            />
          </div>
        </div>
      </main>

      <BookingModal
        isOpen={showBookingModal}
        onClose={handleBookingModalClose}
        selectedSlot={selectedSlot}
        selectedDate={selectedDate}
        onSuccess={handleBookingSuccess}
      />

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleConfirmationModalClose}
        appointment={confirmedAppointment}
      />
    </div>
  );
}
