import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Barber } from "@/types/domain";

type BarberCardProps = {
  barber: Barber;
  selected?: boolean;
  onSelect?: () => void;
};

export function BarberCard({ barber, selected, onSelect }: BarberCardProps) {
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
      className={cn("cursor-pointer p-4 transition hover:border-gold/40", selected && "border-gold bg-gold/10 shadow-glow")}
    >
      <div className="flex gap-4">
        <img src={barber.photoUrl} alt={barber.name} className="h-20 w-20 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{barber.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-gold">
                <Star className="h-4 w-4 fill-gold" /> {barber.rating.toFixed(2)}
              </p>
            </div>
            <Badge tone={selected ? "gold" : "success"}>{selected ? "Selecionado" : "Livre"}</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {barber.specialties.map((specialty) => (
              <Badge key={specialty}>{specialty}</Badge>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">Proximo: {barber.nextAvailable}</p>
        </div>
      </div>
    </Card>
  );
}
