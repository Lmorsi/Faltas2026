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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);

      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
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
