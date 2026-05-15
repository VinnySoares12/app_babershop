import { zodResolver } from "@hookform/resolvers/zod";
import { Chrome } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { appRoutes } from "@/lib/routes";
import { signInWithEmail, signInWithGoogle } from "@/services/supabase/auth";

const loginSchema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(6, "Mínimo de 6 caracteres."),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    await signInWithEmail(values.email, values.password);
  }

  return (
    <Card>
      <p className="text-sm font-semibold text-gold">Saviella The Barber</p>
      <h1 className="mt-2 text-3xl font-bold">Entrar</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Email" type="email" {...register("email")} />
        <Input placeholder="Senha" type="password" {...register("password")} />
        {formState.errors.email ? <p className="text-sm text-danger">{formState.errors.email.message}</p> : null}
        <Button className="w-full" type="submit">Acessar app</Button>
      </form>
      <Button className="mt-3 w-full" variant="secondary" onClick={() => void signInWithGoogle()}>
        <Chrome className="h-4 w-4" /> Entrar com Google
      </Button>
      <div className="mt-5 flex justify-between text-sm">
        <Link className="text-gold" to={appRoutes.register}>Criar conta</Link>
        <Link className="text-muted" to={appRoutes.forgotPassword}>Recuperar senha</Link>
      </div>
    </Card>
  );
}
