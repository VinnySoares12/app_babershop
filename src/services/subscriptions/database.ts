import { supabase } from "@/services/supabase/client";
import type { Database } from "@/services/supabase/database.types";
import type { PaymentRecord, SubscriptionCheckoutProfile, SubscriptionPlan, SubscriptionRecord } from "@/types/subscription";
import { benefitsFromJson } from "@/types/subscription";

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

function mapPlan(row: Database["public"]["Tables"]["plans"]["Row"]): SubscriptionPlan {
  return {
    id: row.id,
    shop_id: row.shop_id,
    name: row.name,
    tier: row.tier,
    description: row.description,
    price_cents: row.price_cents,
    cuts_per_cycle: row.cuts_per_cycle,
    cycle: row.cycle,
    benefits: benefitsFromJson(row.benefits),
    highlighted: row.tier.toLowerCase() === "premium" || row.tier.toLowerCase() === "vip",
  };
}

export async function listActivePlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from("plans")
    .select("id, shop_id, name, tier, description, price_cents, cuts_per_cycle, cycle, benefits, loyalty_multiplier, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("price_cents", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPlan);
}

export async function getCheckoutProfile(): Promise<SubscriptionCheckoutProfile | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, document, default_shop_id, asaas_customer_id")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as SubscriptionCheckoutProfile | null;
}

export async function getLatestSubscription(): Promise<SubscriptionRecord | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, profile_id, plan_id, shop_id, asaas_subscription_id, status, current_cycle_start, current_cycle_end, remaining_cuts, auto_renew, created_at, updated_at")
    .in("status", ["pending", "active", "past_due"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const subscription = data as SubscriptionRow;
  const { data: planRow, error: planError } = await supabase
    .from("plans")
    .select("id, shop_id, name, tier, description, price_cents, cuts_per_cycle, cycle, benefits, loyalty_multiplier, is_active, created_at, updated_at")
    .eq("id", subscription.plan_id)
    .maybeSingle();

  if (planError) {
    throw planError;
  }

  return {
    ...subscription,
    plan: planRow ? mapPlan(planRow) : null,
  };
}

export async function getPaymentById(paymentId: string): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from("payments")
    .select("id, profile_id, appointment_id, subscription_id, method, status, amount_cents, asaas_payment_id, asaas_invoice_url, pix_payload, pix_qr_code_url, due_date, paid_at, raw_provider_payload, created_at, updated_at")
    .eq("id", paymentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as PaymentRow | null) ?? null;
}
