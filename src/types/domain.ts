export type AppointmentStatus = "pending_payment" | "confirmed" | "paid" | "completed" | "canceled";
export type SlotStatus = "available" | "busy" | "selected" | "blocked";
export type PaymentMethod = "pix" | "card" | "subscription";

export type Appointment = {
  id: string;
  barberName: string;
  barberPhoto: string;
  serviceName: string;
  dateLabel: string;
  timeLabel: string;
  status: AppointmentStatus;
};

export type Barber = {
  id: string;
  name: string;
  photoUrl: string;
  rating: number;
  specialties: string[];
  nextAvailable: string;
};

export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  iconName: "scissors" | "beard" | "sparkles" | "palette";
};

export type TimeSlot = {
  id: string;
  label: string;
  status: SlotStatus;
};

export type Plan = {
  id: string;
  name: "Gold" | "Premium" | "VIP";
  priceCents: number;
  cutsPerMonth: number;
  benefits: string[];
  highlighted?: boolean;
};
