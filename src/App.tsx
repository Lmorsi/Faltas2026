import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import ResetPasswordPage from './components/ResetPasswordPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
  const queryParams = new URLSearchParams(window.location.search);
  const hasCode = queryParams.has('code');

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    // SÓ limpa o storage se REALMENTE for um logout e NÃO estivermos tentando recuperar a senha
    if (event === 'SIGNED_OUT' && !hasCode) {
      console.log("🧹 Limpando storage após logout seguro.");
      localStorage.removeItem('supabase.auth.token'); // Remova apenas a chave do supabase, não tudo
    }
  });

    const isRecoveryFlow = checkIsRecovery();

    const initializeAuth = async () => {
      // 1. PRIORIDADE: Se for um link de recuperação, abre a tela de reset e PARA.
      // Isso evita que o App.tsx "queime" o token único (code) do Supabase.
      if (isRecoveryFlow) {
        console.log("🛠️ Fluxo de recuperação detectado. Aguardando ResetPasswordPage...");
        setShowResetPassword(true);
        setLoading(false);
        return; 
      }

      // 2. Fluxo Normal: Verifica se existe uma sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    initializeAuth();

    /**
     * Ouvinte de eventos de autenticação
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Evento de Auth:', event);

      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
        setIsAuthenticated(false);
      } 
      else if (event === 'SIGNED_IN') {
        // Só entra no Dashboard se não for um retorno de link de senha
        if (!isRecoveryFlow) {
          setIsAuthenticated(!!session);
          setShowResetPassword(false);
        }
      } 
      else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setShowResetPassword(false);
        setShowRegister(false);
        localStorage.clear();
        sessionStorage.clear();
      }
    });

    return () => subscription.unsubscribe();
}, []);

  // Tela de carregamento inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // --- HIERARQUIA DE TELAS ---

  // 1. Reset de Senha (Prioridade Máxima)
  if (showResetPassword) {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          setShowResetPassword(false);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // 2. Dashboard (Usuário Autenticado)
  if (isAuthenticated) {
    return (
      <Dashboard 
        onLogout={() => {
          setIsAuthenticated(false);
        }} 
      />
    );
  }

  // 3. Registro
  if (showRegister) {
    return (
      <RegisterPage
        onBack={() => setShowRegister(false)}
        onRegisterSuccess={() => {
          setShowRegister(false);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // 4. Login (Padrão)
  return (
    <LoginPage
      onLoginSuccess={() => setIsAuthenticated(true)}
      onRegisterClick={() => setShowRegister(true)}
    />
  );
}

export default App;
