import { Crown } from "lucide-react";
import { PlanCard } from "@/components/cards/PlanCard";
import { Card } from "@/components/ui/card";
import { plans } from "@/lib/mock-data";
import { usePlanStore } from "@/stores/plan-store";

export function PlansPage() {
  const { selectedPlanId, setSelectedPlanId } = usePlanStore();
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-gold">Planos</p>
        <h1 className="mt-2 text-3xl font-bold">Escolha sua assinatura</h1>
        <p className="mt-2 text-sm text-muted">Por enquanto é uma simulação visual. Depois conectamos a assinatura recorrente ao Asaas.</p>
      </header>

      <Card className="flex items-center gap-4 border-gold/25">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <Crown className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted">Plano atual selecionado</p>
          <h2 className="text-xl font-bold">Plano {selectedPlan?.name ?? "Premium"}</h2>
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={plan.id === selectedPlanId}
            onSelect={() => setSelectedPlanId(plan.id)}
          />
        ))}
      </div>
    </div>
  );
}
