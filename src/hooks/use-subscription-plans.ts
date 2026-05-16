import { useQuery } from "@tanstack/react-query";
import { listActivePlans } from "@/services/subscriptions/database";

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: listActivePlans,
  });
}
