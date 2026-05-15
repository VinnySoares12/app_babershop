import { CalendarDays, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarberCard } from "@/components/cards/BarberCard";
import { ServiceTile } from "@/components/booking/ServiceTile";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { CheckoutSummary } from "@/components/booking/CheckoutSummary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appRoutes } from "@/lib/routes";
import { barbers, services, timeSlots } from "@/lib/mock-data";
import { useBookingStore } from "@/stores/booking-store";

export function BookingPage() {
  const navigate = useNavigate();
  const { barberId, serviceId, date, time, setField, confirmBooking } = useBookingStore();
  const selectedService = services.find((service) => service.id === serviceId) ?? services[2];
  const canContinue = Boolean(barberId && serviceId && time);
  const couponCents = selectedService.priceCents >= 10000 ? 1000 : 0;
  const cashbackCents = selectedService.priceCents >= 9000 ? 500 : 0;

  function handleConfirm() {
    if (!barberId || !serviceId || !time) return;

    confirmBooking({
      barberId,
      serviceId,
      date: date ?? "Hoje",
      time,
      totalCents: Math.max(selectedService.priceCents - couponCents - cashbackCents, 0),
    });

    navigate(appRoutes.confirmation);
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
              onSelect={() => setField("barberId", barber.id)}
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
              onSelect={() => setField("serviceId", service.id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gold" />
          <h2 className="text-lg font-bold">Hoje</h2>
        </div>
        <TimeSlotGrid
          slots={timeSlots}
          selectedSlotId={time}
          onSelect={(slot) => {
            setField("date", "Hoje");
            setField("time", slot.id);
          }}
        />
      </section>

      <CheckoutSummary subtotalCents={selectedService.priceCents} couponCents={couponCents} cashbackCents={cashbackCents} />
      <Button className="h-14 w-full text-base" disabled={!canContinue} onClick={handleConfirm}>
        {canContinue ? "Confirmar agendamento simulado" : "Escolha barbeiro, serviço e horário"}
      </Button>
    </div>
  );
}
