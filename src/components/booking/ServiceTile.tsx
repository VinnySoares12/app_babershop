import { Palette, Scissors, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { Service } from "@/types/domain";

const icons = {
  scissors: Scissors,
  beard: Scissors,
  sparkles: Sparkles,
  palette: Palette,
};

type ServiceTileProps = {
  service: Service;
  selected?: boolean;
  onSelect?: () => void;
};

export function ServiceTile({ service, selected, onSelect }: ServiceTileProps) {
  const Icon = icons[service.iconName];

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
      className={cn("flex cursor-pointer items-center gap-4 p-4 transition hover:border-gold/40", selected && "border-gold bg-gold/10 shadow-glow")}
    >
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold", selected && "bg-gold text-background")}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">{service.name}</h3>
      </div>
      <strong className="text-sm text-gold">{formatCurrency(service.priceCents)}</strong>
    </Card>
  );
}
