import { Bell, CheckCircle2, Gift, Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMarkNotificationAsRead, useNotificationsFeed } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import type { NotificationItem, NotificationKind } from "@/types/notifications";

const kindMeta: Record<NotificationKind, { label: string; tone: "gold" | "success" | "danger" | "muted"; icon: typeof Bell }> = {
  cashback: { label: "Cashback", tone: "success", icon: Gift },
  pix_confirmed: { label: "Pix confirmado", tone: "gold", icon: CheckCircle2 },
  campaign: { label: "Campanha", tone: "danger", icon: Megaphone },
  generic: { label: "Aviso", tone: "muted", icon: Bell },
};

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Agora";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function NotificationCard({
  item,
  onRead,
  isPending,
}: {
  item: NotificationItem;
  onRead: (notificationId: string) => void;
  isPending: boolean;
}) {
  const meta = kindMeta[item.uiKind];
  const Icon = meta.icon;

  return (
    <Card className={cn("space-y-4 transition", !item.read_at && "border-gold/30")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{item.title}</h2>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
            <p className="mt-3 text-xs text-muted">{formatTimestamp(item.created_at)}</p>
          </div>
        </div>

        {!item.read_at ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold" /> : null}
      </div>

      {!item.read_at ? (
        <Button variant="secondary" size="sm" disabled={isPending} onClick={() => onRead(item.id)}>
          Marcar como lido
        </Button>
      ) : null}
    </Card>
  );
}

export function NotificationsPage() {
  const notificationsQuery = useNotificationsFeed();
  const markAsReadMutation = useMarkNotificationAsRead();
  const notifications = notificationsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-gold">Avisos</p>
        <h1 className="mt-2 text-3xl font-bold">Notificações e campanhas</h1>
        <p className="mt-2 text-sm text-muted">
          Cashback liberado, Pix confirmado e campanhas aparecem aqui para o cliente acompanhar tudo em um lugar.
        </p>
      </header>

      {notifications.length ? (
        <div className="space-y-3">
          {notifications.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              onRead={(notificationId) => markAsReadMutation.mutate(notificationId)}
              isPending={markAsReadMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center text-sm text-muted">
          Nenhum aviso por enquanto. Quando houver Pix confirmado, cashback ou campanhas, tudo aparece aqui.
        </Card>
      )}
    </div>
  );
}
