import { Card } from "@/components/ui/card";

export function SimpleClientPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm font-semibold text-gold">Cliente</p>
        <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      </header>
      <Card>
        <p className="text-muted">{subtitle}</p>
      </Card>
    </div>
  );
}
