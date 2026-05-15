import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AdminMetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted">{label}</p>
          <strong className="text-xl">{value}</strong>
        </div>
      </div>
    </Card>
  );
}
