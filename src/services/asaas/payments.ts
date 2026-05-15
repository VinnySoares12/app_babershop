import { callEdgeFunction } from "@/services/api/client";
import type { PaymentMethod } from "@/types/domain";

type CreatePaymentInput = {
  appointmentId: string;
  method: PaymentMethod;
  couponCode?: string;
  cashbackCents?: number;
};

type CreatePaymentResponse = {
  paymentId: string;
  status: string;
  invoiceUrl?: string;
  pixPayload?: string;
  pixQrCodeUrl?: string;
};

export function createAsaasPayment(input: CreatePaymentInput) {
  return callEdgeFunction<CreatePaymentResponse>("create-payment", input);
}

export function createAsaasSubscription(planId: string) {
  return callEdgeFunction<{ subscriptionId: string; status: string }>("create-subscription", { planId });
}
