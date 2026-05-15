import { CalendarCheck, Clock, MapPin, Scissors, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appRoutes } from "@/lib/routes";
import { barbers, nextAppointment, services } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useBookingStore } from "@/stores/booking-store";

export function AppointmentDetailsPage() {
  const booking = useBookingStore((state) => state.confirmedBooking);
  const barber = barbers.find((item) => item.id === booking?.barberId);
  const service = services.find((item) => item.id === booking?.serviceId);

  const detail = booking && barber && service
    ? {
        barberName: barber.name,
        barberPhoto: barber.photoUrl,
        serviceName: service.name,
        date: booking.date,
        time: booking.time,
        duration: service.durationMinutes,
        total: booking.totalCents,
      }
    : {
        barberName: nextAppointment.barberName,
        barberPhoto: nextAppointment.barberPhoto,
        serviceName: nextAppointment.serviceName,
        date: nextAppointment.dateLabel,
        time: nextAppointment.timeLabel,
        duration: 75,
        total: 9500,
      };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-gold">Detalhes</p>
        <h1 className="mt-2 text-3xl font-bold">Seu agendamento</h1>
      </header>

      <Card className="overflow-hidden border-gold/20">
        <div className="flex items-start gap-4">
          <img src={detail.barberPhoto} alt={detail.barberName} className="h-24 w-24 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1">
            <Badge tone="success">Confirmado</Badge>
            <h2 className="mt-3 text-xl font-bold">{detail.serviceName}</h2>
            <p className="mt-1 text-sm text-muted">Com {detail.barberName}</p>
            <p className="mt-2 flex items-center gap-1 text-sm text-gold">
              <Star className="h-4 w-4 fill-gold" /> Atendimento premium
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <Info icon={CalendarCheck} label="Data" value={detail.date} />
          <Info icon={Clock} label="Horario" value={detail.time} />
          <Info icon={Scissors} label="Duracao" value={`${detail.duration} min`} />
          <Info icon={MapPin} label="Unidade" value="Centro" />
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4">
          <span className="text-sm text-muted">Total pago</span>
          <strong className="text-xl text-gold">{formatCurrency(detail.total)}</strong>
        </div>
      </Card>

      <Button asChild className="h-14 w-full">
        <Link to={appRoutes.booking}>Reagendar simulação</Link>
      </Button>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof CalendarCheck; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3">
      <Icon className="h-5 w-5 text-gold" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
