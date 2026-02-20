import { useState, useEffect } from 'react';
import { GraduationCap, Users, FileText, LogOut, AlertTriangle, Plus, Menu, X } from 'lucide-react';
import { supabase, Student } from '../lib/supabase';
import AddStudentModal from './AddStudentModal';
import StudentList from './StudentList';
import Reports from './Reports';

type DashboardProps = {
  onLogout: () => void;
};

export default function Dashboard({ onLogout }: DashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSerie, setFilterSerie] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const [currentView, setCurrentView] = useState<'students' | 'reports'>('students');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('nome_completo', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData: { nome_completo: string; ano: string; turma: string }) => {
    try {
      setErrorMessage('');
      console.log('Tentando adicionar estudante:', studentData);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Erro ao obter usuário:', userError);
        setErrorMessage(`Erro de autenticação: ${userError.message}`);
        return;
      }

      if (!user) {
        console.error('Usuário não autenticado');
        setErrorMessage('Erro: Usuário não está autenticado. Por favor, faça login novamente.');
        return;
      }

      console.log('Usuário autenticado:', user.id);

      const newStudent = {
        ...studentData,
        user_id: user.id,
        total_faltas: 0,
        status: 'Regular'
      };

      console.log('Inserindo estudante no banco:', newStudent);

      const { data, error } = await supabase
        .from('students')
        .insert([newStudent])
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        setErrorMessage(`Erro ao adicionar estudante: ${error.message}`);
        return;
      }

      console.log('Estudante adicionado com sucesso:', data);
      await loadStudents();
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error adding student:', error);
      if (!errorMessage) {
        setErrorMessage(`Erro inesperado: ${error?.message || 'Tente novamente'}`);
      }
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      await loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      onLogout();
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      localStorage.clear();
      sessionStorage.clear();
      onLogout();
      window.location.reload();
    }
  };

  const alertsCount = students.filter(s => s.total_faltas >= 5).length;

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nome_completo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSerie = !filterSerie || student.ano.includes(filterSerie);
    return matchesSearch && matchesSerie;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'nome':
        return a.nome_completo.localeCompare(b.nome_completo);
      case 'serie': {
        const anoA = parseInt(a.ano.match(/\d+/)?.[0] || '0');
        const anoB = parseInt(b.ano.match(/\d+/)?.[0] || '0');
        if (anoA !== anoB) return anoA - anoB;
        return a.turma.localeCompare(b.turma);
      }
      case 'faltas':
        return b.total_faltas - a.total_faltas;
      case 'status': {
        const statusA = a.total_faltas >= 5 ? 1 : 0;
        const statusB = b.total_faltas >= 5 ? 1 : 0;
        return statusB - statusA;
      }
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#3D4A5C] text-white px-4 sm:px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className="text-base sm:text-xl font-semibold truncate">
                Sistema de Controle de Faltas
              </h1>
            </div>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-[#4A5768] rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setCurrentView('students')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  currentView === 'students'
                    ? 'bg-white text-[#3D4A5C]'
                    : 'hover:bg-[#4A5768]'
                }`}
              >
                <Users className="w-5 h-5" />
                Estudantes
              </button>
              <button
                onClick={() => setCurrentView('reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  currentView === 'reports'
                    ? 'bg-white text-[#3D4A5C]'
                    : 'hover:bg-[#4A5768]'
                }`}
              >
                <FileText className="w-5 h-5" />
                Relatórios
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          </div>
          {showMobileMenu && (
            <div className="lg:hidden mt-4 space-y-2 border-t border-[#4A5768] pt-4">
              <button
                onClick={() => {
                  setCurrentView('students');
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                  currentView === 'students'
                    ? 'bg-white text-[#3D4A5C]'
                    : 'hover:bg-[#4A5768]'
                }`}
              >
                <Users className="w-5 h-5" />
                Estudantes
              </button>
              <button
                onClick={() => {
                  setCurrentView('reports');
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                  currentView === 'reports'
                    ? 'bg-white text-[#3D4A5C]'
                    : 'hover:bg-[#4A5768]'
                }`}
              >
                <FileText className="w-5 h-5" />
                Relatórios
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-3 bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {currentView === 'students' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">Total de Estudantes</p>
                    <p className="text-3xl sm:text-4xl font-bold text-[#3B82F6]">{students.length}</p>
                  </div>
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-[#3B82F6] opacity-60" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">Alertas Críticos</p>
                    <p className="text-3xl sm:text-4xl font-bold text-[#EF4444]">{alertsCount}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-[#EF4444] opacity-60" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Gerenciar Estudantes</h2>
                  <p className="text-gray-600 text-xs sm:text-sm">Adicione e gerencie os dados dos estudantes</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Estudante
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Buscar por Nome
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite o nome do estudante..."
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Filtrar por Série
                  </label>
                  <input
                    type="text"
                    value={filterSerie}
                    onChange={(e) => setFilterSerie(e.target.value)}
                    placeholder="Digite a série (ex: 6A, 7B, 8A)..."
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  >
                    <option value="nome">Nome</option>
                    <option value="serie">Série/Turma</option>
                    <option value="faltas">Total de Faltas</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
            </div>

            <StudentList
              students={sortedStudents}
              loading={loading}
              onDelete={handleDeleteStudent}
              onUpdate={loadStudents}
            />
          </>
        ) : (
          <Reports />
        )}
      </main>

      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStudent}
        />
      )}
    </div>
  );
}
