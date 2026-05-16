export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
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
      appointments: {
        Row: {
          id: string;
          client_id: string;
          barber_id: string;
          shop_id: string;
          starts_at: string;
          ends_at: string;
          status: string;
          total_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["appointments"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["appointments"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          profile_id: string;
          appointment_id: string | null;
          subscription_id: string | null;
          method: string;
          status: string;
          amount_cents: number;
          pix_payload: string | null;
          pix_qr_code_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
