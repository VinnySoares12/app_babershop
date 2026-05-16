import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { barbers, nextAppointment, services } from "@/lib/mock-data";
import { useBookingStore } from "@/stores/booking-store";
import { supabase } from "@/services/supabase/client";
import type { Database, Json } from "@/services/supabase/database.types";

type ProfilePreferences = {
  address?: string;
  preferredBarber?: string;
  preferredService?: string;
  preferredPaymentMethod?: string;
};

type ProfileRecord = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "full_name" | "email" | "phone" | "role" | "preferences" | "created_at" | "updated_at"
>;
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

type ProfileFormValues = {
  address: string;
  preferredBarber: string;
  preferredPaymentMethod: string;
};

function getInitials(fullName?: string) {
  const nameParts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (nameParts.length === 0) return "CL";
  if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase();

  return `${nameParts[0][0] ?? ""}${nameParts[nameParts.length - 1][0] ?? ""}`.toUpperCase();
}

function getRoleLabel(role?: string) {
  switch (role) {
    case "admin":
      return "Administrador";
    case "manager":
      return "Gerente";
    case "barber":
      return "Barbeiro";
    default:
      return "Cliente";
  }
}

function formatDate(date?: string | null) {
  if (!date) return "Nao informado";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Nao informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function readPreferences(preferences: Json | null | undefined): ProfilePreferences {
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
    return {};
  }

  return {
    address: typeof preferences.address === "string" ? preferences.address : undefined,
    preferredBarber: typeof preferences.preferredBarber === "string" ? preferences.preferredBarber : undefined,
    preferredService: typeof preferences.preferredService === "string" ? preferences.preferredService : undefined,
    preferredPaymentMethod: typeof preferences.preferredPaymentMethod === "string" ? preferences.preferredPaymentMethod : undefined,
  };
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-background/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function SelectField({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</span>
      <select
        className="h-12 w-full rounded-xl border border-border bg-background/70 px-4 text-sm text-foreground outline-none transition focus:border-gold/60 focus:ring-2 focus:ring-gold/10"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ProfilePage() {
  const session = useSession();
  const confirmedBooking = useBookingStore((state) => state.confirmedBooking);
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile", session.data?.user.id],
    enabled: Boolean(session.data?.user.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, phone, role, preferences, created_at, updated_at")
        .eq("id", session.data!.user.id)
        .single();

      if (error) throw error;
      return data as ProfileRecord;
    },
  });

  const user = session.data?.user;
  const profile = profileQuery.data;
  const preferences = readPreferences(profile?.preferences);
  const fullName = profile?.full_name ?? user?.user_metadata.full_name ?? "Cliente Saviella";
  const email = profile?.email ?? user?.email ?? "Nao informado";
  const phone = profile?.phone ?? user?.user_metadata.phone ?? "Nao informado";
  const roleLabel = getRoleLabel(profile?.role);
  const address = preferences.address ?? "Endereco ainda nao cadastrado";
  const preferredBarber = preferences.preferredBarber ?? "Sem barbeiro favorito definido";
  const bookingServiceName = services.find((service) => service.id === confirmedBooking?.serviceId)?.name;
  const lastCompletedService = bookingServiceName ?? nextAppointment.serviceName;
  const preferredPaymentMethod = preferences.preferredPaymentMethod ?? "Definir no checkout ou assinatura";
  const createdAt = formatDate(profile?.created_at ?? user?.created_at);
  const updatedAt = formatDate(profile?.updated_at);
  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      address: "",
      preferredBarber: "",
      preferredPaymentMethod: "",
    },
  });

  useEffect(() => {
    reset({
      address: preferences.address ?? "",
      preferredBarber: preferences.preferredBarber ?? "",
      preferredPaymentMethod: preferences.preferredPaymentMethod ?? "",
    });
  }, [preferences.address, preferences.preferredBarber, preferences.preferredPaymentMethod, reset]);

  const saveProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!session.data?.user.id) {
        throw new Error("Usuario nao autenticado.");
      }

      const nextPreferences = {
        ...(profile?.preferences && typeof profile.preferences === "object" && !Array.isArray(profile.preferences)
          ? profile.preferences
          : {}),
        address: values.address.trim(),
        preferredBarber: values.preferredBarber,
        preferredPaymentMethod: values.preferredPaymentMethod,
      };
      const updatePayload: ProfileUpdate = {
        preferences: nextPreferences,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", session.data.user.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", session.data?.user.id] });
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    await saveProfileMutation.mutateAsync(values);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-gold">Perfil</p>
        <h1 className="mt-2 text-3xl font-bold">Sua conta no app</h1>
        <p className="mt-2 text-sm text-muted">Aqui ficam seus dados pessoais e preferencias de uso no aplicativo.</p>
      </header>

      <Card className="overflow-hidden border-gold/20 bg-[linear-gradient(135deg,#14171C,rgba(200,164,93,0.14))]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-lg font-bold text-gold">
              {getInitials(fullName)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <p className="mt-1 text-sm text-muted">{email}</p>
            </div>
          </div>
          <Badge tone="gold">{roleLabel}</Badge>
        </div>
      </Card>

      {session.isLoading || profileQuery.isLoading ? (
        <Card>
          <p className="text-sm text-muted">Carregando seus dados do perfil...</p>
        </Card>
      ) : null}

      {profileQuery.error ? (
        <Card className="border-danger/30">
          <p className="text-sm text-danger">Nao foi possivel carregar o perfil salvo no banco agora.</p>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Dados pessoais</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ProfileField label="Nome completo" value={fullName} />
          <ProfileField label="Telefone" value={phone} />
          <ProfileField label="Endereco" value={address} />
          <ProfileField label="Cadastro criado em" value={createdAt} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Preferencias no app</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ProfileField label="Barbeiro preferido" value={preferredBarber} />
          <ProfileField label="Ultimo servico realizado" value={lastCompletedService} />
          <ProfileField label="Forma de pagamento preferida" value={preferredPaymentMethod} />
          <ProfileField label="Ultima atualizacao do perfil" value={updatedAt} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Editar perfil</h2>
        <Card>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Endereco</span>
                <Input
                  placeholder="Rua, numero, bairro e complemento"
                  disabled={saveProfileMutation.isPending}
                  {...register("address")}
                />
              </label>

              <SelectField
                label="Barbeiro preferido"
                disabled={saveProfileMutation.isPending}
                options={[
                  { label: "Selecione depois", value: "" },
                  ...barbers.map((barber) => ({ label: barber.name, value: barber.name })),
                ]}
                {...register("preferredBarber")}
              />

              <SelectField
                label="Forma de pagamento preferida"
                disabled={saveProfileMutation.isPending}
                options={[
                  { label: "Selecione depois", value: "" },
                  { label: "Pix", value: "Pix" },
                  { label: "Cartao de credito", value: "Cartao de credito" },
                  { label: "Plano mensal", value: "Plano mensal" },
                ]}
                {...register("preferredPaymentMethod")}
              />
            </div>

            {saveProfileMutation.isError ? (
              <p className="text-sm text-danger">
                {saveProfileMutation.error instanceof Error
                  ? saveProfileMutation.error.message
                  : "Nao foi possivel salvar seu perfil agora."}
              </p>
            ) : null}

            {saveProfileMutation.isSuccess ? (
              <p className="text-sm text-success">Perfil atualizado com sucesso.</p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={saveProfileMutation.isPending || session.isLoading || profileQuery.isLoading}>
                {saveProfileMutation.isPending ? "Salvando..." : "Salvar alteracoes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={saveProfileMutation.isPending}
                onClick={() =>
                  reset({
                    address: preferences.address ?? "",
                    preferredBarber: preferences.preferredBarber ?? "",
                    preferredPaymentMethod: preferences.preferredPaymentMethod ?? "",
                  })
                }
              >
                Restaurar dados salvos
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
