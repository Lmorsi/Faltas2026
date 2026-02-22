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
  const initializeAuth = async () => {
    // 1. Pega os parâmetros tanto do Hash quanto da Query String (?)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const queryParams = new URLSearchParams(window.location.search);
    
    // 2. Verifica se é um fluxo de recuperação (pelo hash ou pelo código na query)
    const isRecovery = hashParams.get('type') === 'recovery' || queryParams.has('code');

    if (isRecovery) {
      console.log("Fluxo de recuperação detectado!");
      setShowResetPassword(true);
      setLoading(false);
      return;
    }

    // 3. Se não for recovery, segue o fluxo normal
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setLoading(false);
  };

  initializeAuth();

  // No onAuthStateChange, mantenha o PASSWORD_RECOVERY
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      setShowResetPassword(true);
      setIsAuthenticated(false);
    }
      } else if (event === 'SIGNED_IN') {
        // Se for um login normal (sem ser recovery), autentica
        if (!isRecoveryURL()) {
          setIsAuthenticated(true);
          setShowResetPassword(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setShowResetPassword(false);
        setShowRegister(false);
        localStorage.clear();
        sessionStorage.clear();
      }
    });

return () => subscription.unsubscribe();
}, []);

  // Tela de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 font-medium">Carregando...</p>
      </div>
    );
  }

  // --- ORDEM DE RENDERIZAÇÃO (IMPORTANTE) ---

  // 1ª Prioridade: Se estiver no fluxo de reset, NADA mais importa
  if (showResetPassword) {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          setShowResetPassword(false);
          setIsAuthenticated(true); // Após resetar, ele já entra no Dashboard
        }}
      />
    );
  }

  // 2ª Prioridade: Se estiver autenticado, mostra o Dashboard
  if (isAuthenticated) {
    return (
      <Dashboard 
        onLogout={() => {
          setIsAuthenticated(false);
          supabase.auth.signOut();
        }} 
      />
    );
  }

  // 3ª Prioridade: Se não estiver logado, alterna entre Login e Registro
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

  // Padrão: Tela de Login
  return (
    <LoginPage
      onLoginSuccess={() => setIsAuthenticated(true)}
      onRegisterClick={() => setShowRegister(true)}
    />
  );
}

export default App;
