import type { Database, Json } from "@/services/supabase/database.types";

type PlanRow = Database["public"]["Tables"]["plans"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

export type SubscriptionPlan = Pick<
  PlanRow,
  "id" | "shop_id" | "name" | "tier" | "description" | "price_cents" | "cuts_per_cycle" | "cycle"
> & {
  benefits: string[];
  highlighted?: boolean;
};

export type SubscriptionStatus = SubscriptionRow["status"];
export type PaymentStatus = PaymentRow["status"];
export type SubscriptionCheckoutMethod = "PIX" | "CREDIT_CARD";

export type CustomerCheckoutInfo = {
  fullName: string;
  email: string;
  phone: string;
  document: string;
};

export type SubscriptionRecord = SubscriptionRow & {
  plan?: SubscriptionPlan | null;
};

export type PaymentRecord = PaymentRow;
export type CheckoutPaymentView = Pick<
  PaymentRow,
  "id" | "status" | "method" | "asaas_invoice_url" | "pix_payload" | "pix_qr_code_url"
>;

export type SubscriptionCheckoutProfile = Pick<
  ProfileRow,
  "id" | "full_name" | "email" | "phone" | "document" | "default_shop_id" | "asaas_customer_id"
>;

export type CreateSubscriptionPaymentInput = {
  planId: string;
  amount: number;
  description: string;
  method: SubscriptionCheckoutMethod;
  customer: CustomerCheckoutInfo;
};

export type CreateSubscriptionPaymentResponse = {
  paymentId: string;
  subscriptionId: string;
  method: SubscriptionCheckoutMethod;
  status: PaymentStatus;
  invoiceUrl: string | null;
  pixPayload: string | null;
  pixQrCodeUrl: string | null;
  pixQrCodeBase64: string | null;
  expiresAt: string | null;
};

export function benefitsFromJson(value: Json): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}
