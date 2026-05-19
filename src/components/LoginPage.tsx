import { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ForgotPasswordModal from './ForgotPasswordModal';

type LoginPageProps = {
  onLoginSuccess: () => void;
  onRegisterClick: () => void;
};

export default function LoginPage({ onLoginSuccess, onRegisterClick }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession.session) {
        await supabase.auth.signOut();
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha inválidos. Verifique suas credenciais.');
        } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          throw new Error('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada (e spam).');
        } else {
          throw error;
        }
      }

      if (!data.session) {
        throw new Error('Não foi possível criar uma sessão. Por favor, verifique se seu email foi confirmado.');
      }

      if (data.session) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2B3544] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white md:bg-[#404B5C] rounded-lg overflow-hidden shadow-2xl flex">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#3B5998] to-[#2E5CB8] p-12 flex-col justify-center text-white">
          <h1 className="text-4xl font-bold mb-4">
            Sistema Educacional de<br />Controle de Faltas
          </h1>
          <p className="text-lg mb-8 text-white/90">
            Gerencie a frequência dos alunos de forma eficiente<br />e organizada.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-white/90">Acesso seguro para professores e administradores</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2B3544] mb-2">Controle de Faltas</h2>
            <p className="text-gray-600 mb-6 md:mb-8">Sistema Educacional</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário (Email)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5998] focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5998] focus:border-transparent pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#3B5998] focus:ring-[#3B5998]"
                  />
                  <span className="text-sm text-gray-700">Lembrar-me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1F2937] hover:bg-[#111827] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="mt-6 text-center">
                <span className="text-gray-500">ou</span>
              </div>

              <div className="mt-4 text-center text-sm">
                <span className="text-gray-600">Não tem uma conta? </span>
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="text-gray-900 font-medium hover:underline"
                >
                  Criar conta
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}
