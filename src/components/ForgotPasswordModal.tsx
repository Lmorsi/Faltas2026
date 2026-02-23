import { useState } from 'react';import { useState } from 'react';
import { X, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // ESSENCIAL: Deve ser a mesma URL que está no seu Dashboard do Supabase
        redirectTo: 'https://faltas2026.vercel.app/',
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Link de recuperação enviado! Verifique sua caixa de entrada e spam.'
      });
      
      // Limpa o campo após sucesso
      setEmail('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Erro ao enviar e-mail de recuperação.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recuperar Senha</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {message?.type === 'success' ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <p className="text-gray-700 mb-6">{message.text}</p>
              <button
                onClick={onClose}
                className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-all"
              >
                Entendi
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-600 text-sm">
                Insira o seu e-mail cadastrado. Enviaremos um link seguro para você criar uma nova senha.
              </p>

              {message?.type === 'error' && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                  {message.text}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3D4A5C] hover:bg-[#2B3544] text-white py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando link...
                  </>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
