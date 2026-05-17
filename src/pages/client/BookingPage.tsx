import { CalendarDays, MapPin, Scissors } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarberCard } from "@/components/cards/BarberCard";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { ServiceTile } from "@/components/booking/ServiceTile";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { CheckoutSummary } from "@/components/booking/CheckoutSummary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APPOINTMENT_BUFFER_MINUTES, buildCalendarAvailability, buildTimeSlots, formatBookingDate, isSameMonth, parseDateKey } from "@/lib/booking";
import { appRoutes } from "@/lib/routes";
import { barbers, defaultBookingDate, services } from "@/lib/mock-data";
import { useBookingStore } from "@/stores/booking-store";

export function BookingPage() {
  const navigate = useNavigate();
  const { barberId, serviceId, date, time, bookedAppointments, setField, confirmBooking } = useBookingStore();
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const baseDate = date ? parseDateKey(date) : new Date();
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  });
  const selectedService = services.find((service) => service.id === serviceId) ?? services[2];
  const selectedDate = date ?? defaultBookingDate;
  const availableTimeSlots = buildTimeSlots({
    barberId,
    date: selectedDate,
    serviceDurationMinutes: selectedService.durationMinutes,
    existingAppointments: bookedAppointments,
  });
  const monthAvailability = buildCalendarAvailability({
    barberId,
    date: `${calendarMonth.getFullYear()}-${`${calendarMonth.getMonth() + 1}`.padStart(2, "0")}-01`,
    serviceDurationMinutes: selectedService.durationMinutes,
    existingAppointments: bookedAppointments,
  });
  const canContinue = Boolean(barberId && serviceId && date && time);
  const couponCents = selectedService.priceCents >= 10000 ? 1000 : 0;
  const cashbackCents = selectedService.priceCents >= 9000 ? 500 : 0;

  function handleConfirm() {
    if (!barberId || !serviceId || !date || !time) return;

    confirmBooking({
      id: `booking_${Date.now()}`,
      barberId,
      serviceId,
      date,
      time,
      totalCents: Math.max(selectedService.priceCents - couponCents - cashbackCents, 0),
      durationMinutes: selectedService.durationMinutes,
      bufferAfterMinutes: APPOINTMENT_BUFFER_MINUTES,
      status: "pending_payment",
    });

    navigate(appRoutes.checkout);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-gold">Agendamento</p>
        <h1 className="mt-2 text-3xl font-bold">Reserve seu horário</h1>
      </header>

      <Card className="flex items-center gap-3">
        <MapPin className="h-5 w-5 text-gold" />
        <div>
          <p className="font-semibold">Unidade Centro</p>
          <p className="text-sm text-muted">Rua premium, 120 - Sala 01</p>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Escolha o barbeiro</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {barbers.map((barber) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              selected={barber.id === barberId}
              onSelect={() => {
                setField("barberId", barber.id);
                setField("date", selectedDate);
                setField("time", undefined);
              }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Serviço</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <ServiceTile
              key={service.id}
              service={service}
              selected={service.id === serviceId}
              onSelect={() => {
                setField("serviceId", service.id);
                setField("time", undefined);
              }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gold" />
          <h2 className="text-lg font-bold">Escolha o dia</h2>
        </div>
        <BookingCalendar
          monthDate={calendarMonth}
          selectedDate={selectedDate}
          days={monthAvailability.filter((item) => isSameMonth(parseDateKey(item.date), calendarMonth))}
          onMonthChange={setCalendarMonth}
          onSelectDate={(nextDate) => {
            setField("date", nextDate);
            setField("time", undefined);
          }}
        />
      </section>

      <section className="space-y-3">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gold">Disponibilidade</p>
              <h2 className="text-lg font-bold capitalize">{formatBookingDate(selectedDate)}</h2>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-muted">
              <Scissors className="h-4 w-4 text-gold" />
              <span>{selectedService.durationMinutes} min</span>
            </div>
          </div>

          <TimeSlotGrid
            slots={availableTimeSlots}
            selectedSlotId={time}
            emptyMessage={barberId ? "Nao ha horarios disponiveis para esse dia." : "Escolha um barbeiro para ver a agenda."}
            onSelect={(slot) => {
              setField("date", selectedDate);
              setField("time", slot.id);
            }}
          />
        </Card>
      </section>

      <CheckoutSummary subtotalCents={selectedService.priceCents} couponCents={couponCents} cashbackCents={cashbackCents} />
      <Button className="h-14 w-full text-base" disabled={!canContinue} onClick={handleConfirm}>
        {canContinue ? "Ir para pagamento" : "Escolha barbeiro, serviço, data e horário"}
      </Button>
    </div>
  );
}
