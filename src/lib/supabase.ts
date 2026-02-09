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
