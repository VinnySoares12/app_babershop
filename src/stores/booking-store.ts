import { create } from "zustand";
import type { AppointmentStatus, PaymentMethod } from "@/types/domain";
import type { SeededAppointment } from "@/lib/booking";

export type ConfirmedBooking = {
  id: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  totalCents: number;
  durationMinutes: number;
  bufferAfterMinutes: number;
  paymentMethod?: PaymentMethod;
  status: AppointmentStatus;
};

type BookingState = {
  shopId?: string;
  barberId?: string;
  serviceId?: string;
  date?: string;
  time?: string;
  paymentMethod: PaymentMethod;
  confirmedBooking?: ConfirmedBooking;
  bookedAppointments: SeededAppointment[];
  setField: <K extends keyof Omit<BookingState, "setField" | "confirmBooking" | "reset">>(key: K, value: BookingState[K]) => void;
  confirmBooking: (booking: ConfirmedBooking) => void;
  finalizePayment: (method: PaymentMethod) => void;
  reset: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  paymentMethod: "pix",
  bookedAppointments: [],
  setField: (key, value) => set({ [key]: value }),
  confirmBooking: (booking) =>
    set((state) => {
      const bookedAppointments = state.bookedAppointments.filter((appointment) => appointment.id !== state.confirmedBooking?.id);
      const nextAppointment: SeededAppointment = {
        id: booking.id,
        barberId: booking.barberId,
        date: booking.date,
        startTime: booking.time,
        durationMinutes: booking.durationMinutes,
        bufferAfterMinutes: booking.bufferAfterMinutes,
      };

      return {
        confirmedBooking: booking,
        time: undefined,
        bookedAppointments: [...bookedAppointments, nextAppointment],
      };
    }),
  finalizePayment: (method) =>
    set((state) => ({
      paymentMethod: method,
      confirmedBooking: state.confirmedBooking
        ? {
            ...state.confirmedBooking,
            paymentMethod: method,
            status: "confirmed",
          }
        : undefined,
    })),
  reset: () =>
    set({
      shopId: undefined,
      barberId: undefined,
      serviceId: undefined,
      date: undefined,
      time: undefined,
      paymentMethod: "pix",
      confirmedBooking: undefined,
      bookedAppointments: [],
    }),
}));
