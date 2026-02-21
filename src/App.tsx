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
  const [resetLinkError, setResetLinkError] = useState<string | null>(null);

  useEffect(() => {
    // Verifica se há um hash de recuperação de senha na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    const error = hashParams.get('error');
    const errorCode = hashParams.get('error_code');
    const errorDescription = hashParams.get('error_description');

    console.log('URL Hash:', window.location.hash);
    console.log('Access Token:', accessToken);
    console.log('Type:', type);
    console.log('Error:', error, errorCode, errorDescription);

    // Verifica se há erro no link de recuperação
    if (error || errorCode) {
      let errorMessage = 'Erro ao processar o link de recuperação.';

      if (errorCode === 'otp_expired') {
        errorMessage = 'Este link de recuperação expirou. Por favor, solicite um novo link.';
      } else if (errorDescription) {
        errorMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
      }

      setResetLinkError(errorMessage);
      setLoading(false);

      // Limpa o hash da URL após 5 segundos
      setTimeout(() => {
        window.history.replaceState(null, '', window.location.pathname);
      }, 5000);

      return;
    }

    // Se for uma recuperação de senha, mostra a página de reset
    if (accessToken && type === 'recovery') {
      console.log('Detectado fluxo de recuperação de senha');
      setShowResetPassword(true);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão inicial:', session);
      // Verifica novamente o hash antes de definir autenticação
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const isRecovery = hashParams.get('type') === 'recovery';

      if (isRecovery) {
        console.log('Sessão de recovery detectada - não autenticando');
        setShowResetPassword(true);
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(!!session);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);

      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setShowRegister(false);
        setShowResetPassword(false);
        localStorage.clear();
        sessionStorage.clear();
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event');
        setShowResetPassword(true);
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN') {
        // Só autentica se não estiver no fluxo de reset de senha
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isRecovery = hashParams.get('type') === 'recovery';
        console.log('SIGNED_IN - isRecovery:', isRecovery);
        if (!isRecovery) {
          setIsAuthenticated(!!session);
        } else {
          setShowResetPassword(true);
          setIsAuthenticated(false);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // No refresh de token, mantém o estado atual se estiver no reset
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isRecovery = hashParams.get('type') === 'recovery';
        if (!isRecovery && !showResetPassword) {
          setIsAuthenticated(!!session);
        }
      } else {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isRecovery = hashParams.get('type') === 'recovery';
        if (!isRecovery) {
          setIsAuthenticated(!!session);
        }
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
      {resetLinkError ? (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Link Inválido</h3>
              <p className="text-sm text-gray-600 mb-6">{resetLinkError}</p>
              <button
                onClick={() => {
                  setResetLinkError(null);
                  window.history.replaceState(null, '', window.location.pathname);
                }}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                Voltar para o Login
              </button>
            </div>
          </div>
        </div>
      ) : showResetPassword ? (
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
