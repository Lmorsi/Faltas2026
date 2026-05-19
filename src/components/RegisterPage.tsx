import { useState } from 'react';
import { Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

type RegisterPageProps = {
  onBack: () => void;
  onRegisterSuccess: () => void;
};

export default function RegisterPage({ onBack, onRegisterSuccess }: RegisterPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          throw new Error('Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.');
        } else if (error.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Faça login ou use outro email.');
        } else {
          throw error;
        }
      }

      if (data.user) {
        if (data.session) {
          onRegisterSuccess();
        } else {
          setError('Conta criada! Por favor, verifique seu email para confirmar o cadastro antes de fazer login.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
      console.error('Registration error:', err);
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
            Crie sua conta para começar a gerenciar<br />a frequência dos alunos.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-white/90">Cadastro rápido e seguro</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 md:mb-6 transition-colors text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              Voltar para login
            </button>

            <h2 className="text-2xl md:text-3xl font-bold text-[#2B3544] mb-2">Criar conta</h2>
            <p className="text-gray-600 mb-6 md:mb-8">Preencha os dados para se cadastrar</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
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

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua senha"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5998] focus:border-transparent pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1F2937] hover:bg-[#111827] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Já tem uma conta? </span>
                <button
                  type="button"
                  onClick={onBack}
                  className="text-gray-900 font-medium hover:underline"
                >
                  Fazer login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
