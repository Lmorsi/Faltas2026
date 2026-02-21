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
    // Verifica se há um hash de recuperação de senha na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    // Se for uma recuperação de senha, mostra a página de reset
    if (accessToken && type === 'recovery') {
      setShowResetPassword(true);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setShowRegister(false);
        setShowResetPassword(false);
        localStorage.clear();
        sessionStorage.clear();
      } else if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN') {
        // Só autentica se não estiver no fluxo de reset de senha
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isRecovery = hashParams.get('type') === 'recovery';
        if (!isRecovery) {
          setIsAuthenticated(!!session);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // No refresh de token, mantém o estado atual se estiver no reset
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isRecovery = hashParams.get('type') === 'recovery';
        if (!isRecovery && !showResetPassword) {
          setIsAuthenticated(!!session);
        }
      } else {
        setIsAuthenticated(!!session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      {showResetPassword ? (
        <ResetPasswordPage
          onSuccess={() => {
            setShowResetPassword(false);
            setIsAuthenticated(true);
          }}
        />
      ) : !isAuthenticated ? (
        showRegister ? (
          <RegisterPage
            onBack={() => setShowRegister(false)}
            onRegisterSuccess={() => {
              setShowRegister(false);
              setIsAuthenticated(true);
            }}
          />
        ) : (
          <LoginPage
            onLoginSuccess={() => setIsAuthenticated(true)}
            onRegisterClick={() => setShowRegister(true)}
          />
        )
      ) : (
        <Dashboard onLogout={() => setIsAuthenticated(false)} />
      )}
    </>
  );
}

export default App;
