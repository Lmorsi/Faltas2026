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
  // --- BLOCO DE DEBUG ---
  console.log("=== DEBUG DE AUTENTICAÇÃO ===");
  console.log("URL Completa:", window.location.href);
  console.log("Hash da URL:", window.location.hash);
  const params = new URLSearchParams(window.location.hash.replace('#', '?'));
  console.log("Tipo detectado no Hash:", params.get('type'));
  // ----------------------

  const initializeAuth = async () => {
    // Verificamos se o hash contém as marcas do Supabase para recuperação
    const hasRecoveryParams = window.location.hash.includes('type=recovery') || 
                             window.location.hash.includes('error_code=otp_expired');

    if (hasRecoveryParams) {
      console.log("Fluxo de recuperação detectado via Hash!");
      setShowResetPassword(true);
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setLoading(false);
  };

  initializeAuth();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("Evento Supabase disparado:", event);
    
    if (event === 'PASSWORD_RECOVERY') {
      setShowResetPassword(true);
      setIsAuthenticated(false);
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
