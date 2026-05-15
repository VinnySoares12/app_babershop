import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type CheckoutSummaryProps = {
  subtotalCents: number;
  couponCents: number;
  cashbackCents: number;
};

export function CheckoutSummary({ subtotalCents, couponCents, cashbackCents }: CheckoutSummaryProps) {
  const total = Math.max(subtotalCents - couponCents - cashbackCents, 0);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Resumo</h3>
        <Badge tone="gold">Pix ou cartão</Badge>
      </div>
      <div className="mt-5 space-y-3 text-sm">
        <Line label="Subtotal" value={formatCurrency(subtotalCents)} />
        <Line label="Cupom" value={`-${formatCurrency(couponCents)}`} />
        <Line label="Cashback" value={`-${formatCurrency(cashbackCents)}`} />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted">Total</span>
        <strong className="text-2xl text-gold">{formatCurrency(total)}</strong>
      </div>
    </Card>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
