import { CalendarCheck, DollarSign, Scissors, Users } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Card } from "@/components/ui/card";

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-gold">Admin</p>
        <h1 className="mt-2 text-3xl font-bold">Painel Saviella</h1>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard icon={DollarSign} label="Faturamento" value="R$ 18.420" />
        <AdminMetricCard icon={CalendarCheck} label="Agendamentos" value="42 hoje" />
        <AdminMetricCard icon={Users} label="Clientes" value="1.284" />
        <AdminMetricCard icon={Scissors} label="Mais requisitado" value="Rafael" />
      </div>
      <Card>
        <h2 className="font-semibold">Agenda em tempo real</h2>
        <p className="mt-2 text-sm text-muted">Modulo preparado para ouvir appointments via Supabase Realtime.</p>
      </Card>
    </div>
  );
}
