import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/services/supabase/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

if (isSupabaseConfigured) {
  console.log("Supabase URL:", supabaseUrl);

  supabase.auth.getSession().then(({ error }) => {
    if (error) {
      console.error("Erro na conexão com o Supabase:", error.message);
      return;
    }

    console.log("Conexão com o Supabase funcionando.");
  });
} else {
  console.warn("Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.");
}
