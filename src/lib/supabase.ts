import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Mantemos manual
    flowType: 'pkce',
  },
});

// REMOVA o localStorage.clear() daqui de dentro! 
// Ele estava matando o Code Verifier no momento que o App abria.
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔔 Auth Event:', event);
  // Removido o clear() automático
});
