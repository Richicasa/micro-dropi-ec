// ==============================================================================
// CLIENTE SUPABASE - MICRO-DROPI ECUADOR
// ==============================================================================
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes("tu-proyecto") &&
  supabaseUrl.startsWith("http")
);

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseAdminConfigured = Boolean(
  isSupabaseConfigured &&
  serviceRoleKey &&
  !serviceRoleKey.includes("tu-service-role")
);

// Cliente estándar para Server Actions y scripts de Node.js
export const supabase = isSupabaseConfigured
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente Admin (Service Role) con privilegios elevados para auth y backend
export function getSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured) {
    return null;
  }
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Cliente SSR con sincronización automática de cookies para navegador
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) {
    return null;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

