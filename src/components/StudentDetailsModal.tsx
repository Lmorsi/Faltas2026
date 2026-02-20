import { useState, useEffect } from 'react';
import { X, Calendar, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

type StudentDetailsModalProps = {
  studentId: string;
  studentName: string;
  studentAno: string;
  studentTurma: string;
  onClose: () => void;
};

type ActionTaken = {
  id: string;
  description: string;
  created_at: string;
};

type AbsenceRecord = {
  id: string;
  data_falta: string;
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

const DISCIPLINE_LABELS: Record<string, string> = {
  matematica: 'Matemática',
  lingua_portuguesa: 'Língua Portuguesa',
  historia: 'História',
  geografia: 'Geografia',
  arte: 'Arte',
  lem: 'LEM',
  educacao_fisica: 'Ed. Física',
  pd1: 'PD1',
  pd2: 'PD2',
  pd3: 'PD3',
};

export default function StudentDetailsModal({
  studentId,
  studentName,
  studentAno,
  studentTurma,
  onClose,
}: StudentDetailsModalProps) {
  const [totalFaltas, setTotalFaltas] = useState(0);
  const [actionDescription, setActionDescription] = useState('');
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      const [studentData, actionsData, absencesData] = await Promise.all([
        supabase.from('students').select('total_faltas').eq('id', studentId).maybeSingle(),
        supabase
          .from('actions_taken')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false }),
        supabase
          .from('absences')
          .select('*')
          .eq('student_id', studentId)
          .order('data_falta', { ascending: false }),
      ]);

      if (studentData.data) {
        setTotalFaltas(studentData.data.total_faltas || 0);
      }

      if (actionsData.data) {
        setActions(actionsData.data);
      }

      if (absencesData.data) {
        setAbsences(absencesData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionDescription.trim()) return;

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('actions_taken').insert([
        {
          student_id: studentId,
          description: actionDescription,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setActionDescription('');
      await loadData();
    } catch (error) {
      console.error('Error adding action:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatSeriesTurma = (ano: string, turma: string) => {
    const numero = ano.match(/\d+/)?.[0] || ano;
    return `${numero}º ${turma}`;
  };

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detalhes de Faltas - {studentName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Série/Turma: {formatSeriesTurma(studentAno, studentTurma)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">
                  Total de Faltas (Mais Recente)
                </p>
                <p className="text-4xl font-bold text-blue-900">{totalFaltas}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Medidas Tomadas
            </h3>

            <form onSubmit={handleAddAction} className="mb-6">
              <textarea
                value={actionDescription}
                onChange={(e) => setActionDescription(e.target.value)}
                placeholder="Descreva a medida tomada em relação às faltas..."
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-none bg-white"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !actionDescription.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Adicionar Medida
                </button>
              </div>
            </form>

            {actions.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">Nenhuma medida registrada ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <div key={action.id} className="bg-white rounded-lg p-4 border-2 border-blue-200 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {actions.length - index}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{action.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(action.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Contagens</h3>

            {absences.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">Nenhuma contagem registrada ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {absences.map((absence, index) => {
                  const total = Object.entries(absence)
                    .filter(([key]) => key in DISCIPLINE_LABELS)
                    .reduce((sum, [, value]) => sum + (value as number), 0);

                  const previousAbsence = absences[index + 1];
                  const previousTotal = previousAbsence
                    ? Object.entries(previousAbsence)
                        .filter(([key]) => key in DISCIPLINE_LABELS)
                        .reduce((sum, [, value]) => sum + (value as number), 0)
                    : 0;
                  const increment = previousAbsence ? total - previousTotal : 0;

                  return (
                    <div key={absence.id} className="bg-white border-2 border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-gray-900">{formatDate(absence.data_falta)}</p>
                        <p className="text-sm text-gray-600">
                          Contagem Base <span className="font-bold text-gray-900">• {total} faltas</span>
                        </p>
                      </div>

                      {increment > 0 && (
                        <div className="mb-3 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium inline-block">
                          + {increment} faltas no período
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(absence)
                          .filter(([key]) => key in DISCIPLINE_LABELS)
                          .map(([key, value]) => {
                            if (value === 0) return null;

                            const previousValue = previousAbsence ? (previousAbsence[key as keyof AbsenceRecord] as number) : 0;
                            const hasIncreased = previousAbsence && value > previousValue;
                            const hasDecreased = previousAbsence && value < previousValue;

                            return (
                              <div
                                key={key}
                                className={`rounded px-3 py-2 text-sm ${
                                  hasIncreased
                                    ? 'bg-green-50 border-2 border-green-500'
                                    : hasDecreased
                                    ? 'bg-red-50 border-2 border-red-500'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <span className={hasIncreased ? 'text-green-700' : hasDecreased ? 'text-red-700' : 'text-gray-600'}>
                                  {DISCIPLINE_LABELS[key]}
                                </span>
                                <span className={`font-semibold ml-1 ${hasIncreased ? 'text-green-900' : hasDecreased ? 'text-red-900' : 'text-gray-900'}`}>
                                  {value}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
