import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anon) {
  // Hilft beim lokalen Debugging, wenn ENV vergessen wurde
  // (nicht "throw", damit die App-UI sauber eine Fehlermeldung zeigen kann)
  console.warn("[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: false }, // wir nutzen keine Supabase-User-Session hier
});

