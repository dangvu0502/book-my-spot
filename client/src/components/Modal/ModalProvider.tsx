import { BookingModal } from "./BookingModal";
import { CancelModal } from "./CancelModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { BookingDetailsModal } from "./BookingDetailsModal";
import { useModalStore } from "@/stores/modalStore";

export function ModalProvider() {
  const {
    isBookingOpen,
    isConfirmationOpen,
    isCancelOpen,
    isBookingDetailsOpen,
    bookingData,
    confirmationData,
    cancelData,
    bookingDetailsData,
    closeBookingModal,
    closeConfirmationModal,
    closeCancelModal,
    closeBookingDetailsModal
  } = useModalStore();

  return (
    <>
      {/* Booking Modal */}
      {isBookingOpen && bookingData && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={closeBookingModal}
          selectedSlot={bookingData.selectedSlot}
          selectedDate={bookingData.selectedDate}
        />
      )}

      {/* Confirmation Modal */}
      {isConfirmationOpen && confirmationData && (
        <ConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={closeConfirmationModal}
          appointment={confirmationData.appointment}
        />
      )}

      {/* Cancel Modal */}
      {isCancelOpen && cancelData && (
        <CancelModal
          isOpen={isCancelOpen}
          onClose={closeCancelModal}
          appointment={cancelData.appointment}
        />
      )}

      {/* Booking Details Modal */}
      {isBookingDetailsOpen && bookingDetailsData && (
        <BookingDetailsModal
          isOpen={isBookingDetailsOpen}
          onClose={closeBookingDetailsModal}
          appointment={bookingDetailsData.appointment}
        />
      )}
    </>
  );
}