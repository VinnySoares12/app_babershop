import { supabase } from "@/services/supabase/client";
import type { Database } from "@/services/supabase/database.types";
import {
  getNotificationKind,
  type LoyaltySummary,
  type NotificationItem,
  type RecentHistoryItem,
} from "@/types/notifications";

type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
type NotificationRow = Database["public"]["Tables"]["notification_events"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];

type AppointmentServiceJoinRow = {
  appointment_id: string;
  service_id: string;
  services: {
    name: string;
  } | null;
};

function formatDateLabel(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(parsed);
}

function buildHistoryTitle(serviceNames: string[]) {
  if (!serviceNames.length) {
    return "Atendimento pago";
  }

  return serviceNames.join(" + ");
}

export async function getUnreadNotificationsCount(): Promise<number> {
  const { count, error } = await supabase
    .from("notification_events")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function listNotifications(): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from("notification_events")
    .select("id, profile_id, shop_id, title, body, kind, data, read_at, sent_at, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    ...(item as NotificationRow),
    uiKind: getNotificationKind(item.kind, item.data),
  }));
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notification_events")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .is("read_at", null);

  if (error) {
    throw error;
  }
}

export async function getLoyaltySummary(): Promise<LoyaltySummary | null> {
  const { data, error } = await supabase
    .from("loyalty_accounts")
    .select("cashback_cents, points, vip_level")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as LoyaltySummary | null) ?? null;
}

export async function listRecentHistory(): Promise<RecentHistoryItem[]> {
  const { data: payments, error: paymentError } = await supabase
    .from("payments")
    .select("id, appointment_id, amount_cents, status, created_at")
    .eq("status", "paid")
    .not("appointment_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(5);

  if (paymentError) {
    throw paymentError;
  }

  const paidPayments = (payments ?? []) as Pick<PaymentRow, "id" | "appointment_id" | "amount_cents" | "status" | "created_at">[];
  const appointmentIds = paidPayments
    .map((item) => item.appointment_id)
    .filter((value): value is string => Boolean(value));

  if (!appointmentIds.length) {
    return [];
  }

  const [{ data: appointments, error: appointmentError }, { data: appointmentServices, error: appointmentServicesError }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, total_cents, created_at, status")
      .in("id", appointmentIds),
    supabase
      .from("appointment_services")
      .select("appointment_id, service_id, services(name)")
      .in("appointment_id", appointmentIds),
  ]);

  if (appointmentError) {
    throw appointmentError;
  }

  if (appointmentServicesError) {
    throw appointmentServicesError;
  }

  const appointmentMap = new Map(
    ((appointments ?? []) as Pick<AppointmentRow, "id" | "total_cents" | "created_at" | "status">[])
      .map((item) => [item.id, item]),
  );

  const serviceNamesByAppointment = new Map<string, string[]>();

  for (const item of (appointmentServices ?? []) as AppointmentServiceJoinRow[]) {
    const current = serviceNamesByAppointment.get(item.appointment_id) ?? [];

    if (item.services?.name) {
      current.push(item.services.name);
    }

    serviceNamesByAppointment.set(item.appointment_id, current);
  }

  return paidPayments.map((payment) => {
    const appointment = appointmentMap.get(payment.appointment_id as string);
    const serviceNames = serviceNamesByAppointment.get(payment.appointment_id as string) ?? [];
    const createdAt = appointment?.created_at ?? payment.created_at;

    return {
      id: payment.id,
      title: buildHistoryTitle(serviceNames),
      subtitle: `Pago em ${formatDateLabel(createdAt)}`,
      amountCents: appointment?.total_cents ?? payment.amount_cents,
      statusLabel: "Pago",
      createdAt,
    };
  });
}
