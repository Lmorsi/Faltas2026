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
    /**
     * Detecta se a URL contém tokens de recuperação.
     * No fluxo Implicit, os dados cruciais vêm após o '#' (Hash).
     */
    const checkIsRecovery = () => {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      const queryParams = new URLSearchParams(window.location.search);
      
      return (
        hashParams.get('type') === 'recovery' || 
        hashParams.has('access_token') || // Fundamental para o fluxo Implicit
        queryParams.has('code') || 
        window.location.href.includes('reset-password')
      );
    };

    const isRecoveryFlow = checkIsRecovery();

    const initializeAuth = async () => {
      if (isRecoveryFlow) {
        console.log("🛠️ App: Fluxo de recuperação detectado. Mostrando ResetPasswordPage...");
        setShowResetPassword(true);
        setLoading(false);
        return; 
      }

      // Verifica sessão normal apenas se não for recuperação
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Evento de Auth:', event);

      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
        setIsAuthenticated(false);
      } 
      else if (event === 'SIGNED_IN') {
        // Se houver sessão e NÃO for recuperação, vai pro Dashboard
        if (!isRecoveryFlow && session) {
          setIsAuthenticated(true);
          setShowResetPassword(false);
        }
      } 
      else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setShowResetPassword(false);
        setShowRegister(false);
        
        // CUIDADO: Removemos o .clear() total para não quebrar fluxos em andamento.
        // O Supabase já gerencia a remoção dos tokens de auth dele.
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // PRIORIDADE 1: Redefinição de Senha
  if (showResetPassword) {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          setShowResetPassword(false);
          setIsAuthenticated(true);
          // Limpa a URL para evitar re-execução ao atualizar a página
          window.history.replaceState(null, '', window.location.origin);
        }}
      />
    );
  }

  // PRIORIDADE 2: Dashboard
  if (isAuthenticated) {
    return <Dashboard onLogout={() => setIsAuthenticated(false)} />;
  }

  // PRIORIDADE 3: Registro
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

  // PADRÃO: Login
  return (
    <LoginPage
      onLoginSuccess={() => setIsAuthenticated(true)}
      onRegisterClick={() => setShowRegister(true)}
    />
  );
}

export default App;
