import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';
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

  // useRef é essencial para garantir que a troca só ocorra UMA vez
  const exchangeAttempted = useRef(false);

  useEffect(() => {
  const checkSession = async () => {
    // No modo implicit, o SDK já processa o fragmento da URL (#) automaticamente
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
      console.log("✅ Sessão de recuperação ativa!");
      setIsValidSession(true);
    } else {
      console.error("❌ Erro ou sessão ausente:", error);
      setError('Link inválido ou expirado. Solicite um novo e-mail.');
    }
    setChecking(false);
  };

  // Pequeno delay para garantir que o SDK leu a URL
  const timer = setTimeout(checkSession, 500);
  return () => clearTimeout(timer);
}, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('As senhas não coincidem');
    if (password.length < 6) return setError('Mínimo de 6 caracteres');

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      console.log("✅ Senha atualizada!");
      window.history.replaceState(null, '', window.location.origin);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar nova senha');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#2B3544] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 flex items-center gap-3 shadow-xl">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-gray-700 font-medium">Validando link de segurança...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2B3544] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-slate-800 p-12 text-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">Nova Senha</h2>
          <p className="text-slate-400">Certifique-se de criar uma senha forte para proteger seu acesso ao sistema.</p>
        </div>
        
        <div className="md:w-1/2 p-8 md:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {isValidSession ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Redefinir Senha"}
              </button>
            </form>
          ) : (
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold"
            >
              Voltar ao Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
