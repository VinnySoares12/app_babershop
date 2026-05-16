import { callEdgeFunction } from "@/services/api/client";
import type {
  CreateSubscriptionPaymentInput,
  CreateSubscriptionPaymentResponse,
} from "@/types/subscription";

export function createAsaasPayment(input: CreateSubscriptionPaymentInput) {
  return callEdgeFunction<CreateSubscriptionPaymentResponse>("create-payment", input);
}
