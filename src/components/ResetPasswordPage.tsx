import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ResetPasswordPageProps = {
  onSuccess: () => void;
};

export default function ResetPasswordPage({ onSuccess }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Pequeno delay para garantir que o SDK do Supabase processe o code da URL
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        setError('O link de recuperação expirou ou é inválido.');
      }
      setChecking(false);
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      // 1. Limpa COMPLETAMENTE a URL (Hash e Query Parameters)
      // Isso evita que o App.tsx detecte o 'code' novamente se a página recarregar
      window.history.replaceState(null, '', window.location.origin);

      // 2. Avisa o App.tsx que deu certo (ele vai mudar para o Dashboard)
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  // Estado de carregamento inicial enquanto verifica a sessão
  if (checking) {
    return (
      <div className="min-h-screen bg-[#2B3544] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Validando seu acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2B3544] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white md:bg-[#404B5C] rounded-lg overflow-hidden shadow-2xl flex">
        {/* Lado Esquerdo - Info (Desktop) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#3B5998] to-[#2E5CB8] p-12 flex-col justify-center text-white">
          <h1 className="text-4xl font-bold mb-4">
            Sistema de<br />Controle de Faltas
          </h1>
          <p className="text-lg mb-8 text-white/90 leading-relaxed">
            Sua segurança é nossa prioridade. Redefina sua senha agora para recuperar o acesso ao painel de gerenciamento.
          </p>
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg border border-white/20">
            <Check className="w-6 h-6 text-green-400" />
            <p className="text-white/90 text-sm">Crie uma senha forte com letras e números.</p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2B3544] mb-2">Redefinir Senha</h2>
            <p className="text-gray-500 mb-8">Por favor, escolha uma nova senha segura.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isValidSession ? (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita sua nova senha"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3D4A5C] hover:bg-[#2B3544] text-white py-3.5 rounded-lg font-bold shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando nova senha...' : 'Confirmar Redefinição'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 mb-6">
                  <p className="text-sm">
                    Este link expirou por motivos de segurança ou já foi utilizado.
                  </p>
                </div>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-bold transition-colors border border-gray-300"
                >
                  Voltar ao Início
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
