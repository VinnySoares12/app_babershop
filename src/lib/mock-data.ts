import type { Appointment, Barber, Plan, Service, TimeSlot } from "@/types/domain";

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
    nextAvailable: "Hoje, 17:30",
  },
  {
    id: "barber_luan",
    name: "Luan Reis",
    photoUrl: "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=600&q=80",
    rating: 4.92,
    specialties: ["Navalhado", "Pigmentacao"],
    nextAvailable: "Amanha, 10:00",
  },
];

export const services: Service[] = [
  { id: "srv_cut", name: "Corte", durationMinutes: 45, priceCents: 7000, iconName: "scissors" },
  { id: "srv_beard", name: "Barba", durationMinutes: 30, priceCents: 5000, iconName: "beard" },
  { id: "srv_combo", name: "Corte + Barba", durationMinutes: 75, priceCents: 11000, iconName: "sparkles" },
  { id: "srv_color", name: "Pigmentacao", durationMinutes: 45, priceCents: 9000, iconName: "palette" },
];

export const timeSlots: TimeSlot[] = [
  { id: "09:00", label: "09:00", status: "busy" },
  { id: "10:00", label: "10:00", status: "available" },
  { id: "11:00", label: "11:00", status: "available" },
  { id: "13:30", label: "13:30", status: "blocked" },
  { id: "15:00", label: "15:00", status: "available" },
  { id: "16:30", label: "16:30", status: "available" },
  { id: "18:00", label: "18:00", status: "available" },
  { id: "19:30", label: "19:30", status: "busy" },
];

export const plans: Plan[] = [
  {
    id: "plan_gold",
    name: "Gold",
    priceCents: 14990,
    cutsPerMonth: 2,
    benefits: ["2 cortes por mes", "Prioridade na agenda", "5% de cashback"],
  },
  {
    id: "plan_premium",
    name: "Premium",
    priceCents: 22990,
    cutsPerMonth: 4,
    benefits: ["4 cortes por mes", "10% de cashback", "Cupons exclusivos"],
    highlighted: true,
  },
  {
    id: "plan_vip",
    name: "VIP",
    priceCents: 34990,
    cutsPerMonth: 8,
    benefits: ["Agenda prioritaria", "15% de cashback", "Atendimento VIP"],
  },
];
