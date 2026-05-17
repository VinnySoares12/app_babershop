import { Copy, CreditCard, ExternalLink, Link2, LoaderCircle, QrCode, ReceiptText } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCreateBookingPayment } from "@/hooks/use-booking-checkout";
import { useCheckoutProfile } from "@/hooks/use-subscription-checkout";
import { formatBookingDate } from "@/lib/booking";
import { appRoutes } from "@/lib/routes";
import { normalizeDigits } from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/utils";
import { barbers, services } from "@/lib/mock-data";
import { useBookingStore } from "@/stores/booking-store";
import type { PaymentMethod } from "@/types/domain";
import type { CheckoutPaymentView } from "@/types/payments";

const methodOptions: Array<{
  id: PaymentMethod;
  title: string;
  description: string;
  icon: typeof QrCode;
}> = [
  {
    id: "pix",
    title: "Pix",
    description: "Pagamento rapido para confirmar o agendamento.",
    icon: QrCode,
  },
  {
    id: "card",
    title: "Cartao",
    description: "Credito ou debito em um fluxo separado do plano.",
    icon: CreditCard,
  },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { confirmedBooking, paymentMethod, finalizePayment, setField } = useBookingStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(paymentMethod);
  const [paymentData, setPaymentData] = useState<CheckoutPaymentView | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkoutProfileQuery = useCheckoutProfile();
  const createBookingPaymentMutation = useCreateBookingPayment();

  if (!confirmedBooking) {
    return <Navigate to={appRoutes.booking} replace />;
  }

  const booking = confirmedBooking;
  const barber = barbers.find((item) => item.id === booking.barberId);
  const service = services.find((item) => item.id === booking.serviceId);
  const profile = checkoutProfileQuery.data;
  const pixPayload = paymentData?.pix_payload ?? "";
  const pixPaymentLink = paymentData?.asaas_invoice_url ?? "";
  const cardCheckoutLink = paymentData?.asaas_invoice_url ?? "";
  const isPixReady = selectedMethod === "pix" && Boolean(paymentData?.pix_payload);
  const isCardReady = selectedMethod === "card" && Boolean(paymentData?.asaas_invoice_url);

  async function handleCopyPixPayload() {
    await navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function handleSubmit() {
    setField("paymentMethod", selectedMethod);
    setErrorMessage(null);
    setPaymentData(null);

    if (!profile?.full_name || !profile?.email || !profile?.phone || !profile?.document) {
      setErrorMessage("Complete nome, e-mail, telefone e CPF no perfil para gerar o pagamento.");
      return;
    }

    try {
      const response = await createBookingPaymentMutation.mutateAsync({
        amount: booking.totalCents,
        description: `${service?.name ?? "Servico"} com ${barber?.name ?? "barbeiro"} em ${booking.date} as ${booking.time}`,
        method: selectedMethod === "pix" ? "PIX" : "CREDIT_CARD",
        customer: {
          fullName: profile.full_name,
          email: profile.email,
          phone: normalizeDigits(profile.phone),
          document: normalizeDigits(profile.document),
        },
        metadata: {
          barberId: booking.barberId,
          serviceId: booking.serviceId,
          bookingDate: booking.date,
          bookingTime: booking.time,
        },
      });

      setPaymentData({
        id: response.paymentId,
        method: response.method,
        status: response.status,
        asaas_invoice_url: response.invoiceUrl,
        pix_payload: response.pixPayload,
        pix_qr_code_url: response.pixQrCodeUrl,
      });

      if (selectedMethod === "card" && response.invoiceUrl) {
        window.open(response.invoiceUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel gerar a cobranca.");
    }
  }

  function handleFinishPayment() {
    finalizePayment(selectedMethod);
    navigate(appRoutes.confirmation);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-gold">Pagamento</p>
        <h1 className="mt-2 text-3xl font-bold">Concluir agendamento</h1>
        <p className="mt-2 text-sm text-muted">
          O plano continua separado. Aqui o cliente finaliza apenas o pagamento deste agendamento.
        </p>
      </header>

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted">Resumo do agendamento</p>
            <h2 className="text-xl font-bold">{service?.name ?? "Servico selecionado"}</h2>
          </div>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <SummaryLine label="Barbeiro" value={barber?.name ?? "--"} />
          <SummaryLine label="Data" value={formatBookingDate(booking.date)} />
          <SummaryLine label="Horario" value={booking.time} />
          <SummaryLine label="Total" value={formatCurrency(booking.totalCents)} strong />
        </div>
      </Card>

      {errorMessage ? (
        <Card className="border-danger/30">
          <p className="text-sm text-danger">{errorMessage}</p>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Forma de pagamento</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {methodOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedMethod === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedMethod(option.id)}
                className={`rounded-3xl border p-4 text-left transition ${
                  isSelected
                    ? "border-gold bg-gold/10 shadow-glow"
                    : "border-border bg-surface/70 hover:border-gold/40"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4 text-gold" />
                  {option.title}
                </div>
                <p className="mt-2 text-sm text-muted">{option.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <Card className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-1">
          <Button className="h-14" onClick={() => void handleSubmit()} disabled={createBookingPaymentMutation.isPending || checkoutProfileQuery.isLoading}>
            {createBookingPaymentMutation.isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Gerando cobranca
              </>
            ) : (
              "Concluir pagamento"
            )}
          </Button>
        </div>
      </Card>

      {isPixReady ? (
        <Card className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gold">Pix gerado</p>
            <h2 className="mt-1 text-xl font-bold">QR Code e link prontos para pagamento</h2>
            <p className="mt-2 text-sm text-muted">
              O cliente pode pagar pelo QR Code, copiar o codigo Pix ou receber o link por SMS.
            </p>
          </div>

          <div className="flex justify-center">
            {paymentData?.pix_qr_code_url ? (
              <div className="rounded-3xl bg-white p-4">
                <img src={paymentData.pix_qr_code_url} alt="QR Code Pix" className="h-56 w-56 rounded-2xl object-contain" />
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-background/50 p-4 text-sm">
            <div>
              <p className="text-xs text-muted">Codigo Pix</p>
              <p className="mt-2 break-all font-medium text-foreground/90">{pixPayload}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Link de pagamento</p>
              <p className="mt-2 break-all font-medium text-foreground/90">{pixPaymentLink}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" className="h-12" onClick={() => void handleCopyPixPayload()}>
              <Copy className="h-4 w-4" />
              {copied ? "Codigo copiado" : "Copiar codigo Pix"}
            </Button>
            <Button variant="secondary" className="h-12" asChild>
              <a href={pixPaymentLink} target="_blank" rel="noreferrer">
                <Link2 className="h-4 w-4" />
                Abrir link de pagamento
              </a>
            </Button>
          </div>

          <Button className="h-14 w-full" onClick={handleFinishPayment}>
            Confirmar pagamento recebido
          </Button>
        </Card>
      ) : null}

      {isCardReady ? (
        <Card className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gold">Cartao selecionado</p>
            <h2 className="mt-1 text-xl font-bold">Pagamento externo iniciado</h2>
            <p className="mt-2 text-sm text-muted">
              Abrimos a mesma fatura do Asaas usada no fluxo de planos para o cliente concluir com seguranca.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button className="h-12" asChild>
              <a href={cardCheckoutLink} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Abrir pagamento com cartao
              </a>
            </Button>
            <Button className="h-12" variant="secondary" onClick={handleFinishPayment}>
              Ja conclui o pagamento
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-background/50 px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={strong ? "mt-1 font-bold text-gold" : "mt-1 font-semibold"}>{value}</p>
    </div>
  );
}
