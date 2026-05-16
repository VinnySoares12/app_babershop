import { Copy, CreditCard, Crown, LoaderCircle, QrCode, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPaymentStatus, formatSubscriptionStatus, normalizeDigits } from "@/lib/subscription-utils";
import { formatCurrency } from "@/lib/utils";
import type {
  CheckoutPaymentView,
  SubscriptionCheckoutMethod,
  SubscriptionCheckoutProfile,
  SubscriptionPlan,
  SubscriptionRecord,
} from "@/types/subscription";

type SubscriptionCheckoutPanelProps = {
  plan: SubscriptionPlan | null;
  profile: SubscriptionCheckoutProfile | null | undefined;
  subscription: SubscriptionRecord | null | undefined;
  payment: CheckoutPaymentView | null | undefined;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (payload: {
    fullName: string;
    email: string;
    phone: string;
    document: string;
    method: SubscriptionCheckoutMethod;
  }) => Promise<void>;
};

export function SubscriptionCheckoutPanel({
  plan,
  profile,
  subscription,
  payment,
  isSubmitting,
  errorMessage,
  onSubmit,
}: SubscriptionCheckoutPanelProps) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [document, setDocument] = useState(profile?.document ?? "");
  const [copied, setCopied] = useState(false);
  const [method, setMethod] = useState<SubscriptionCheckoutMethod>("PIX");

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setEmail(profile?.email ?? "");
    setPhone(profile?.phone ?? "");
    setDocument(profile?.document ?? "");
  }, [profile?.document, profile?.email, profile?.full_name, profile?.phone]);

  async function handleCopyPixPayload() {
    if (!payment?.pix_payload) {
      return;
    }

    await navigator.clipboard.writeText(payment.pix_payload);
    setCopied(true);

    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="space-y-5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gold">Assinatura mensal</p>
            <h2 className="text-2xl font-bold">
              {plan ? `Plano ${plan.name}` : "Selecione um plano"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Escolha entre Pix ou cartão. A assinatura é ativada automaticamente após a confirmação do pagamento pelo Asaas.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Valor mensal</p>
              <p className="text-2xl font-bold">{plan ? formatCurrency(plan.price_cents) : "--"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Cortes por ciclo</p>
              <p className="text-xl font-semibold">{plan?.cuts_per_cycle ?? "--"}</p>
            </div>
          </div>

          {plan?.description ? <p className="mt-3 text-sm text-muted">{plan.description}</p> : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {plan?.benefits.map((benefit) => (
              <span key={benefit} className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-medium text-foreground/90">
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome completo</label>
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Seu nome completo" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">E-mail</label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" type="email" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Telefone</label>
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(11) 99999-9999" type="tel" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CPF</label>
            <Input value={document} onChange={(event) => setDocument(event.target.value)} placeholder="000.000.000-00" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Forma de pagamento</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                method === "PIX"
                  ? "border-gold bg-gold/10 shadow-glow"
                  : "border-border/70 bg-background/40 hover:border-gold/30"
              }`}
              onClick={() => setMethod("PIX")}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <QrCode className="h-4 w-4 text-gold" />
                Pix
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                Gera QR Code e código copia e cola na hora.
              </p>
            </button>

            <button
              type="button"
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                method === "CREDIT_CARD"
                  ? "border-gold bg-gold/10 shadow-glow"
                  : "border-border/70 bg-background/40 hover:border-gold/30"
              }`}
              onClick={() => setMethod("CREDIT_CARD")}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="h-4 w-4 text-gold" />
                Cartão de crédito ou débito
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                Abrimos a fatura segura do Asaas para você concluir no cartão.
              </p>
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {errorMessage}
          </div>
        ) : null}

        <Button
          className="h-12 w-full text-base"
          disabled={!plan || isSubmitting}
          onClick={() =>
            onSubmit({
              fullName: fullName.trim(),
              email: email.trim(),
              phone: normalizeDigits(phone),
              document: normalizeDigits(document),
              method,
            })
          }
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              {method === "PIX" ? "Gerando Pix" : "Criando cobranca"}
            </>
          ) : (
            <>
              {method === "PIX" ? <Wallet className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
              {method === "PIX" ? "Assinar com Pix" : "Assinar com cartao"}
            </>
          )}
        </Button>
      </Card>

      <Card className="space-y-5 p-5">
        <div>
          <p className="text-sm font-semibold text-gold">Status da cobrança</p>
          <h3 className="mt-1 text-xl font-bold">
            {payment ? formatPaymentStatus(payment.status) : "Nenhuma cobrança criada"}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {subscription
              ? `Assinatura ${formatSubscriptionStatus(subscription.status).toLowerCase()}`
              : "Assim que a cobranca for criada, mostramos aqui o proximo passo do pagamento."}
          </p>
        </div>

        {payment?.pix_qr_code_url ? (
          <div className="space-y-4 rounded-2xl border border-gold/20 bg-background/60 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gold">
              <QrCode className="h-4 w-4" />
              QR Code PIX
            </div>

            <div className="flex justify-center rounded-2xl bg-white p-4">
              <img
                src={payment.pix_qr_code_url}
                alt="QR Code Pix"
                className="h-56 w-56 rounded-xl object-contain"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted">Pix copia e cola</p>
              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-xs leading-5 text-foreground/90">
                {payment.pix_payload}
              </div>
              <Button variant="secondary" className="w-full" onClick={handleCopyPixPayload}>
                <Copy className="h-4 w-4" />
                {copied ? "Código copiado" : "Copiar código PIX"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
            {payment?.method === "CREDIT_CARD"
              ? "Pagamento por cartao criado. Use o botao abaixo para abrir a fatura segura do Asaas."
              : "O QR Code sera exibido depois da criacao da cobranca."}
          </div>
        )}

        {payment?.asaas_invoice_url ? (
          <Button variant="secondary" className="w-full" asChild>
            <a href={payment.asaas_invoice_url} target="_blank" rel="noreferrer">
              {payment.method === "CREDIT_CARD" ? "Pagar com cartao no Asaas" : "Abrir fatura no Asaas"}
            </a>
          </Button>
        ) : null}
      </Card>
    </div>
  );
}
