import { CheckCircle2, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBookingDate } from "@/lib/booking";
import { appRoutes } from "@/lib/routes";
import { barbers, defaultBookingDate, services } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useBookingStore } from "@/stores/booking-store";

export function ConfirmationPage() {
  const booking = useBookingStore((state) => state.confirmedBooking);
  const paymentMethod = useBookingStore((state) => state.paymentMethod);
  const barber = barbers.find((item) => item.id === booking?.barberId);
  const service = services.find((item) => item.id === booking?.serviceId);

  return (
    <div className="space-y-6">
      <Card className="border-success/30 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-3xl font-bold">Pagamento concluído</h1>
        <p className="mt-2 text-sm text-muted">Agendamento confirmado depois do checkout separado. Depois conectamos ao pagamento real.</p>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <ReceiptText className="h-5 w-5 text-gold" />
          <h2 className="font-semibold">Resumo</h2>
        </div>
        <div className="mt-5 space-y-3 text-sm">
          <Line label="Barbeiro" value={barber?.name ?? "Rafael Saviella"} />
          <Line label="Serviço" value={service?.name ?? "Corte + Barba"} />
          <Line label="Data" value={booking?.date ? formatBookingDate(booking.date) : formatBookingDate(defaultBookingDate)} />
          <Line label="Horário" value={booking?.time ?? "18:30"} />
          <Line label="Pagamento" value={paymentMethod === "card" ? "Cartao simulado" : "Pix simulado"} />
          <Line label="Total" value={formatCurrency(booking?.totalCents ?? 9500)} strong />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild className="h-14">
          <Link to={appRoutes.appointmentDetails}>Ver detalhes</Link>
        </Button>
        <Button asChild variant="secondary" className="h-14">
          <Link to={appRoutes.home}>Voltar para Home</Link>
        </Button>
      </div>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-bold text-gold" : "font-semibold"}>{value}</span>
    </div>
  );
}
