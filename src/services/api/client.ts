import { supabase } from "@/services/supabase/client";

export async function callEdgeFunction<TResponse>(name: string, payload: unknown): Promise<TResponse> {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    throw new Error("Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase.functions.invoke<TResponse>(name, {
    body: (payload ?? {}) as Record<string, unknown>,
  });

  if (error) {
    throw new Error(error.message || "Falha ao chamar backend seguro.");
  }

  return data as TResponse;
}
