import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function isValidSupabaseUrl(u?: string) {
  if (!u) return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

if (!isValidSupabaseUrl(url) || !anon) {
  console.warn("[supabase] Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
}

/** 
 * Falls ENV fehlen/ungültig sind, ist `supabase` = null.
 * Komponenten müssen das abfangen und eine klare Meldung zeigen.
 */
export const supabase = (isValidSupabaseUrl(url) && !!anon)
  ? createClient(url!, anon!, { auth: { persistSession: false } })
  : null;
