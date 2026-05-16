import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import type { PostgrestError } from "npm:@supabase/supabase-js@2.49.8";
import { corsHeaders } from "../_shared/cors.ts";
import { getRequiredEnv } from "../_shared/env.ts";
import { errorResponse, jsonResponse } from "../_shared/http.ts";
import {
  addMonthlyCycle,
  mapPaymentToSubscriptionStatus,
  mapWebhookEventToPaymentStatus,
} from "../_shared/subscription.ts";
import type { AsaasWebhookPayload } from "../_shared/asaas.ts";

function buildEventKey(payload: AsaasWebhookPayload): string {
  const paymentId = payload.payment?.id ?? "unknown-payment";
  const status = payload.payment?.status ?? "unknown-status";
  const dateCreated = payload.payment?.dateCreated ?? "unknown-date";
  return `${payload.event}:${paymentId}:${status}:${dateCreated}`;
}

function extractPaidAt(payload: AsaasWebhookPayload): string | null {
  const paymentDate = payload.payment?.paymentDate;
  return paymentDate ? new Date(paymentDate).toISOString() : null;
}

async function activateSubscription(
  supabase: ReturnType<typeof createClient>,
  subscriptionId: string,
  paymentRow: {
    id: string;
    profile_id: string;
  },
) {
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("id, profile_id, plan_id, shop_id, current_cycle_end, status")
    .eq("id", subscriptionId)
    .single();

  if (subscriptionError || !subscription) {
    throw subscriptionError ?? new Error("Subscription not found");
  }

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id, cuts_per_cycle")
    .eq("id", subscription.plan_id)
    .single();

  if (planError || !plan) {
    throw planError ?? new Error("Subscription plan not found");
  }

  const now = new Date();
  const cycle = addMonthlyCycle(now);

  const { error: deactivateOthersError } = await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("profile_id", paymentRow.profile_id)
    .neq("id", subscription.id)
    .in("status", ["active", "past_due", "pending"]);

  if (deactivateOthersError) {
    console.error("Failed to deactivate previous subscriptions", deactivateOthersError);
  }

  const { error: activateError } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      current_cycle_start: cycle.cycleStart,
      current_cycle_end: cycle.cycleEnd,
      remaining_cuts: plan.cuts_per_cycle,
    })
    .eq("id", subscription.id);

  if (activateError) {
    throw activateError;
  }
}

async function updateSubscriptionFromPayment(
  supabase: ReturnType<typeof createClient>,
  subscriptionId: string | null,
  paymentStatus: ReturnType<typeof mapWebhookEventToPaymentStatus>,
  paymentRow: {
    id: string;
    profile_id: string;
  },
) {
  if (!subscriptionId) {
    return;
  }

  if (paymentStatus === "paid") {
    await activateSubscription(supabase, subscriptionId, paymentRow);
    return;
  }

  const nextSubscriptionStatus = mapPaymentToSubscriptionStatus(paymentStatus);

  if (nextSubscriptionStatus === "pending") {
    return;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: nextSubscriptionStatus })
    .eq("id", subscriptionId);

  if (error) {
    throw error;
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return errorResponse(405, "Method not allowed");
  }

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseServiceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const webhookToken = getRequiredEnv("ASAAS_WEBHOOK_TOKEN");

    const receivedToken = request.headers.get("asaas-access-token");

    if (!receivedToken || receivedToken !== webhookToken) {
      return errorResponse(401, "Invalid webhook token");
    }

    const payload = (await request.json().catch(() => null)) as AsaasWebhookPayload | null;

    if (!payload?.event || !payload.payment?.id) {
      return errorResponse(400, "Invalid webhook payload");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const providerEventId = buildEventKey(payload);
    const insertWebhookResult = await supabase
      .from("webhook_events")
      .insert({
        provider: "asaas",
        provider_event_id: providerEventId,
        event_type: payload.event,
        payload,
      });

    const webhookError = insertWebhookResult.error as PostgrestError | null;

    if (webhookError && webhookError.code === "23505") {
      return jsonResponse({ ok: true, duplicate: true });
    }

    if (webhookError) {
      console.error("Failed to persist webhook event", webhookError);
      return errorResponse(500, "Failed to persist webhook event");
    }

    const { data: paymentRow, error: paymentLookupError } = await supabase
      .from("payments")
      .select("id, profile_id, subscription_id, raw_provider_payload")
      .eq("asaas_payment_id", payload.payment.id)
      .maybeSingle();

    if (paymentLookupError) {
      console.error("Failed to locate payment", paymentLookupError);
      return errorResponse(500, "Failed to locate payment");
    }

    if (!paymentRow) {
      return jsonResponse({ ok: true, ignored: true, reason: "payment_not_found" });
    }

    const nextPaymentStatus = mapWebhookEventToPaymentStatus(payload.event, payload.payment.status);

    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: nextPaymentStatus,
        paid_at: extractPaidAt(payload),
        due_date: payload.payment.dueDate ?? null,
        asaas_invoice_url: payload.payment.invoiceUrl ?? null,
        raw_provider_payload: {
          previous: paymentRow.raw_provider_payload,
          latestWebhook: payload,
        },
      })
      .eq("id", paymentRow.id);

    if (paymentUpdateError) {
      console.error("Failed to update payment", paymentUpdateError);
      return errorResponse(500, "Failed to update payment");
    }

    await updateSubscriptionFromPayment(
      supabase,
      paymentRow.subscription_id,
      nextPaymentStatus,
      {
        id: paymentRow.id,
        profile_id: paymentRow.profile_id,
      },
    );

    const { error: markProcessedError } = await supabase
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("provider", "asaas")
      .eq("provider_event_id", providerEventId);

    if (markProcessedError) {
      console.error("Failed to mark webhook as processed", markProcessedError);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("asaas-webhook unexpected error", error);
    return errorResponse(500, "Unexpected error while processing Asaas webhook", error instanceof Error ? error.message : error);
  }
});
