import { motion } from "framer-motion";
import { ArrowRight, Bell, Gift, Sparkles, UserRound } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NextAppointmentCard } from "@/components/cards/NextAppointmentCard";
import { PlanCard } from "@/components/cards/PlanCard";
import { ServiceTile } from "@/components/booking/ServiceTile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLoyaltySummary, useNotificationsFeed, useRecentHistory } from "@/hooks/use-dashboard-data";
import { useSubscriptionPlans } from "@/hooks/use-subscription-plans";
import { useSession } from "@/hooks/use-session";
import { formatBookingDate } from "@/lib/booking";
import { appRoutes } from "@/lib/routes";
import { barbers, nextAppointment, services } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useBookingStore } from "@/stores/booking-store";
import { usePlanStore } from "@/stores/plan-store";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function getFirstName(fullName?: string) {
  return fullName?.trim().split(/\s+/)[0] || "Cliente";
}

export function HomePage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const plansQuery = useSubscriptionPlans();
  const loyaltySummaryQuery = useLoyaltySummary();
  const notificationsQuery = useNotificationsFeed();
  const recentHistoryQuery = useRecentHistory();
  const confirmedBooking = useBookingStore((state) => state.confirmedBooking);
  const { selectedPlanId, setSelectedPlanId } = usePlanStore();
  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const confirmedBarber = barbers.find((barber) => barber.id === confirmedBooking?.barberId);
  const confirmedService = services.find((service) => service.id === confirmedBooking?.serviceId);
  const customerName = getFirstName(session?.user.user_metadata.full_name);
  const greeting = getGreeting();
  const loyaltySummary = loyaltySummaryQuery.data;
  const notifications = notificationsQuery.data ?? [];
  const recentHistory = recentHistoryQuery.data ?? [];
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId],
  );
  const appointment = confirmedBooking && confirmedBarber && confirmedService
    ? {
        id: "simulated_booking",
        barberName: confirmedBarber.name,
        barberPhoto: confirmedBarber.photoUrl,
        serviceName: confirmedService.name,
        dateLabel: formatBookingDate(confirmedBooking.date),
        timeLabel: confirmedBooking.time,
        status: confirmedBooking.status,
      }
    : nextAppointment;
  const historyItems = recentHistory;
  const spotlightNotifications = notifications.slice(0, 3);

  useEffect(() => {
    if (!selectedPlanId && plans[0]) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId, setSelectedPlanId]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gold">Saviella The Barber</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">{greeting}, {customerName}</h1>
          <p className="mt-2 text-sm text-muted">Seu visual premium em poucos toques.</p>
        </div>
        <Link
          to={appRoutes.profile}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold transition hover:bg-gold hover:text-background"
          aria-label="Abrir perfil"
        >
          <UserRound className="h-6 w-6" />
        </Link>
      </header>

      <NextAppointmentCard appointment={appointment} />

      <Button asChild className="h-14 w-full text-base">
        <Link to={appRoutes.booking}>
          Agendar agora <ArrowRight className="h-5 w-5" />
        </Link>
      </Button>

      <Card className="overflow-hidden border-gold/20 bg-[linear-gradient(120deg,#14171C,rgba(200,164,93,0.14))]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gold">Cashback ativo</p>
            <h2 className="mt-1 text-xl font-bold">
              {loyaltySummary ? `${formatCurrency(loyaltySummary.cashback_cents)} disponíveis na carteira` : "Ganhe 10% no combo desta semana"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {loyaltySummary
                ? `${loyaltySummary.points} pontos acumulados no nível ${loyaltySummary.vip_level}.`
                : "Use no checkout e acompanhe tudo na carteira."}
            </p>
          </div>
        </div>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-bold">Avisos ativos</h2>
          </div>
          <Link to={appRoutes.notifications} className="text-sm font-semibold text-gold">Ver todos</Link>
        </div>

        <div className="grid gap-3">
          {spotlightNotifications.length ? spotlightNotifications.map((item) => (
            <Card key={item.id} className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{item.title}</p>
                  <Badge tone={item.read_at ? "muted" : "gold"}>
                    {item.read_at ? "Lido" : "Novo"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
              </div>
            </Card>
          )) : (
            <Card className="text-sm text-muted">
              Nenhum aviso ativo no momento. Cashback, Pix confirmado e campanhas aparecem aqui.
            </Card>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Serviços</h2>
          <Link to={appRoutes.booking} className="text-sm font-semibold text-gold">Ver todos</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.slice(0, 6).map((service, index) => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <ServiceTile
                service={service}
                onSelect={() => {
                  useBookingStore.getState().setField("serviceId", service.id);
                  navigate(appRoutes.booking);
                }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <h2 className="text-lg font-bold">Planos Saviella</h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={{
                id: plan.id,
                name: plan.name,
                tier: plan.tier,
                priceCents: plan.price_cents,
                cutsPerMonth: plan.cuts_per_cycle,
                description: plan.description ?? "",
                benefits: plan.benefits,
                highlighted: plan.highlighted,
              }}
              selected={plan.id === selectedPlan?.id}
              onSelect={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Histórico recente</h2>
        <div className="space-y-3">
          {historyItems.length ? historyItems.map((item) => (
            <Card key={item.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(item.amountCents)}</p>
                <span className="text-sm font-semibold text-success">{item.statusLabel}</span>
              </div>
            </Card>
          )) : (
            <Card className="text-sm text-muted">
              Assim que um pagamento real for confirmado, ele aparece aqui com o serviço realizado e o valor.
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
