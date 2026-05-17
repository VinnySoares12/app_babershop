import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, formatCalendarMonth, formatCalendarWeekday, getDayLoadTone, getLeadingEmptyDays, getMonthDays, isBookableCalendarDate, toDateKey } from "@/lib/booking";
import { cn } from "@/lib/utils";
import type { CalendarDayAvailability } from "@/lib/booking";
import { Button } from "@/components/ui/button";

const loadToneClasses = {
  low: "bg-success",
  high: "bg-danger",
};

export function BookingCalendar({
  monthDate,
  selectedDate,
  days,
  onMonthChange,
  onSelectDate,
}: {
  monthDate: Date;
  selectedDate: string;
  days: CalendarDayAvailability[];
  onMonthChange: (nextMonth: Date) => void;
  onSelectDate: (date: string) => void;
}) {
  const monthDays = getMonthDays(monthDate);
  const leadingDays = getLeadingEmptyDays(monthDate);
  return (
    <div className="rounded-3xl border border-border bg-background/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gold">Calendario</p>
          <h3 className="text-lg font-bold capitalize">{formatCalendarMonth(monthDate)}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => onMonthChange(addMonths(monthDate, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" onClick={() => onMonthChange(addMonths(monthDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {Array.from({ length: 7 }, (_, index) => {
          const referenceDate = new Date(2026, 4, 17 + index);
          return <span key={referenceDate.toISOString()}>{formatCalendarWeekday(referenceDate)}</span>;
        })}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {Array.from({ length: leadingDays }).map((_, index) => (
          <span key={`empty-${index}`} />
        ))}

        {monthDays.map((day) => {
          const dateKey = toDateKey(day);
          const availability = days.find((item) => item.date === dateKey);
          const loadTone = availability ? getDayLoadTone(availability) : "high";
          const isBookable = availability ? isBookableCalendarDate(dateKey) && availability.totalSlots > 0 : false;
          const isSelected = dateKey === selectedDate;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={!isBookable}
              onClick={() => onSelectDate(dateKey)}
              className={cn(
                "min-h-[74px] rounded-2xl border border-border px-2 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-35",
                isSelected ? "border-gold bg-gold/10 shadow-glow" : "bg-surface/70 hover:border-gold/40",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("text-sm font-bold", isSelected ? "text-gold" : "text-foreground")}>
                  {day.getDate()}
                </span>
                <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", loadToneClasses[loadTone])} />
              </div>
              <p className="mt-3 text-[11px] leading-tight text-muted">
                {availability?.availableSlots
                  ? "Horarios disponiveis"
                  : "Agenda indisponivel"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-success" /> Horarios disponiveis</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-danger" /> Sem horario</span>
      </div>
    </div>
  );
}
