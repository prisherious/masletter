import { createClient } from "@supabase/supabase-js";

const url  = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function ok(u?: string) {
  if (!u) return false;
  try { const p = new URL(u); return p.protocol === "https:" && p.hostname.endsWith(".supabase.co"); }
  catch { return false; }
}

export const supabase = (ok(url) && !!anon)
  ? createClient(url!, anon!, { auth: { persistSession: false } })
  : null;
