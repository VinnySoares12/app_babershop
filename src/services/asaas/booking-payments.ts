import { callEdgeFunction } from "@/services/api/client";
import type { CreateBookingPaymentInput, CreateBookingPaymentResponse } from "@/types/payments";

export function createBookingPayment(input: CreateBookingPaymentInput) {
  return callEdgeFunction<CreateBookingPaymentResponse>("create-payment", input);
}
