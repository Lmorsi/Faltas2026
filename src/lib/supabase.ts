import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // OBRIGATÓRIO: Impede o SDK de queimar o code no load
    flowType: 'pkce',
  },
});

// Log para sabermos quando o arquivo é carregado
console.log("🚀 Supabase Client Inicializado (detectSessionInUrl: false)");
