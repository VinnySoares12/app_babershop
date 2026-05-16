import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LoaderCircle, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { appRoutes } from "@/lib/routes";
import { signUpWithEmail } from "@/services/supabase/auth";

const schema = z.object({
  fullName: z.string().min(3, "Informe seu nome."),
  email: z.string().email("Informe um email válido."),
  phone: z
    .string()
    .min(10, "Informe um telefone com DDD.")
    .regex(/^[\d\s()+-]+$/, "Use apenas números, espaço, parênteses, + ou -."),
  password: z
    .string()
    .min(8, "Use pelo menos 8 caracteres.")
    .regex(/[A-Z]/, "Inclua uma letra maiúscula.")
    .regex(/[a-z]/, "Inclua uma letra minúscula.")
    .regex(/\d/, "Inclua um número.")
    .regex(/[^A-Za-z0-9]/, "Inclua um símbolo."),
});

type RegisterForm = z.infer<typeof schema>;

export function RegisterPage() {
  const [authError, setAuthError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { register, handleSubmit, formState, reset, watch } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "", password: "" },
  });
  const password = watch("password");
  const passwordRules = [
    { label: "8 caracteres", passed: password.length >= 8 },
    { label: "Maiúscula", passed: /[A-Z]/.test(password) },
    { label: "Minúscula", passed: /[a-z]/.test(password) },
    { label: "Número", passed: /\d/.test(password) },
    { label: "Símbolo", passed: /[^A-Za-z0-9]/.test(password) },
  ];

  async function onSubmit(values: RegisterForm) {
    setAuthError("");
    setSuccessMessage("");
    const { error } = await signUpWithEmail(values.email, values.password, values.fullName, values.phone);

    if (error) {
      setAuthError(error.message);
      return;
    }

    reset();
    setSuccessMessage("Cadastro enviado. Abra seu email e confirme a conta para ativar o acesso.");
  }

  return (
    <Card className={formState.isSubmitting ? "cursor-wait" : undefined}>
      <p className="text-sm font-semibold text-gold">Cadastro</p>
      <h1 className="mt-2 text-3xl font-bold">Crie sua conta</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Nome completo" disabled={formState.isSubmitting} {...register("fullName")} />
        <Input placeholder="Email" type="email" disabled={formState.isSubmitting} {...register("email")} />
        <Input placeholder="Telefone com DDD" type="tel" disabled={formState.isSubmitting} {...register("phone")} />
        <Input placeholder="Senha" type="password" disabled={formState.isSubmitting} {...register("password")} />
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/50 p-3 text-xs text-muted">
          {passwordRules.map((rule) => (
            <span key={rule.label} className={rule.passed ? "flex items-center gap-1 text-gold" : "flex items-center gap-1"}>
              <Check className="h-3.5 w-3.5" />
              {rule.label}
            </span>
          ))}
        </div>
        {formState.errors.fullName ? <p className="text-sm text-danger">{formState.errors.fullName.message}</p> : null}
        {formState.errors.email ? <p className="text-sm text-danger">{formState.errors.email.message}</p> : null}
        {formState.errors.phone ? <p className="text-sm text-danger">{formState.errors.phone.message}</p> : null}
        {formState.errors.password ? <p className="text-sm text-danger">{formState.errors.password.message}</p> : null}
        {authError ? <p className="text-sm text-danger">{authError}</p> : null}
        {successMessage ? (
          <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{successMessage}</p>
          </div>
        ) : null}
        <Button className="w-full" type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Enviando cadastro
            </>
          ) : (
            "Cadastrar"
          )}
        </Button>
      </form>
      <div className="mt-5 text-center text-sm">
        <Link className="text-gold" to={appRoutes.login}>Ja tenho conta</Link>
      </div>
    </Card>
  );
}
