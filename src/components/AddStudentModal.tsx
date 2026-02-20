import { useState } from 'react';
import { X, Plus } from 'lucide-react';

type AddStudentModalProps = {
  onClose: () => void;
  onAdd: (student: { nome_completo: string; ano: string; turma: string }) => void;
};

const ANOS = ['6º ANO', '7º ANO', '8º ANO', '9º ANO'];
const TURMAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function AddStudentModal({ onClose, onAdd }: AddStudentModalProps) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [ano, setAno] = useState('');
  const [turma, setTurma] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nomeCompleto.trim() && ano && turma) {
      console.log('Formulário submetido:', { nome_completo: nomeCompleto.trim(), ano, turma });
      onAdd({ nome_completo: nomeCompleto.trim(), ano, turma });
      setNomeCompleto('');
      setAno('');
      setTurma('');
    } else {
      console.error('Campos obrigatórios não preenchidos:', { nomeCompleto, ano, turma });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Adicionar Novo Estudante</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              placeholder="Digite o nome completo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <select
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                required
              >
                <option value="">Selecione o ano</option>
                {ANOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turma
              </label>
              <select
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                required
              >
                <option value="">Selecione a turma</option>
                {TURMAS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              <X className="w-5 h-5 inline mr-1" />
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
