import { BookingModal } from "./BookingModal";
import { CancelModal } from "./CancelModal";
import { ConfirmationModal } from "./ConfirmationModal";
import type { ModalState } from "@/hooks/useModals";

interface ModalProviderProps {
  modalState: ModalState;
  onBookingClose: () => void;
  onBookingSuccess: (appointment: any) => void;
  onConfirmationClose: () => void;
  onCancelClose: () => void;
}

export function ModalProvider({
  modalState,
  onBookingClose,
  onBookingSuccess,
  onConfirmationClose,
  onCancelClose
}: ModalProviderProps) {
  return (
    <>
      {/* Booking Modal */}
      {modalState.booking.isOpen && modalState.booking.data && (
        <BookingModal
          isOpen={modalState.booking.isOpen}
          onClose={onBookingClose}
          selectedSlot={modalState.booking.data.selectedSlot}
          selectedDate={modalState.booking.data.selectedDate}
          onSuccess={onBookingSuccess}
        />
      )}

      {/* Confirmation Modal */}
      {modalState.confirmation.isOpen && modalState.confirmation.data && (
        <ConfirmationModal
          isOpen={modalState.confirmation.isOpen}
          onClose={onConfirmationClose}
          appointment={modalState.confirmation.data.appointment}
        />
      )}

      {/* Cancel Modal */}
      {modalState.cancel.isOpen && modalState.cancel.data && (
        <CancelModal
          isOpen={modalState.cancel.isOpen}
          onClose={onCancelClose}
          appointmentId={modalState.cancel.data.appointmentId}
          customerName={modalState.cancel.data.customerName}
          time={modalState.cancel.data.time}
          date={modalState.cancel.data.date}
        />
      )}
    </>
  );
}