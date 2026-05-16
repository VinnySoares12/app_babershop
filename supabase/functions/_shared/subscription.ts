export type PaymentDatabaseStatus =
  | "pending"
  | "analyzing"
  | "authorized"
  | "paid"
  | "overdue"
  | "failed"
  | "canceled"
  | "refunded"
  | "refund_denied"
  | "chargeback";

export type SubscriptionDatabaseStatus = "pending" | "active" | "past_due" | "canceled" | "expired";

export function mapAsaasStatusToPaymentStatus(status?: string): PaymentDatabaseStatus {
  switch ((status || "").toUpperCase()) {
    case "RECEIVED":
    case "CONFIRMED":
    case "RECEIVED_IN_CASH":
      return "paid";
    case "OVERDUE":
      return "overdue";
    case "REFUNDED":
      return "refunded";
    case "REFUND_REQUESTED":
    case "REFUND_IN_PROGRESS":
    case "PARTIALLY_REFUNDED":
      return "refund_denied";
    case "CHARGEBACK_REQUESTED":
    case "CHARGEBACK_DISPUTE":
    case "AWAITING_CHARGEBACK_REVERSAL":
    case "DUNNING_REQUESTED":
      return "chargeback";
    case "AUTHORIZED":
      return "authorized";
    case "PENDING":
      return "pending";
    case "CANCELED":
      return "canceled";
    case "FAILED":
      return "failed";
    default:
      return "pending";
  }
}

export function mapWebhookEventToPaymentStatus(event?: string, fallbackStatus?: string): PaymentDatabaseStatus {
  switch ((event || "").toUpperCase()) {
    case "PAYMENT_RECEIVED":
    case "PAYMENT_CONFIRMED":
      return "paid";
    case "PAYMENT_OVERDUE":
      return "overdue";
    case "PAYMENT_DELETED":
      return "canceled";
    case "PAYMENT_REFUNDED":
      return "refunded";
    case "PAYMENT_CHARGEBACK_REQUESTED":
    case "PAYMENT_AWAITING_CHARGEBACK_REVERSAL":
      return "chargeback";
    default:
      return mapAsaasStatusToPaymentStatus(fallbackStatus);
  }
}

export function mapPaymentToSubscriptionStatus(
  paymentStatus: PaymentDatabaseStatus,
): SubscriptionDatabaseStatus {
  switch (paymentStatus) {
    case "paid":
      return "active";
    case "overdue":
      return "past_due";
    case "canceled":
    case "failed":
    case "refunded":
    case "refund_denied":
    case "chargeback":
      return "canceled";
    default:
      return "pending";
  }
}

export function addMonthlyCycle(startDate: Date): { cycleStart: string; cycleEnd: string } {
  const cycleStartDate = new Date(Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  ));

  const cycleEndDate = new Date(cycleStartDate);
  cycleEndDate.setUTCMonth(cycleEndDate.getUTCMonth() + 1);
  cycleEndDate.setUTCDate(cycleEndDate.getUTCDate() - 1);

  return {
    cycleStart: cycleStartDate.toISOString().slice(0, 10),
    cycleEnd: cycleEndDate.toISOString().slice(0, 10),
  };
}
