import type { PaymentStatus, SubscriptionStatus } from "@/types/subscription";

export function formatPaymentStatus(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "Pago";
    case "pending":
      return "Aguardando pagamento";
    case "overdue":
      return "Vencido";
    case "authorized":
      return "Autorizado";
    case "analyzing":
      return "Em análise";
    case "canceled":
      return "Cancelado";
    case "failed":
      return "Falhou";
    case "refunded":
      return "Reembolsado";
    case "refund_denied":
      return "Estorno negado";
    case "chargeback":
      return "Chargeback";
    default:
      return status;
  }
}

export function formatSubscriptionStatus(status: SubscriptionStatus) {
  switch (status) {
    case "active":
      return "Ativa";
    case "pending":
      return "Pendente";
    case "past_due":
      return "Pagamento em atraso";
    case "canceled":
      return "Cancelada";
    case "expired":
      return "Expirada";
    default:
      return status;
  }
}

export function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}
