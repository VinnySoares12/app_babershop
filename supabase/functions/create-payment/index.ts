import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import { z } from "npm:zod@3.24.3";
import {
  asaasRequest,
  normalizeDocument,
  normalizePhone,
  toAsaasCurrency,
  type AsaasCustomerPayload,
  type AsaasCustomerResponse,
  type AsaasPaymentPayload,
  type AsaasPaymentResponse,
  type AsaasPixQrCodeResponse,
} from "../_shared/asaas.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getRequiredEnv } from "../_shared/env.ts";
import { errorResponse, jsonResponse } from "../_shared/http.ts";
import { mapAsaasStatusToPaymentStatus } from "../_shared/subscription.ts";

const bodySchema = z.object({
  planId: z.string().uuid(),
  amount: z.number().int().positive(),
  description: z.string().trim().min(3).max(255),
  method: z.enum(["PIX", "CREDIT_CARD"]).default("PIX"),
  customer: z.object({
    fullName: z.string().trim().min(3),
    email: z.string().trim().email(),
    phone: z.string().trim().min(10),
    document: z.string().trim().min(11),
  }),
});

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
    const asaasApiKey = getRequiredEnv("ASAAS_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return errorResponse(401, "Missing authorization token");
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return errorResponse(401, "Invalid or expired session");
    }

    const rawBody = await request.json().catch(() => null);
    const parsedBody = bodySchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return errorResponse(400, "Invalid payload", parsedBody.error.flatten());
    }

    const input = parsedBody.data;

    const [{ data: plan, error: planError }, { data: profile, error: profileError }] = await Promise.all([
      supabase
        .from("plans")
        .select("id, shop_id, name, tier, description, price_cents, cuts_per_cycle, cycle, is_active")
        .eq("id", input.planId)
        .eq("is_active", true)
        .single(),
      supabase
        .from("profiles")
        .select("id, full_name, email, phone, document, asaas_customer_id")
        .eq("id", userData.user.id)
        .single(),
    ]);

    if (planError || !plan) {
      return errorResponse(404, "Selected plan not found");
    }

    if (profileError || !profile) {
      return errorResponse(404, "User profile not found");
    }

    if (input.amount !== plan.price_cents) {
      return errorResponse(400, "Plan amount mismatch");
    }

    const normalizedPhone = normalizePhone(input.customer.phone || profile.phone || "");
    const normalizedDocument = normalizeDocument(input.customer.document || profile.document || "");

    if (!normalizedPhone || !normalizedDocument) {
      return errorResponse(400, "CPF/CNPJ and phone are required to generate the charge");
    }

    let asaasCustomerId = profile.asaas_customer_id;

    if (!asaasCustomerId) {
      const customerPayload: AsaasCustomerPayload = {
        name: input.customer.fullName || profile.full_name,
        cpfCnpj: normalizedDocument,
        email: input.customer.email || profile.email || undefined,
        mobilePhone: normalizedPhone,
        externalReference: profile.id,
        notificationDisabled: true,
      };

      const customerResponse = await asaasRequest<AsaasCustomerResponse>(asaasApiKey, "/customers", {
        method: "POST",
        body: JSON.stringify(customerPayload),
      });

      asaasCustomerId = customerResponse.id;

      const { error: updateCustomerError } = await supabase
        .from("profiles")
        .update({
          asaas_customer_id: asaasCustomerId,
          full_name: input.customer.fullName || profile.full_name,
          email: input.customer.email || profile.email,
          phone: normalizedPhone,
          document: normalizedDocument,
        })
        .eq("id", profile.id);

      if (updateCustomerError) {
        console.error("Failed to update profile with Asaas customer id", updateCustomerError);
      }
    } else {
      await asaasRequest<AsaasCustomerResponse>(asaasApiKey, `/customers/${asaasCustomerId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: input.customer.fullName || profile.full_name,
          cpfCnpj: normalizedDocument,
          email: input.customer.email || profile.email || undefined,
          mobilePhone: normalizedPhone,
          externalReference: profile.id,
          notificationDisabled: true,
        } satisfies AsaasCustomerPayload),
      });

      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          full_name: input.customer.fullName || profile.full_name,
          email: input.customer.email || profile.email,
          phone: normalizedPhone,
          document: normalizedDocument,
        })
        .eq("id", profile.id);

      if (updateProfileError) {
        console.error("Failed to sync customer profile fields", updateProfileError);
      }
    }

    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("id, status, plan_id")
      .eq("profile_id", profile.id)
      .in("status", ["pending", "active", "past_due"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let subscriptionId = existingSubscription?.status === "pending" && existingSubscription.plan_id === plan.id
      ? existingSubscription.id
      : null;

    if (!subscriptionId) {
      const { data: insertedSubscription, error: subscriptionInsertError } = await supabase
        .from("subscriptions")
        .insert({
          profile_id: profile.id,
          plan_id: plan.id,
          shop_id: plan.shop_id,
          status: "pending",
          remaining_cuts: 0,
          auto_renew: true,
        })
        .select("id")
        .single();

      if (subscriptionInsertError || !insertedSubscription) {
        console.error("Failed to initialize subscription", subscriptionInsertError);
        return errorResponse(500, "Could not initialize subscription");
      }

      subscriptionId = insertedSubscription.id;
    }

    if (!subscriptionId) {
      return errorResponse(500, "Could not initialize subscription");
    }

    const dueDate = new Date();
    dueDate.setUTCDate(dueDate.getUTCDate() + 1);

    const paymentPayload: AsaasPaymentPayload = {
      customer: asaasCustomerId,
      billingType: input.method,
      value: toAsaasCurrency(plan.price_cents),
      dueDate: dueDate.toISOString().slice(0, 10),
      description: input.description,
      externalReference: subscriptionId,
    };

    const paymentResponse = await asaasRequest<AsaasPaymentResponse>(asaasApiKey, "/payments", {
      method: "POST",
      body: JSON.stringify(paymentPayload),
    });

    const pixQrCodeResponse = input.method === "PIX"
      ? await asaasRequest<AsaasPixQrCodeResponse>(
        asaasApiKey,
        `/payments/${paymentResponse.id}/pixQrCode`,
        { method: "GET" },
      )
      : null;

    const { data: paymentRow, error: paymentInsertError } = await supabase
      .from("payments")
      .insert({
        profile_id: profile.id,
        subscription_id: subscriptionId,
        method: input.method,
        status: mapAsaasStatusToPaymentStatus(paymentResponse.status),
        amount_cents: plan.price_cents,
        asaas_payment_id: paymentResponse.id,
        asaas_invoice_url: paymentResponse.invoiceUrl ?? null,
        pix_payload: pixQrCodeResponse?.payload ?? null,
        pix_qr_code_url: pixQrCodeResponse?.encodedImage
          ? `data:image/png;base64,${pixQrCodeResponse.encodedImage}`
          : null,
        due_date: paymentResponse.dueDate,
        raw_provider_payload: {
          payment: paymentResponse,
          pixQrCode: pixQrCodeResponse,
        },
      })
      .select("id, subscription_id, status, asaas_invoice_url, pix_payload, pix_qr_code_url")
      .single();

    if (paymentInsertError || !paymentRow) {
      console.error("Failed to persist payment", paymentInsertError);
      return errorResponse(500, "Failed to persist payment");
    }

    return jsonResponse({
      paymentId: paymentRow.id,
      subscriptionId: paymentRow.subscription_id,
      method: input.method,
      status: paymentRow.status,
      invoiceUrl: paymentRow.asaas_invoice_url,
      pixPayload: paymentRow.pix_payload,
      pixQrCodeUrl: paymentRow.pix_qr_code_url,
      pixQrCodeBase64: pixQrCodeResponse?.encodedImage ?? null,
      expiresAt: pixQrCodeResponse?.expirationDate ?? null,
    });
  } catch (error) {
    console.error("create-payment unexpected error", error);
    return errorResponse(500, "Unexpected error while creating PIX payment", error instanceof Error ? error.message : error);
  }
});
