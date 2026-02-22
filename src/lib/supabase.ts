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
    // ESSENCIAL: Impede que o SDK tente validar o 'code' automaticamente
    detectSessionInUrl: false, 
    flowType: 'pkce',
  },
});

// Listener apenas para monitoramento (Sem limpezas agressivas)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔔 Evento Global Auth:', event, 'Sessão ativa:', !!session);
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
