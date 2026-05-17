import type { Database } from "@/services/supabase/database.types";

export type CheckoutMethod = "PIX" | "CREDIT_CARD";
export type PaymentStatus = Database["public"]["Tables"]["payments"]["Row"]["status"];

export type CustomerCheckoutInfo = {
  fullName: string;
  email: string;
  phone: string;
  document: string;
};

export type CheckoutPaymentView = Pick<
  Database["public"]["Tables"]["payments"]["Row"],
  "id" | "status" | "method" | "asaas_invoice_url" | "pix_payload" | "pix_qr_code_url"
>;

export type CreateBookingPaymentInput = {
  amount: number;
  description: string;
  method: CheckoutMethod;
  customer: CustomerCheckoutInfo;
  metadata: {
    barberId: string;
    serviceId: string;
    bookingDate: string;
    bookingTime: string;
  };
};

export type CreateBookingPaymentResponse = {
  paymentId: string;
  method: CheckoutMethod;
  status: PaymentStatus;
  invoiceUrl: string | null;
  pixPayload: string | null;
  pixQrCodeUrl: string | null;
  pixQrCodeBase64: string | null;
  expiresAt: string | null;
};
