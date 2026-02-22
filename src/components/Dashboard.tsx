import { useState, useEffect, useCallback } from 'react';
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

  // 1. loadStudents com useCallback para evitar re-renderizações desnecessárias
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Sessão expirada. Faça login novamente.');

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('nome_completo', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error loading students:', error);
      setErrorMessage(error.message || 'Erro ao carregar lista de alunos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAddStudent = async (studentData: { nome_completo: string; ano: string; turma: string }) => {
    try {
      setErrorMessage('');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage('Sessão expirada. Por favor, faça login novamente.');
        return;
      }

      const newStudent = {
        ...studentData,
        user_id: user.id,
        total_faltas: 0,
        status: 'Regular'
      };

      const { error } = await supabase
        .from('students')
        .insert([newStudent]);

      if (error) throw error;

      await loadStudents();
      setShowAddModal(false);
    } catch (error: any) {
      setErrorMessage(`Erro ao adicionar: ${error.message}`);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este aluno?')) return;
    
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      await loadStudents();
    } catch (error: any) {
      setErrorMessage(`Erro ao excluir: ${error.message}`);
    }
  };

  // 2. Função de Logout Sincronizada com o App.tsx
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao sair do Supabase:', error);
    } finally {
      // Limpeza obrigatória de estados locais
      localStorage.clear();
      sessionStorage.clear();
      onLogout(); // Avisa o App.tsx para desmontar o Dashboard
      window.location.href = '/'; // Redireciona para a raiz de forma limpa
    }
  };

  // --- Lógica de Filtros e Ordenação ---
  const alertsCount = students.filter(s => s.total_faltas >= 5).length;

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nome_completo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSerie = !filterSerie || 
      student.ano.toLowerCase().includes(filterSerie.toLowerCase()) ||
      student.turma.toLowerCase().includes(filterSerie.toLowerCase());
    return matchesSearch && matchesSerie;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'nome': return a.nome_completo.localeCompare(b.nome_completo);
      case 'serie': 
        return a.ano.localeCompare(b.ano) || a.turma.localeCompare(b.turma);
      case 'faltas': return b.total_faltas - a.total_faltas;
      case 'status': return (b.total_faltas >= 5 ? 1 : 0) - (a.total_faltas >= 5 ? 1 : 0);
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Mobile Menu integrado */}
      <header className="bg-[#3D4A5C] text-white px-4 sm:px-6 py-4 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <h1 className="text-base sm:text-xl font-semibold truncate">
              Controle de Faltas
            </h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <nav className="flex gap-2">
              <NavButton 
                active={currentView === 'students'} 
                onClick={() => setCurrentView('students')}
                icon={<Users className="w-5 h-5" />}
                label="Estudantes"
              />
              <NavButton 
                active={currentView === 'reports'} 
                onClick={() => setCurrentView('reports')}
                icon={<FileText className="w-5 h-5" />}
                label="Relatórios"
              />
            </nav>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>

          <button className="lg:hidden p-2" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#3D4A5C] border-t border-gray-600 p-4 shadow-xl">
             <div className="flex flex-col gap-2">
                <button onClick={() => {setCurrentView('students'); setShowMobileMenu(false)}} className="p-3 text-left hover:bg-gray-700 rounded">Estudantes</button>
                <button onClick={() => {setCurrentView('reports'); setShowMobileMenu(false)}} className="p-3 text-left hover:bg-gray-700 rounded">Relatórios</button>
                <button onClick={handleSignOut} className="p-3 text-left bg-red-600/20 text-red-400 rounded">Sair do Sistema</button>
             </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')}><X className="w-5 h-5" /></button>
          </div>
        )}

        {currentView === 'students' ? (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <StatCard label="Total de Estudantes" value={students.length} color="text-blue-600" icon={<Users />} />
              <StatCard label="Alertas Críticos (≥ 5 faltas)" value={alertsCount} color="text-red-600" icon={<AlertTriangle />} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Lista de Chamada</h2>
                  <p className="text-sm text-gray-500">Gerencie a frequência e dados dos alunos</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm font-semibold"
                >
                  <Plus className="w-5 h-5" /> Novo Aluno
                </button>
              </div>

              {/* Filtros */}
              <div className="p-4 bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                <FilterInput label="Buscar Nome" placeholder="Ex: João Silva..." value={searchTerm} onChange={setSearchTerm} />
                <FilterInput label="Filtrar Série/Turma" placeholder="Ex: 8º A..." value={filterSerie} onChange={setFilterSerie} />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ordenar por</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="nome">Nome (A-Z)</option>
                    <option value="serie">Série e Turma</option>
                    <option value="faltas">Mais Faltas</option>
                    <option value="status">Status Crítico</option>
                  </select>
                </div>
              </div>

              <StudentList
                students={sortedStudents}
                loading={loading}
                onDelete={handleDeleteStudent}
                onUpdate={loadStudents}
              />
            </div>
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

// Sub-componentes auxiliares para manter o código limpo
function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
        active ? 'bg-white text-[#3D4A5C] shadow-sm' : 'hover:bg-[#4A5768] text-gray-200'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, color, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`${color} bg-opacity-10 p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

function FilterInput({ label, placeholder, value, onChange }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}
