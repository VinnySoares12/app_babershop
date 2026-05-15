import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/services/supabase/auth";

export function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<{ email: string }>();

  return (
    <Card>
      <p className="text-sm font-semibold text-gold">Recuperacao</p>
      <h1 className="mt-2 text-3xl font-bold">Recuperar senha</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => resetPassword(values.email))}>
        <Input placeholder="Email" type="email" {...register("email")} />
        <Button className="w-full" type="submit">Enviar link</Button>
      </form>
    </Card>
  );
}
