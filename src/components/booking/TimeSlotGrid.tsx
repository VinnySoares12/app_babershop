import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/types/domain";

const statusClasses = {
  available: "border-border bg-surface text-foreground hover:border-gold/50",
  busy: "border-border bg-white/[0.03] text-muted line-through opacity-55",
  selected: "border-gold bg-gold text-background shadow-glow",
  blocked: "border-danger/25 bg-danger/10 text-danger",
};

export function TimeSlotGrid({
  slots,
  selectedSlotId,
  onSelect,
}: {
  slots: TimeSlot[];
  selectedSlotId?: string;
  onSelect?: (slot: TimeSlot) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {slots.map((slot) => {
        const isDisabled = slot.status === "busy" || slot.status === "blocked";
        const isSelected = slot.id === selectedSlotId;

        return (
          <button
            key={slot.id}
            disabled={isDisabled}
            onClick={() => onSelect?.(slot)}
            className={cn(
              "h-12 rounded-xl border text-sm font-semibold transition active:scale-[0.98]",
              statusClasses[isSelected ? "selected" : slot.status],
            )}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
