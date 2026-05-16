import { useEffect, useMemo, useState } from "react";
import { Crown } from "lucide-react";
import { SubscriptionCheckoutPanel } from "@/components/subscription/SubscriptionCheckoutPanel";
import { PlanCard } from "@/components/cards/PlanCard";
import { Card } from "@/components/ui/card";
import { useCheckoutProfile, useCreateSubscriptionPayment, useLatestSubscription, usePaymentStatus } from "@/hooks/use-subscription-checkout";
import { useSubscriptionPlans } from "@/hooks/use-subscription-plans";
import { usePlanStore } from "@/stores/plan-store";
import type { CheckoutPaymentView } from "@/types/subscription";

export function PlansPage() {
  const { selectedPlanId, setSelectedPlanId } = usePlanStore();
  const plansQuery = useSubscriptionPlans();
  const checkoutProfileQuery = useCheckoutProfile();
  const latestSubscriptionQuery = useLatestSubscription();
  const createPaymentMutation = useCreateSubscriptionPayment();
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  const [createdPaymentPreview, setCreatedPaymentPreview] = useState<CheckoutPaymentView | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const paymentStatusQuery = usePaymentStatus(createdPaymentId);

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId],
  );

  useEffect(() => {
    if (!selectedPlanId && plans[0]) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId, setSelectedPlanId]);

  async function handleCreatePayment(customer: {
    fullName: string;
    email: string;
    phone: string;
    document: string;
    method: "PIX" | "CREDIT_CARD";
  }) {
    if (!selectedPlan) {
      setErrorMessage("Selecione um plano antes de continuar.");
      return;
    }

    if (!customer.fullName || !customer.email || !customer.phone || !customer.document) {
      setErrorMessage("Preencha nome, e-mail, telefone e CPF para gerar o PIX.");
      return;
    }

    setErrorMessage(null);
    setCreatedPaymentPreview(null);

    try {
      const response = await createPaymentMutation.mutateAsync({
        planId: selectedPlan.id,
        amount: selectedPlan.price_cents,
        description: `Assinatura mensal ${selectedPlan.name}`,
        method: customer.method,
        customer,
      });

      setCreatedPaymentId(response.paymentId);
      setCreatedPaymentPreview({
        id: response.paymentId,
        method: response.method,
        status: response.status,
        asaas_invoice_url: response.invoiceUrl,
        pix_payload: response.pixPayload,
        pix_qr_code_url: response.pixQrCodeUrl,
      });

      if (customer.method === "CREDIT_CARD" && response.invoiceUrl) {
        window.open(response.invoiceUrl, "_blank", "noopener,noreferrer");
      }

      await Promise.all([
        latestSubscriptionQuery.refetch(),
        checkoutProfileQuery.refetch(),
      ]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel criar o pagamento.");
    }
  }

  const activePayment = paymentStatusQuery.data ?? createdPaymentPreview;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-gold">Planos</p>
        <h1 className="mt-2 text-3xl font-bold">Escolha sua assinatura</h1>
        <p className="mt-2 text-sm text-muted">
          Fluxo real com Supabase Edge Functions, Asaas Pix e ativação automática da assinatura após o webhook.
        </p>
      </header>

      <Card className="flex items-center gap-4 border-gold/25">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <Crown className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted">Plano atual selecionado</p>
          <h2 className="text-xl font-bold">
            {selectedPlan ? `Plano ${selectedPlan.name}` : "Carregando planos"}
          </h2>
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={{
              id: plan.id,
              name: plan.name,
              tier: plan.tier,
              priceCents: plan.price_cents,
              cutsPerMonth: plan.cuts_per_cycle,
              description: plan.description ?? "",
              benefits: plan.benefits,
              highlighted: plan.highlighted,
            }}
            selected={plan.id === selectedPlanId}
            onSelect={() => setSelectedPlanId(plan.id)}
          />
        ))}
      </div>

      <SubscriptionCheckoutPanel
        plan={selectedPlan}
        profile={checkoutProfileQuery.data}
        subscription={latestSubscriptionQuery.data}
        payment={activePayment}
        isSubmitting={createPaymentMutation.isPending}
        errorMessage={errorMessage}
        onSubmit={handleCreatePayment}
      />
    </div>
  );
}
