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
  setField: <K extends keyof Omit<BookingState, "setField" | "reset">>(key: K, value: BookingState[K]) => void;
  confirmBooking: (booking: ConfirmedBooking) => void;
  reset: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  paymentMethod: "pix",
  setField: (key, value) => set({ [key]: value }),
  confirmBooking: (booking) => set({ confirmedBooking: booking }),
  reset: () => set({ shopId: undefined, barberId: undefined, serviceId: undefined, date: undefined, time: undefined, paymentMethod: "pix" }),
}));
