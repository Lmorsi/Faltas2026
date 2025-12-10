import { useState, useEffect } from 'react';
import { Download, Printer, BarChart3 } from 'lucide-react';
import { supabase, Student } from '../lib/supabase';
import StudentDetailsModal from './StudentDetailsModal';

export default function Reports() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [serieTurmaFilter, setSerieTurmaFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastAbsenceDates, setLastAbsenceDates] = useState<Record<string, string>>({});
  const [detailsStudent, setDetailsStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadStudents();
    loadLastAbsences();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, nameFilter, serieTurmaFilter]);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('nome_completo', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLastAbsences = async () => {
    try {
      const { data, error } = await supabase
        .from('absences')
        .select('student_id, data_falta')
        .order('data_falta', { ascending: false });

      if (error) throw error;

      const lastDates: Record<string, string> = {};
      data?.forEach((absence) => {
        if (!lastDates[absence.student_id]) {
          lastDates[absence.student_id] = absence.data_falta;
        }
      });

      setLastAbsenceDates(lastDates);
    } catch (error) {
      console.error('Error loading last absences:', error);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (nameFilter) {
      filtered = filtered.filter((s) =>
        s.nome_completo.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (serieTurmaFilter) {
      filtered = filtered.filter((s) => {
        const numero = s.ano.match(/\d+/)?.[0] || s.ano;
        const serieTurma = `${numero}${s.turma}`;
        return serieTurma.toLowerCase().includes(serieTurmaFilter.toLowerCase());
      });
    }

    setFilteredStudents(filtered);
  };

  const formatSeriesTurma = (ano: string, turma: string) => {
    const numero = ano.match(/\d+/)?.[0] || ano;
    return `${numero}${turma}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleExportCSV = () => {
    const headers = ['Estudante', 'Série/Turma', 'Total Faltas', 'Status', 'Última Falta'];
    const rows = filteredStudents.map((student) => [
      student.nome_completo,
      formatSeriesTurma(student.ano, student.turma),
      student.total_faltas.toString(),
      student.total_faltas >= 5 ? 'Crítico' : 'Normal',
      formatDate(lastAbsenceDates[student.id] || ''),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-faltas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDetailsClick = (student: Student) => {
    setDetailsStudent(student);
  };

  const handleCloseDetailsModal = () => {
    setDetailsStudent(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Relatórios e Consultas</h1>
        <p className="text-sm sm:text-base text-gray-600">Busque e analise dados de frequência dos estudantes</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Filtros de Busca</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Nome do Estudante
            </label>
            <input
              type="text"
              placeholder="Digite o nome..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Série/Turma
            </label>
            <input
              type="text"
              placeholder="Digite a série/turma (ex: 6A, 7B)..."
              value={serieTurmaFilter}
              onChange={(e) => setSerieTurmaFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Resultados da Busca</h2>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleExportCSV}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir</span>
                <span className="sm:hidden">Print</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm sm:text-base">Carregando...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm sm:text-base">Nenhum estudante cadastrado ainda</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Estudante
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Série/Turma
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Total Faltas
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Detalhes
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Última Falta
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {student.nome_completo}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {formatSeriesTurma(student.ano, student.turma)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {student.total_faltas}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDetailsClick(student)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Ver detalhes
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              student.total_faltas >= 5
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {student.total_faltas >= 5 ? 'Crítico' : 'Normal'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {formatDate(lastAbsenceDates[student.id] || '')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{student.nome_completo}</h4>
                        <p className="text-xs text-gray-600">
                          Série: {formatSeriesTurma(student.ano, student.turma)}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          student.total_faltas >= 5
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {student.total_faltas >= 5 ? 'Crítico' : 'Normal'}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total de Faltas:</span>
                        <span className="font-medium text-gray-900">{student.total_faltas}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Última Falta:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(lastAbsenceDates[student.id] || '')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDetailsClick(student)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Ver detalhes
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {detailsStudent && (
        <StudentDetailsModal
          studentId={detailsStudent.id}
          studentName={detailsStudent.nome_completo}
          studentAno={detailsStudent.ano}
          studentTurma={detailsStudent.turma}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
}
