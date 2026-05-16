import { useMutation, useQuery } from "@tanstack/react-query";
import { createAsaasPayment } from "@/services/asaas/payments";
import {
  getCheckoutProfile,
  getLatestSubscription,
  getPaymentById,
} from "@/services/subscriptions/database";

export function useCheckoutProfile() {
  return useQuery({
    queryKey: ["subscription", "checkout-profile"],
    queryFn: getCheckoutProfile,
  });
}

export function useLatestSubscription() {
  return useQuery({
    queryKey: ["subscription", "latest"],
    queryFn: getLatestSubscription,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "past_due" ? 10000 : false;
    },
  });
}

export function useCreateSubscriptionPayment() {
  return useMutation({
    mutationFn: createAsaasPayment,
  });
}

export function usePaymentStatus(paymentId: string | null) {
  return useQuery({
    queryKey: ["subscription", "payment", paymentId],
    queryFn: () => getPaymentById(paymentId as string),
    enabled: Boolean(paymentId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "paid" || status === "canceled" || status === "failed" ? false : 10000;
    },
  });
}
