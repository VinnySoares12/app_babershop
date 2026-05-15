import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signUpWithEmail } from "@/services/supabase/auth";

const schema = z.object({
  fullName: z.string().min(3, "Informe seu nome."),
  email: z.string().email("Informe um email válido."),
  password: z.string().min(6, "Mínimo de 6 caracteres."),
});

type RegisterForm = z.infer<typeof schema>;

export function RegisterPage() {
  const { register, handleSubmit } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  async function onSubmit(values: RegisterForm) {
    await signUpWithEmail(values.email, values.password, values.fullName);
  }

  return (
    <Card>
      <p className="text-sm font-semibold text-gold">Cadastro</p>
      <h1 className="mt-2 text-3xl font-bold">Crie sua conta</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Nome completo" {...register("fullName")} />
        <Input placeholder="Email" type="email" {...register("email")} />
        <Input placeholder="Senha" type="password" {...register("password")} />
        <Button className="w-full" type="submit">Começar</Button>
      </form>
    </Card>
  );
}
