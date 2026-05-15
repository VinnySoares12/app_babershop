import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";

export function useSession() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });
}
