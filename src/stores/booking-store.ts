import { create } from "zustand";
import type { PaymentMethod } from "@/types/domain";

export type ConfirmedBooking = {
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  totalCents: number;
};

type BookingState = {
  shopId?: string;
  barberId?: string;
  serviceId?: string;
  date?: string;
  time?: string;
  paymentMethod: PaymentMethod;
  confirmedBooking?: ConfirmedBooking;
  bookedTimeIds: string[];
  setField: <K extends keyof Omit<BookingState, "setField" | "confirmBooking" | "reset">>(key: K, value: BookingState[K]) => void;
  confirmBooking: (booking: ConfirmedBooking) => void;
  reset: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  paymentMethod: "pix",
  bookedTimeIds: [],
  setField: (key, value) => set({ [key]: value }),
  confirmBooking: (booking) =>
    set((state) => {
      const previousTime = state.confirmedBooking?.time;
      const bookedTimeIds = state.bookedTimeIds.filter((timeId) => timeId !== previousTime);

      return {
        confirmedBooking: booking,
        time: undefined,
        bookedTimeIds: bookedTimeIds.includes(booking.time) ? bookedTimeIds : [...bookedTimeIds, booking.time],
      };
    }),
  reset: () =>
    set({
      shopId: undefined,
      barberId: undefined,
      serviceId: undefined,
      date: undefined,
      time: undefined,
      paymentMethod: "pix",
    }),
}));
