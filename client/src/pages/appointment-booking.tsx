import { useState } from "react";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { Calendar } from "@/components/Calendar";
import { TimeSlotGrid } from "@/components/TimeSlotGrid";
import { BookingModal } from "@/components/BookingModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import type { TimeSlot } from "@shared/schema";

export default function AppointmentBooking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);

  const handleSlotSelect = (slot: TimeSlot) => {
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
      
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
          
          <div className="lg:col-span-2">
            <TimeSlotGrid
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
