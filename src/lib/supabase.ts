import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // DESATIVADO: Impede que o cliente global "roube" o code da URL antes da hora
    detectSessionInUrl: false, 
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce',
  },
});

// Listener simplificado (Removido lógicas que podem causar loops ou consumos indevidos)
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth event:', event, 'Session active:', !!session);

  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    localStorage.clear();
    sessionStorage.clear();
  }
});

export type Student = {
  id: string;
  nome_completo: string;
  ano: string;
  turma: string;
  total_faltas: number;
  status: string;
  created_at: string;
  user_id: string;
};
