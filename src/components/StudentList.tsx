import { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { Student } from '../lib/supabase';
import AbsenceModal from './AbsenceModal';
import EditStudentModal from './EditStudentModal';

type StudentListProps = {
  students: Student[];
  loading: boolean;
  onDelete: (id: string) => void;
  onUpdate: () => void;
};

export default function StudentList({ students, loading, onDelete, onUpdate }: StudentListProps) {
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const formatSeriesTurma = (ano: string, turma: string) => {
    const numero = ano.match(/\d+/)?.[0] || ano;
    return `${numero}${turma}`;
  };

  const handleRowClick = (student: Student) => {
    setSelectedStudent({ id: student.id, name: student.nome_completo });
    setShowAbsenceModal(true);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
  };

  const handleCloseAbsenceModal = () => {
    setShowAbsenceModal(false);
    setSelectedStudent(null);
    onUpdate();
  };

  const handleCloseEditModal = () => {
    setEditingStudent(null);
    onUpdate();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Lista de Estudantes</h3>

        {students.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 text-sm sm:text-base">
              Nenhum estudante cadastrado ainda. Adicione o primeiro estudante.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Série/Turma</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total de Faltas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(student)}
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">{student.nome_completo}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatSeriesTurma(student.ano, student.turma)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{student.total_faltas}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            student.total_faltas >= 5
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {student.total_faltas >= 5 ? 'Crítico' : student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(student);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Editar estudante"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Deseja realmente excluir este estudante?')) {
                                onDelete(student.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Excluir estudante"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(student)}
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
                      {student.total_faltas >= 5 ? 'Crítico' : student.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Faltas:</span> {student.total_faltas}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(student);
                        }}
                        className="text-blue-600 hover:text-blue-700 p-2"
                        title="Editar estudante"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Deseja realmente excluir este estudante?')) {
                            onDelete(student.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Excluir estudante"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showAbsenceModal && selectedStudent && (
        <AbsenceModal
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          onClose={handleCloseAbsenceModal}
          onSave={handleCloseAbsenceModal}
        />
      )}

      {editingStudent && (
        <EditStudentModal
          studentId={editingStudent.id}
          currentName={editingStudent.nome_completo}
          currentAno={editingStudent.ano}
          currentTurma={editingStudent.turma}
          onClose={handleCloseEditModal}
          onUpdate={handleCloseEditModal}
        />
      )}
    </div>
  );
}
