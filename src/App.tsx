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
    // 1. Função auxiliar para detectar recuperação de senha
    const checkIsRecovery = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      return queryParams.has('code') || hashParams.get('type') === 'recovery';
    };

    const isRecoveryFlow = checkIsRecovery();

    const initializeAuth = async () => {
      // 2. PRIORIDADE: Se for recuperação, não tocamos na sessão agora
      if (isRecoveryFlow) {
        console.log("🛠️ App: Fluxo de recuperação detectado. Aguardando ResetPasswordPage...");
        setShowResetPassword(true);
        setLoading(false);
        return;
      }

      // 3. Fluxo Normal: Verifica sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    initializeAuth();

    // 4. Ouvinte de eventos (Unificado para evitar conflitos)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Evento de Auth:', event);

      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
        setIsAuthenticated(false);
      } 
      else if (event === 'SIGNED_IN') {
        // Só redireciona para dashboard se não estivermos no meio de um reset
        if (!isRecoveryFlow) {
          setIsAuthenticated(!!session);
          setShowResetPassword(false);
        }
      } 
      else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setShowResetPassword(false);
        setShowRegister(false);
        // IMPORTANTE: Não limpamos o localStorage todo para não matar o verifier do PKCE
        // O Supabase já limpa os tokens de auth automaticamente no logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tela de carregamento
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

  if (showResetPassword) {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          setShowResetPassword(false);
          setIsAuthenticated(true);
          // Limpa a URL após o sucesso
          window.history.replaceState(null, '', window.location.origin);
        }}
      />
    );
  }

  if (isAuthenticated) {
    return <Dashboard onLogout={() => setIsAuthenticated(false)} />;
  }

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

  return (
    <LoginPage
      onLoginSuccess={() => setIsAuthenticated(true)}
      onRegisterClick={() => setShowRegister(true)}
    />
  );
}

export default App;
