import { useState, useEffect, useCallback } from 'react';
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

  /**
   * MEMOIZED HELPER: Detecta se a URL atual contém tokens de recuperação.
   * No fluxo Implicit, o access_token vem no Hash (#).
   */
  const checkIsRecovery = useCallback(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Verifica se existe indicação de recovery no hash ou na query
    return (
      hash.includes('type=recovery') || 
      hash.includes('access_token=') || 
      search.includes('type=recovery') ||
      window.location.pathname.includes('reset-password')
    );
  }, []);

  useEffect(() => {
    const isRecovery = checkIsRecovery();

    const initializeAuth = async () => {
      console.log("🚀 Inicializando Auth. Recovery detectado?", isRecovery);

      if (isRecovery) {
        // Se for recuperação, forçamos a tela de reset e paramos o loading
        setShowResetPassword(true);
        setLoading(false);
        return;
      }

      // Fluxo normal: Verifica se já existe uma sessão salva no navegador
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    initializeAuth();

    /**
     * Listener de eventos de autenticação
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Evento Global de Auth:', event);

      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
        setIsAuthenticated(false);
      } 
      else if (event === 'SIGNED_IN') {
        // Só redireciona para o Dashboard se não estivermos no meio de um reset de senha
        if (!checkIsRecovery()) {
          setIsAuthenticated(true);
          setShowResetPassword(false);
        }
      } 
      else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setShowResetPassword(false);
        setShowRegister(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkIsRecovery]);

  // 1. Tela de Carregamento Global
  if (loading) {
    return (
      <div className="min-h-screen bg-[#2B3544] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-medium animate-pulse">Sincronizando com Supabase...</p>
        </div>
      </div>
    );
  }

  // --- HIERARQUIA DE TELAS ---

  // 2. TELA DE RESET (Prioridade máxima se detectado fluxo de recuperação)
  if (showResetPassword) {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          setShowResetPassword(false);
          setIsAuthenticated(true);
          // Limpa o hash da URL (remover tokens visíveis)
          window.history.replaceState(null, '', window.location.origin);
        }}
      />
    );
  }

  // 3. DASHBOARD (Se autenticado e não estiver em recuperação)
  if (isAuthenticated) {
    return (
      <Dashboard 
        onLogout={() => {
          setIsAuthenticated(false);
        }} 
      />
    );
  }

  // 4. REGISTRO
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

  // 5. LOGIN (Padrão)
  return (
    <LoginPage
      onLoginSuccess={() => setIsAuthenticated(true)}
      onRegisterClick={() => setShowRegister(true)}
    />
  );
}

export default App;
