import { useState } from "react";
import type { TimeSlot } from "@shared/schema";

// Modal types
export type ModalType = 'booking' | 'confirmation' | 'cancel' | 'bookingDetails';

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

export interface BookingDetailsModalData {
  appointment: {
    id: string;
    customerName: string;
    customerEmail: string;
    date: string;
    time: string;
    notes?: string;
    confirmationCode?: string;
    status: string;
  };
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
  bookingDetails: {
    isOpen: boolean;
    data: BookingDetailsModalData | null;
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
  },
  bookingDetails: {
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

  const openBookingDetailsModal = (appointment: BookingDetailsModalData['appointment']) => {
    openModal('bookingDetails', { appointment });
  };

  // Close specific modals
  const closeBookingModal = () => closeModal('booking');
  const closeConfirmationModal = () => closeModal('confirmation');
  const closeCancelModal = () => closeModal('cancel');
  const closeBookingDetailsModal = () => closeModal('bookingDetails');

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
    openBookingDetailsModal,
    closeBookingModal,
    closeConfirmationModal,
    closeCancelModal,
    closeBookingDetailsModal,

    // Convenience getters
    isBookingOpen: modalState.booking.isOpen,
    isConfirmationOpen: modalState.confirmation.isOpen,
    isCancelOpen: modalState.cancel.isOpen,
    isBookingDetailsOpen: modalState.bookingDetails.isOpen,

    bookingData: modalState.booking.data,
    confirmationData: modalState.confirmation.data,
    cancelData: modalState.cancel.data,
    bookingDetailsData: modalState.bookingDetails.data
  };
}