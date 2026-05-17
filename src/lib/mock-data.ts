import { getTodayDateKey } from "@/lib/booking";
import type { Appointment, Barber, Plan, Service } from "@/types/domain";

export const nextAppointment: Appointment = {
  id: "apt_01",
  barberName: "Rafael Saviella",
  barberPhoto: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80",
  serviceName: "Corte + Barba",
  dateLabel: "Sexta, 17 mai",
  timeLabel: "18:30",
  status: "confirmed",
};

export const barbers: Barber[] = [
  {
    id: "barber_rafael",
    name: "Rafael Saviella",
    photoUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80",
    rating: 4.98,
    specialties: ["Degrade", "Barba", "Acabamento"],
  },
  {
    id: "barber_luan",
    name: "Luan Reis",
    photoUrl: "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=600&q=80",
    rating: 4.92,
    specialties: ["Navalhado", "Pigmentacao"],
  },
];

export const services: Service[] = [
  { id: "srv_beard", name: "Barba", durationMinutes: 30, priceCents: 2000, iconName: "beard" },
  { id: "srv_cut", name: "Corte", durationMinutes: 45, priceCents: 4000, iconName: "scissors" },
  { id: "srv_combo", name: "Corte + Barba", durationMinutes: 75, priceCents: 7000, iconName: "sparkles" },
  { id: "srv_kids", name: "Corte Infantil", durationMinutes: 45, priceCents: 3500, iconName: "scissors" },
  { id: "srv_eyebrow", name: "Sobrancelha", durationMinutes: 15, priceCents: 1000, iconName: "palette" },
  { id: "srv_color", name: "Corte + Pigmentação", durationMinutes: 45, priceCents: 9000, iconName: "palette" },
];

export const defaultBookingDate = getTodayDateKey();

export const plans: Plan[] = [
  {
    id: "plan_basic",
    name: "Basic",
    priceCents: 4500,
    cutsPerMonth: 1,
    description: "Corte Avulso",
    benefits: ["Corte Avulso"],
  },
  {
    id: "plan_gold",
    name: "Gold",
    priceCents: 13000,
    cutsPerMonth: 4,
    description: "Cabelo + Sobrancelha",
    benefits: ["4 cortes por mês", "Cabelo + Sobrancelha"],
  },
  {
    id: "plan_premium",
    name: "Premium",
    priceCents: 15000,
    cutsPerMonth: 4,
    description: "Cabelo + Bigode + Barba",
    benefits: ["4 cortes por mês", "Cabelo + Bigode + Barba"],
    highlighted: true,
  },
];
