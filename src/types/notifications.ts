import type { Database, Json } from "@/services/supabase/database.types";

type NotificationRow = Database["public"]["Tables"]["notification_events"]["Row"];
type LoyaltyAccountRow = Database["public"]["Tables"]["loyalty_accounts"]["Row"];

export type NotificationKind = "cashback" | "pix_confirmed" | "campaign" | "generic";

export type NotificationItem = NotificationRow & {
  uiKind: NotificationKind;
};

export type RecentHistoryItem = {
  id: string;
  title: string;
  subtitle: string;
  amountCents: number;
  statusLabel: string;
  createdAt: string;
};

export type LoyaltySummary = Pick<LoyaltyAccountRow, "cashback_cents" | "points" | "vip_level">;

export function getNotificationKind(kind: string, data: Json): NotificationKind {
  const normalizedKind = kind.toLowerCase();
  const normalizedData = typeof data === "object" && data && !Array.isArray(data)
    ? JSON.stringify(data).toLowerCase()
    : "";

  if (normalizedKind.includes("cashback") || normalizedData.includes("cashback")) {
    return "cashback";
  }

  if (
    normalizedKind.includes("pix")
    || normalizedKind.includes("payment_paid")
    || normalizedData.includes("pix")
    || normalizedData.includes("payment_paid")
  ) {
    return "pix_confirmed";
  }

  if (
    normalizedKind.includes("campaign")
    || normalizedKind.includes("promo")
    || normalizedKind.includes("banner")
    || normalizedData.includes("campaign")
    || normalizedData.includes("promo")
  ) {
    return "campaign";
  }

  return "generic";
}
