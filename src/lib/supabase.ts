import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type AccessRequest = {
  id: string;
  email: string;
  status: "pending" | "approved" | "denied";
  created_at: string;
  reviewed_at: string | null;
  notes: string | null;
};

export type Watch = {
  id: string;
  brand: string;
  model: string;
  reference_number: string | null;
  year: number | null;
  description: string;
  price: number;
  condition: "New/Unworn" | "Excellent" | "Very Good" | "Good" | "Fair";
  status: "available" | "on_hold" | "sold";
  location: string;
  shipping_days: number;
  images: string[];
  created_at: string;
  updated_at: string;
};
