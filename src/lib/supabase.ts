import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Mantemos manual para o ResetPasswordPage
    flowType: 'pkce',
  },
});

// REMOVA O localStorage.clear() DAQUI!
// Ele estava rodando no evento INITIAL_SESSION e apagando o verificador do PKCE.
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔔 Evento Global Auth:', event);
});
