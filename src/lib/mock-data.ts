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

export const timeSlots: TimeSlot[] = [
  { id: "09:00", label: "09:00", status: "available" },
  { id: "09:30", label: "09:30", status: "available" },
  { id: "10:00", label: "10:00", status: "available" },
  { id: "10:30", label: "10:30", status: "available" },
  { id: "11:00", label: "11:00", status: "available" },
  { id: "11:30", label: "11:30", status: "available" },
  { id: "12:00", label: "12:00", status: "available" },
  { id: "12:30", label: "12:30", status: "available" },
  { id: "13:00", label: "13:00", status: "available" },
  { id: "13:30", label: "13:30", status: "available" },
  { id: "14:00", label: "14:00", status: "available" },
  { id: "14:30", label: "14:30", status: "available" },
  { id: "15:00", label: "15:00", status: "available" },
  { id: "15:30", label: "15:30", status: "available" },
  { id: "16:00", label: "16:00", status: "available" },
  { id: "16:30", label: "16:30", status: "available" },
  { id: "17:00", label: "17:00", status: "available" },
  { id: "17:30", label: "17:30", status: "available" },
  { id: "18:00", label: "18:00", status: "available" },
  { id: "18:30", label: "18:30", status: "available" },
  { id: "19:00", label: "19:00", status: "available" },
  { id: "19:30", label: "19:30", status: "available" },
  { id: "20:00", label: "20:00", status: "available" },
];

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
