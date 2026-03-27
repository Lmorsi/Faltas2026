import { useState } from 'react';
import { X, Mail, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ForgotPasswordModalProps = {
  onClose: () => void;
};

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Usamos a URL de produção fixa para garantir que o redirecionamento
      // do Supabase caia na raiz onde nosso App.tsx processa o fluxo PKCE.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://faltas2026.vercel.app/',
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      console.error('Erro ao enviar email de recuperação:', err);

      let errorMessage = 'Não foi possível enviar o email. Verifique o endereço digitado.';

      // Tratamento de Rate Limit (evita spam de emails no Supabase)
      if (err.message?.includes('rate limit')) {
        errorMessage = 'Muitas solicitações em pouco tempo. Aguarde alguns minutos.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Recuperar Senha</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                <Mail className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verifique seu e-mail</h3>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Enviamos um link de redefinição para <span className="font-semibold text-gray-900">{email}</span>.
                O link expira em breve.
              </p>
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold shadow-md"
              >
                Entendido
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">
                Insira o e-mail associado à sua conta e enviaremos as instruções para criar uma nova senha.
              </p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-tight">
                  Endereço de E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full px-4 py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors font-medium text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {loading ? 'Enviando...' : 'Enviar Link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
