export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          description: string | null;
          category: string;
          duration_minutes: number;
          price_cents: number;
          icon_name: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["services"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["services"]["Row"]>;
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          tier: string;
          description: string | null;
          price_cents: number;
          cuts_per_cycle: number;
          cycle: string;
          benefits: Json;
          loyalty_multiplier: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["plans"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["plans"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "client" | "barber" | "manager" | "admin";
          asaas_customer_id: string | null;
          default_shop_id: string | null;
          birthdate: string | null;
          document: string | null;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "client" | "barber" | "manager" | "admin";
          asaas_customer_id?: string | null;
          default_shop_id?: string | null;
          birthdate?: string | null;
          document?: string | null;
          preferences?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          plan_id: string;
          shop_id: string;
          asaas_subscription_id: string | null;
          status: "pending" | "active" | "past_due" | "canceled" | "expired";
          current_cycle_start: string | null;
          current_cycle_end: string | null;
          remaining_cuts: number;
          auto_renew: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          barber_id: string;
          shop_id: string;
          subscription_id: string | null;
          coupon_id: string | null;
          starts_at: string;
          ends_at: string;
          status:
            | "draft"
            | "pending_payment"
            | "pending"
            | "confirmed"
            | "paid"
            | "completed"
            | "canceled"
            | "no_show";
          total_cents: number;
          discount_cents: number;
          cashback_used_cents: number;
          notes: string | null;
          canceled_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["appointments"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["appointments"]["Row"]>;
        Relationships: [];
      };
      appointment_services: {
        Row: {
          appointment_id: string;
          service_id: string;
          price_cents: number;
          duration_minutes: number;
        };
        Insert: Partial<Database["public"]["Tables"]["appointment_services"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["appointment_services"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          profile_id: string;
          appointment_id: string | null;
          subscription_id: string | null;
          method: "PIX" | "CREDIT_CARD" | "CASH" | "SUBSCRIPTION_CREDIT";
          status:
            | "pending"
            | "analyzing"
            | "authorized"
            | "paid"
            | "overdue"
            | "failed"
            | "canceled"
            | "refunded"
            | "refund_denied"
            | "chargeback";
          amount_cents: number;
          asaas_payment_id: string | null;
          asaas_invoice_url: string | null;
          pix_payload: string | null;
          pix_qr_code_url: string | null;
          due_date: string | null;
          paid_at: string | null;
          raw_provider_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      loyalty_accounts: {
        Row: {
          profile_id: string;
          points: number;
          cashback_cents: number;
          vip_level: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["loyalty_accounts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["loyalty_accounts"]["Row"]>;
        Relationships: [];
      };
      loyalty_transactions: {
        Row: {
          id: string;
          profile_id: string;
          appointment_id: string | null;
          kind: string;
          points_delta: number;
          cashback_delta_cents: number;
          description: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["loyalty_transactions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["loyalty_transactions"]["Row"]>;
        Relationships: [];
      };
      notification_events: {
        Row: {
          id: string;
          profile_id: string | null;
          shop_id: string | null;
          title: string;
          body: string;
          kind: string;
          data: Json;
          read_at: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notification_events"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["notification_events"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
