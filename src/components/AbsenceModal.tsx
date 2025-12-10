import { useState, useEffect } from 'react';
import { X, Save, ArrowUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AbsenceModalProps = {
  studentId: string;
  studentName: string;
  onClose: () => void;
  onSave: () => void;
};

type AbsenceData = {
  matematica: number;
  lingua_portuguesa: number;
  historia: number;
  geografia: number;
  arte: number;
  lem: number;
  educacao_fisica: number;
  pd1: number;
  pd2: number;
  pd3: number;
};

type AbsenceRecord = AbsenceData & {
  id: string;
  data_falta: string;
};

const DISCIPLINES = [
  { key: 'matematica', label: 'Matemática' },
  { key: 'lingua_portuguesa', label: 'Língua Portuguesa' },
  { key: 'historia', label: 'História' },
  { key: 'geografia', label: 'Geografia' },
  { key: 'arte', label: 'Arte' },
  { key: 'lem', label: 'LEM' },
  { key: 'educacao_fisica', label: 'Educação Física' },
  { key: 'pd1', label: 'PD1' },
  { key: 'pd2', label: 'PD2' },
  { key: 'pd3', label: 'PD3' },
];

export default function AbsenceModal({ studentId, studentName, onClose, onSave }: AbsenceModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [dataFalta, setDataFalta] = useState(today);
  const [absences, setAbsences] = useState<AbsenceData>({
    matematica: 0,
    lingua_portuguesa: 0,
    historia: 0,
    geografia: 0,
    arte: 0,
    lem: 0,
    educacao_fisica: 0,
    pd1: 0,
    pd2: 0,
    pd3: 0,
  });
  const [lastAbsences, setLastAbsences] = useState<AbsenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAbsences();
  }, [studentId]);

  const loadAbsences = async () => {
    try {
      const { data, error } = await supabase
        .from('absences')
        .select('*')
        .eq('student_id', studentId)
        .order('data_falta', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const lastRecord = data[0];
        setLastAbsences({
          matematica: lastRecord.matematica,
          lingua_portuguesa: lastRecord.lingua_portuguesa,
          historia: lastRecord.historia,
          geografia: lastRecord.geografia,
          arte: lastRecord.arte,
          lem: lastRecord.lem,
          educacao_fisica: lastRecord.educacao_fisica,
          pd1: lastRecord.pd1,
          pd2: lastRecord.pd2,
          pd3: lastRecord.pd3,
        });
      }
    } catch (error) {
      console.error('Error loading absences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: keyof AbsenceData, value: string) => {
    const numValue = parseInt(value) || 0;
    setAbsences({ ...absences, [key]: numValue });
  };

  const getDifference = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    return current - previous;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let newAbsences = { ...absences };

      if (lastAbsences) {
        newAbsences = {
          matematica: lastAbsences.matematica + absences.matematica,
          lingua_portuguesa: lastAbsences.lingua_portuguesa + absences.lingua_portuguesa,
          historia: lastAbsences.historia + absences.historia,
          geografia: lastAbsences.geografia + absences.geografia,
          arte: lastAbsences.arte + absences.arte,
          lem: lastAbsences.lem + absences.lem,
          educacao_fisica: lastAbsences.educacao_fisica + absences.educacao_fisica,
          pd1: lastAbsences.pd1 + absences.pd1,
          pd2: lastAbsences.pd2 + absences.pd2,
          pd3: lastAbsences.pd3 + absences.pd3,
        };
      }

      const { error: insertError } = await supabase.from('absences').insert([
        {
          student_id: studentId,
          data_falta: dataFalta,
          ...newAbsences,
          user_id: user.id,
        },
      ]);

      if (insertError) throw insertError;

      const totalFaltas = Object.values(newAbsences).reduce((sum, val) => sum + val, 0);

      const { error: updateStudentError } = await supabase
        .from('students')
        .update({ total_faltas: totalFaltas })
        .eq('id', studentId);

      if (updateStudentError) throw updateStudentError;

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving absences:', error);
    } finally {
      setSaving(false);
    }
  };

  const incrementTotal = Object.values(absences).reduce((sum, val) => sum + val, 0);
  const lastTotal = lastAbsences
    ? Object.values(lastAbsences).reduce((sum, val) => sum + val, 0)
    : 0;
  const newTotal = lastTotal + incrementTotal;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Registrar Contagem de Faltas - {studentName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Falta
            </label>
            <input
              type="date"
              value={dataFalta}
              onChange={(e) => setDataFalta(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Disciplinas</h3>
            <div className="grid grid-cols-2 gap-4">
              {DISCIPLINES.map((discipline) => {
                const currentValue = absences[discipline.key as keyof AbsenceData];
                const lastValue = lastAbsences
                  ? lastAbsences[discipline.key as keyof AbsenceData]
                  : undefined;
                const difference = getDifference(currentValue, lastValue);

                return (
                  <div key={discipline.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {discipline.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={currentValue || ''}
                        onChange={(e) =>
                          handleInputChange(discipline.key as keyof AbsenceData, e.target.value)
                        }
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent ${
                          difference !== null && difference > 0 ? 'pr-16' : ''
                        }`}
                      />
                      {difference !== null && difference > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#3B82F6] font-semibold pointer-events-none">
                          <ArrowUp className="w-4 h-4" />
                          <span className="text-sm">+{difference}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                Total de faltas:{' '}
                <span className="text-lg font-bold">{newTotal}</span>
              </p>
              {incrementTotal > 0 && (
                <div className="flex items-center gap-1 text-[#3B82F6] font-bold text-lg">
                  <ArrowUp className="w-5 h-5" />
                  <span>+{incrementTotal}</span>
                </div>
              )}
            </div>
            {lastAbsences && (
              <p className="text-xs text-blue-700 mt-2">
                Levantamento anterior: {lastTotal} faltas
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando...' : 'Salvar Faltas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
