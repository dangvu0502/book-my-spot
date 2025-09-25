import { create } from 'zustand';
import type { TimeSlot, Appointment } from '@shared/schema';

// Modal data interfaces
export interface BookingModalData {
  selectedSlot: TimeSlot;
  selectedDate: Date;
}

export interface ConfirmationModalData {
  appointment: Appointment;
}

export interface CancelModalData {
  appointment: Appointment;
}

export interface BookingDetailsModalData {
  appointment: Appointment;
}

interface ModalStore {
  // Modal states
  isBookingOpen: boolean;
  isConfirmationOpen: boolean;
  isCancelOpen: boolean;
  isBookingDetailsOpen: boolean;

  // Modal data
  bookingData: BookingModalData | null;
  confirmationData: ConfirmationModalData | null;
  cancelData: CancelModalData | null;
  bookingDetailsData: BookingDetailsModalData | null;

  // Actions
  openBookingModal: (slot: TimeSlot, date: Date) => void;
  openConfirmationModal: (appointment: Appointment) => void;
  openCancelModal: (appointment: Appointment) => void;
  openBookingDetailsModal: (appointment: Appointment) => void;

  closeBookingModal: () => void;
  closeConfirmationModal: () => void;
  closeCancelModal: () => void;
  closeBookingDetailsModal: () => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  // Initial states
  isBookingOpen: false,
  isConfirmationOpen: false,
  isCancelOpen: false,
  isBookingDetailsOpen: false,

  bookingData: null,
  confirmationData: null,
  cancelData: null,
  bookingDetailsData: null,

  // Actions
  openBookingModal: (slot, date) => set({
    isBookingOpen: true,
    bookingData: { selectedSlot: slot, selectedDate: date }
  }),

  openConfirmationModal: (appointment) => set({
    isConfirmationOpen: true,
    confirmationData: { appointment }
  }),

  openCancelModal: (appointment) => set({
    isCancelOpen: true,
    cancelData: { appointment }
  }),

  openBookingDetailsModal: (appointment) => set({
    isBookingDetailsOpen: true,
    bookingDetailsData: { appointment }
  }),

  closeBookingModal: () => set({
    isBookingOpen: false,
    bookingData: null
  }),

  closeConfirmationModal: () => set({
    isConfirmationOpen: false,
    confirmationData: null
  }),

  closeCancelModal: () => set({
    isCancelOpen: false,
    cancelData: null
  }),

  closeBookingDetailsModal: () => set({
    isBookingDetailsOpen: false,
    bookingDetailsData: null
  }),

  closeAllModals: () => set({
    isBookingOpen: false,
    isConfirmationOpen: false,
    isCancelOpen: false,
    isBookingDetailsOpen: false,
    bookingData: null,
    confirmationData: null,
    cancelData: null,
    bookingDetailsData: null
  })
}));