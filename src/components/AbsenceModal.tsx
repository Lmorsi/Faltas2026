import { useState, useEffect } from 'react';
import { X, Save, ArrowUp } from 'lucide-react';
import { supabase, getStudentStatus } from '../lib/supabase';

type AbsenceModalProps = {
  studentId: string;
  studentName: string;
  onClose: () => void;
  onSave: () => void;
};

type AbsenceData = {
  matematica: number;
  lingua_portuguesa: number;
  ciencias: number;
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
  { key: 'ciencias', label: 'Ciências' },
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
    ciencias: 0,
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
  const [todayAbsences, setTodayAbsences] = useState<AbsenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAbsences();
  }, [studentId]);

  useEffect(() => {
    loadAbsencesForDate(dataFalta);
  }, [dataFalta, studentId]);

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
        const previousAbsences = {
          matematica: lastRecord.matematica,
          lingua_portuguesa: lastRecord.lingua_portuguesa,
          ciencias: lastRecord.ciencias || 0,
          historia: lastRecord.historia,
          geografia: lastRecord.geografia,
          arte: lastRecord.arte,
          lem: lastRecord.lem,
          educacao_fisica: lastRecord.educacao_fisica,
          pd1: lastRecord.pd1,
          pd2: lastRecord.pd2,
          pd3: lastRecord.pd3,
        };
        setLastAbsences(previousAbsences);
        setAbsences(previousAbsences);
      }
    } catch (error) {
      console.error('Error loading absences:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAbsencesForDate = async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('absences')
        .select('*')
        .eq('student_id', studentId)
        .eq('data_falta', date)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const todayRecord = data[0];
        const todayData = {
          matematica: todayRecord.matematica,
          lingua_portuguesa: todayRecord.lingua_portuguesa,
          ciencias: todayRecord.ciencias || 0,
          historia: todayRecord.historia,
          geografia: todayRecord.geografia,
          arte: todayRecord.arte,
          lem: todayRecord.lem,
          educacao_fisica: todayRecord.educacao_fisica,
          pd1: todayRecord.pd1,
          pd2: todayRecord.pd2,
          pd3: todayRecord.pd3,
        };
        setTodayAbsences(todayData);
        setAbsences(todayData);
      } else {
        setTodayAbsences(null);
        if (lastAbsences) {
          setAbsences(lastAbsences);
        }
      }
    } catch (error) {
      console.error('Error loading absences for date:', error);
    }
  };

  const handleInputChange = (key: keyof AbsenceData, value: string) => {
    const numValue = parseInt(value) || 0;
    const baseValue = todayAbsences ? todayAbsences[key] : (lastAbsences ? lastAbsences[key] : 0);
    const finalValue = Math.max(numValue, baseValue);
    setAbsences({ ...absences, [key]: finalValue });
  };

  const getDifference = (current: number, base: number | undefined) => {
    if (base === undefined) return null;
    const diff = current - base;
    return diff > 0 ? diff : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newAbsences = { ...absences };

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
      const newStatus = getStudentStatus(totalFaltas);

      const { error: updateStudentError } = await supabase
        .from('students')
        .update({
          total_faltas: totalFaltas,
          status: newStatus
        })
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

  const currentTotal = Object.values(absences).reduce((sum, val) => sum + val, 0);
  const baseAbsences = todayAbsences || lastAbsences;
  const baseTotal = baseAbsences
    ? Object.values(baseAbsences).reduce((sum, val) => sum + val, 0)
    : 0;
  const periodAbsences = currentTotal - baseTotal;

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
              min={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Apenas datas de hoje em diante podem ser registradas
            </p>
          </div>

          {todayAbsences && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                Existem registros anteriores para esta data. Os valores abaixo refletem o último salvamento.
              </p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contagem Atual de Faltas por Disciplina
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {todayAbsences
                ? 'Atualize os valores para somar mais faltas nesta data.'
                : 'Digite o total acumulado atual. O sistema calculará automaticamente as faltas no período.'
              }
            </p>
            <div className="grid grid-cols-2 gap-4">
              {DISCIPLINES.map((discipline) => {
                const currentValue = absences[discipline.key as keyof AbsenceData];
                const baseValue = baseAbsences
                  ? baseAbsences[discipline.key as keyof AbsenceData]
                  : 0;
                const difference = getDifference(currentValue, baseValue);

                return (
                  <div key={discipline.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {discipline.label}
                      {baseValue > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({todayAbsences ? 'atual' : 'anterior'}: {baseValue})
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={baseValue}
                        placeholder={baseValue.toString()}
                        value={currentValue || ''}
                        onChange={(e) =>
                          handleInputChange(discipline.key as keyof AbsenceData, e.target.value)
                        }
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent ${
                          difference !== null ? 'pr-16' : ''
                        }`}
                      />
                      {difference !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600 font-semibold pointer-events-none">
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

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                Total acumulado:{' '}
                <span className="text-lg font-bold">{currentTotal}</span>
              </p>
            </div>
            {baseAbsences && (
              <div className="space-y-1">
                <p className="text-xs text-blue-700">
                  {todayAbsences ? 'Contagem atual da data' : 'Contagem anterior'}: {baseTotal} faltas
                </p>
                {periodAbsences > 0 && (
                  <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
                    <ArrowUp className="w-4 h-4" />
                    Faltas sendo adicionadas: +{periodAbsences}
                  </p>
                )}
              </div>
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
