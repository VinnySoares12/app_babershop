import { Check, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { Plan } from "@/types/domain";

type PlanCardProps = {
  plan: Plan;
  selected?: boolean;
  onSelect?: () => void;
};

export function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && onSelect) {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "cursor-pointer p-4 transition hover:border-gold/40",
        plan.highlighted && "border-gold/40",
        selected && "border-gold bg-gold/10 shadow-glow",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            <h3 className="font-semibold">Plano {plan.name}</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(plan.priceCents)}<span className="text-sm font-medium text-muted">/mes</span></p>
        </div>
        {selected ? <Badge tone="gold">Selecionado</Badge> : plan.highlighted ? <Badge tone="gold">Mais escolhido</Badge> : null}
      </div>
      <p className="mt-3 text-sm text-muted">{plan.cutsPerMonth} cortes por mes inclusos.</p>
      <ul className="mt-4 space-y-2">
        {plan.benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2 text-sm text-foreground/88">
            <Check className="h-4 w-4 text-success" /> {benefit}
          </li>
        ))}
      </ul>
      <Button className="mt-5 w-full" variant={selected ? "primary" : "secondary"} onClick={onSelect}>
        {selected ? "Plano selecionado" : "Selecionar plano"}
      </Button>
    </Card>
  );
}
