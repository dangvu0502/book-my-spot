import { useState } from "react";
import type { TimeSlot } from "@shared/schema";

// Modal types
export type ModalType = 'booking' | 'confirmation' | 'cancel';

// Modal data interfaces
export interface BookingModalData {
  selectedSlot: TimeSlot | null;
  selectedDate: Date;
}

export interface ConfirmationModalData {
  appointment: any;
}

export interface CancelModalData {
  appointmentId: string;
  customerName: string;
  time: string;
  date: string;
}

// Modal state interface
export interface ModalState {
  booking: {
    isOpen: boolean;
    data: BookingModalData | null;
  };
  confirmation: {
    isOpen: boolean;
    data: ConfirmationModalData | null;
  };
  cancel: {
    isOpen: boolean;
    data: CancelModalData | null;
  };
}

const initialState: ModalState = {
  booking: {
    isOpen: false,
    data: null
  },
  confirmation: {
    isOpen: false,
    data: null
  },
  cancel: {
    isOpen: false,
    data: null
  }
};

export function useModals() {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  // Generic modal actions
  const openModal = <T extends ModalType>(type: T, data: ModalState[T]['data']) => {
    setModalState(prev => ({
      ...prev,
      [type]: {
        isOpen: true,
        data
      }
    }));
  };

  const closeModal = (type: ModalType) => {
    setModalState(prev => ({
      ...prev,
      [type]: {
        isOpen: false,
        data: null
      }
    }));
  };

  const closeAllModals = () => {
    setModalState(initialState);
  };

  // Specific modal actions
  const openBookingModal = (selectedSlot: TimeSlot, selectedDate: Date) => {
    openModal('booking', { selectedSlot, selectedDate });
  };

  const openConfirmationModal = (appointment: any) => {
    openModal('confirmation', { appointment });
  };

  const openCancelModal = (appointmentId: string, customerName: string, time: string, date: string) => {
    openModal('cancel', { appointmentId, customerName, time, date });
  };

  // Close specific modals
  const closeBookingModal = () => closeModal('booking');
  const closeConfirmationModal = () => closeModal('confirmation');
  const closeCancelModal = () => closeModal('cancel');

  return {
    // State
    modalState,

    // Generic actions
    openModal,
    closeModal,
    closeAllModals,

    // Specific actions
    openBookingModal,
    openConfirmationModal,
    openCancelModal,
    closeBookingModal,
    closeConfirmationModal,
    closeCancelModal,

    // Convenience getters
    isBookingOpen: modalState.booking.isOpen,
    isConfirmationOpen: modalState.confirmation.isOpen,
    isCancelOpen: modalState.cancel.isOpen,

    bookingData: modalState.booking.data,
    confirmationData: modalState.confirmation.data,
    cancelData: modalState.cancel.data
  };
}