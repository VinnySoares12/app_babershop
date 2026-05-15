import { Card } from "@/components/ui/card";

export function SimpleAdminPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm font-semibold text-gold">Gestao</p>
        <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      </header>
      <Card>
        <p className="text-muted">CRUD preparado para conectar com Supabase, RLS e auditoria.</p>
      </Card>
    </div>
  );
}
