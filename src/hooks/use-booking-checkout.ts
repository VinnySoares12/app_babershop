import { useMutation } from "@tanstack/react-query";
import { createBookingPayment } from "@/services/asaas/booking-payments";

export function useCreateBookingPayment() {
  return useMutation({
    mutationFn: createBookingPayment,
  });
}
