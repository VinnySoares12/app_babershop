import { CalendarCheck, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appRoutes } from "@/lib/routes";
import type { Appointment } from "@/types/domain";

export function NextAppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Card className="relative overflow-hidden border-gold/20 bg-[linear-gradient(135deg,rgba(200,164,93,0.16),rgba(20,23,28,0.92)_42%)]">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <Badge tone="success">Confirmado</Badge>
          <h2 className="mt-4 text-xl font-bold">Seu próximo horário</h2>
          <p className="mt-1 text-sm text-muted">{appointment.serviceName} com {appointment.barberName}</p>
        </div>
        <img
          src={appointment.barberPhoto}
          alt={appointment.barberName}
          className="h-16 w-16 rounded-2xl object-cover ring-1 ring-gold/30"
        />
      </div>

      <div className="relative mt-5 grid gap-3 text-sm text-foreground/90 sm:grid-cols-3">
        <span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-gold" />{appointment.dateLabel}</span>
        <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold" />{appointment.timeLabel}</span>
        <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />Unidade Centro</span>
      </div>

      <Button asChild className="relative mt-5 w-full sm:w-auto">
        <Link to={appRoutes.appointmentDetails}>Ver detalhes</Link>
      </Button>
    </Card>
  );
}
