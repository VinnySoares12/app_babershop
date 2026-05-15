import { create } from "zustand";
import type { PaymentMethod } from "@/types/domain";

export type ConfirmedBooking = {
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  totalCents: number;
};

export function getBookingSlotId({ barberId, date, time }: Pick<ConfirmedBooking, "barberId" | "date" | "time">) {
  return `${barberId}|${date}|${time}`;
}

type BookingState = {
  shopId?: string;
  barberId?: string;
  serviceId?: string;
  date?: string;
  time?: string;
  paymentMethod: PaymentMethod;
  confirmedBooking?: ConfirmedBooking;
  bookedSlotIds: string[];
  setField: <K extends keyof Omit<BookingState, "setField" | "confirmBooking" | "reset">>(key: K, value: BookingState[K]) => void;
  confirmBooking: (booking: ConfirmedBooking) => void;
  reset: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  paymentMethod: "pix",
  bookedSlotIds: [],
  setField: (key, value) => set({ [key]: value }),
  confirmBooking: (booking) =>
    set((state) => {
      const previousSlotId = state.confirmedBooking ? getBookingSlotId(state.confirmedBooking) : undefined;
      const nextSlotId = getBookingSlotId(booking);
      const bookedSlotIds = state.bookedSlotIds.filter((slotId) => slotId !== previousSlotId);

      return {
        confirmedBooking: booking,
        time: undefined,
        bookedSlotIds: bookedSlotIds.includes(nextSlotId) ? bookedSlotIds : [...bookedSlotIds, nextSlotId],
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
