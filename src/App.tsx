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
     * Helper para detectar se a URL atual contém tokens de recuperação.
     * Verifica tanto na Query String (?code=) quanto no Hash (#type=recovery).
     */
    const checkIsRecovery = () => {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      const queryParams = new URLSearchParams(window.location.search);
      
      return (
        hashParams.get('type') === 'recovery' || 
        queryParams.has('code') || 
        window.location.href.includes('reset-password')
      );
    };

    const initializeAuth = async () => {
      // 1. Verifica imediatamente se o usuário veio pelo link de e-mail
      if (checkIsRecovery()) {
        console.log("🛠️ Fluxo de recuperação detectado na carga inicial.");
        setShowResetPassword(true);
        setLoading(false);
        return; 
      }

      // 2. Se não for recuperação, verifica sessão normal
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    initializeAuth();

    /**
     * Ouvinte de eventos do Supabase para lidar com mudanças em tempo real
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Evento de Auth:', event);

      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
        setIsAuthenticated(false);
      } 
      else if (event === 'SIGNED_IN') {
        // Só redireciona para o Dashboard se NÃO estivermos no fluxo de reset
        if (!checkIsRecovery()) {
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
          <p className="text-gray-600 font-medium">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // --- HIERARQUIA DE RENDERIZAÇÃO ---

  // 1. Prioridade Total: Reset de Senha
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

  // 2. Dashboard: Usuário Logado
  if (isAuthenticated) {
    return (
      <Dashboard 
        onLogout={() => {
          setIsAuthenticated(false);
        }} 
      />
    );
  }

  // 3. Registro: Tela de Cadastro
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

  // 4. Default: Tela de Login
  return (
    <LoginPage
      onLoginSuccess={() => setIsAuthenticated(true)}
      onRegisterClick={() => setShowRegister(true)}
    />
  );
}

export default App;
