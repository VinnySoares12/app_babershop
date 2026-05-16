import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { appRoutes } from "@/lib/routes";
import { signInWithEmail } from "@/services/supabase/auth";

const loginSchema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(6, "Mínimo de 6 caracteres."),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setAuthError("");
    const { error } = await signInWithEmail(values.email, values.password);

    if (error) {
      setAuthError(error.message);
      return;
    }

    navigate(appRoutes.home, { replace: true });
  }

  return (
    <Card>
      <p className="text-sm font-semibold text-gold">Saviella The Barber</p>
      <h1 className="mt-2 text-3xl font-bold">Entrar</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Email" type="email" {...register("email")} />
        <Input placeholder="Senha" type="password" {...register("password")} />
        {formState.errors.email ? <p className="text-sm text-danger">{formState.errors.email.message}</p> : null}
        {formState.errors.password ? <p className="text-sm text-danger">{formState.errors.password.message}</p> : null}
        {authError ? <p className="text-sm text-danger">{authError}</p> : null}
        <Button className="w-full" type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Entrando..." : "Acessar app"}
        </Button>
      </form>
      <div className="mt-5 flex justify-between text-sm">
        <Link className="text-gold" to={appRoutes.register}>Criar conta</Link>
        <Link className="text-muted" to={appRoutes.forgotPassword}>Recuperar senha</Link>
      </div>
    </Card>
  );
}
