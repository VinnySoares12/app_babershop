import { create } from "zustand";

type PlanState = {
  selectedPlanId: string;
  setSelectedPlanId: (planId: string) => void;
};

export const usePlanStore = create<PlanState>((set) => ({
  selectedPlanId: "",
  setSelectedPlanId: (planId) => set({ selectedPlanId: planId }),
}));
