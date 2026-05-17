import type { TimeSlot } from "@/types/domain";

export const SLOT_STEP_MINUTES = 30;
export const APPOINTMENT_BUFFER_MINUTES = 15;

type BarberWorkingHours = {
  weekday: number;
  start: string;
  end: string;
  breaks?: Array<{ start: string; end: string }>;
};

export type SeededAppointment = {
  id: string;
  barberId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  bufferAfterMinutes?: number;
};

export type CalendarDayAvailability = {
  date: string;
  availableSlots: number;
  totalSlots: number;
};

type BuildTimeSlotsParams = {
  barberId?: string;
  date: string;
  serviceDurationMinutes: number;
  existingAppointments: SeededAppointment[];
};

const barberWorkingHours: Record<string, BarberWorkingHours[]> = {
  barber_rafael: [
    { weekday: 1, start: "09:00", end: "19:30" },
    { weekday: 2, start: "09:00", end: "19:30" },
    { weekday: 3, start: "09:00", end: "19:30" },
    { weekday: 4, start: "09:00", end: "19:30" },
    { weekday: 5, start: "09:00", end: "20:00" },
    { weekday: 6, start: "08:00", end: "16:00" },
  ],
  barber_luan: [
    { weekday: 1, start: "10:00", end: "20:00" },
    { weekday: 2, start: "10:00", end: "20:00" },
    { weekday: 3, start: "10:00", end: "20:00" },
    { weekday: 4, start: "10:00", end: "20:00" },
    { weekday: 5, start: "10:00", end: "20:00" },
    { weekday: 6, start: "09:00", end: "17:00" },
  ],
};

export function getTodayDateKey() {
  return toDateKey(new Date());
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatBookingDate(date: string) {
  const parsed = parseDateKey(date);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(parsed);
}

export function formatCalendarMonth(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatCalendarWeekday(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  }).format(date).replace(".", "");
}

export function getMonthDays(anchorDate: Date) {
  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  const days: Date[] = [];

  for (let day = 1; day <= end.getDate(); day += 1) {
    days.push(new Date(start.getFullYear(), start.getMonth(), day));
  }

  return days;
}

export function getLeadingEmptyDays(anchorDate: Date) {
  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  return start.getDay();
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

export function isPastDate(date: string) {
  return parseDateKey(date).getTime() < startOfDay(new Date()).getTime();
}

export function isBookableCalendarDate(date: string) {
  const parsed = parseDateKey(date);
  return parsed.getDay() !== 0;
}

export function buildTimeSlots({
  barberId,
  date,
  serviceDurationMinutes,
  existingAppointments,
}: BuildTimeSlotsParams): TimeSlot[] {
  if (!barberId) {
    return [];
  }

  const workingDay = getWorkingDay(barberId, date);
  if (!workingDay) {
    return [];
  }

  const dayAppointments = existingAppointments.filter((appointment) => appointment.barberId === barberId && appointment.date === date);
  const openingMinutes = parseTimeToMinutes(workingDay.start);
  const closingMinutes = parseTimeToMinutes(workingDay.end);
  const effectiveDuration = serviceDurationMinutes;
  const slots: TimeSlot[] = [];

  for (let time = openingMinutes; time <= closingMinutes; time += SLOT_STEP_MINUTES) {
    const label = minutesToTimeLabel(time);
    const endsAt = time + effectiveDuration;
    const isOutOfBounds = endsAt > closingMinutes;
    const isInPast = isPastDateTime(date, label);
    const isBusy = dayAppointments.some((appointment) => appointment.startTime === label);

    const status = isOutOfBounds || isInPast
      ? "blocked"
      : isBusy
        ? "busy"
        : "available";

    slots.push({
      id: label,
      label,
      status,
    });
  }

  return slots;
}

export function buildCalendarAvailability(params: BuildTimeSlotsParams) {
  const totalDays = getMonthDays(parseDateKey(params.date)).map((day) => toDateKey(day));

  return totalDays.map((date) => {
    const slots = buildTimeSlots({ ...params, date });
    return {
      date,
      availableSlots: slots.filter((slot) => slot.status === "available").length,
      totalSlots: slots.length,
    } satisfies CalendarDayAvailability;
  });
}

export function getDayLoadTone(day: CalendarDayAvailability) {
  return day.totalSlots > 0 && day.availableSlots > 0 ? "low" : "high";
}

function getWorkingDay(barberId: string, date: string) {
  const weekday = parseDateKey(date).getDay();
  return barberWorkingHours[barberId]?.find((entry) => entry.weekday === weekday);
}

export function parseDateKey(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTimeLabel(totalMinutes: number) {
  const hours = `${Math.floor(totalMinutes / 60)}`.padStart(2, "0");
  const minutes = `${totalMinutes % 60}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function isPastDateTime(date: string, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const current = new Date();
  const selected = parseDateKey(date);
  selected.setHours(hours, minutes, 0, 0);
  return selected.getTime() <= current.getTime() && toDateKey(selected) === toDateKey(current);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}
