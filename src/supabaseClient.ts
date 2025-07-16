import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://voxwqfuixoewcwmlnbby.supabase.co";      // DEINE URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZveHdxZnVpeG9ld2N3bWxuYmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTg5ODgsImV4cCI6MjA2ODIzNDk4OH0.GqsMzdwin6XtWrfmFxaoGgscySend_iHydNYkzXeyaQ";                     // DEIN ANON KEY
export const supabase = createClient(supabaseUrl, supabaseKey);