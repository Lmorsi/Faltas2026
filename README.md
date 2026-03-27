# Sistema de Gestão Escolar

Sistema completo para gestão de estudantes, controle de faltas e acompanhamento pedagógico.

## Funcionalidades

- Cadastro e gerenciamento de estudantes
- Registro detalhado de faltas por disciplina
- Sistema de classificação automática de risco (Regular, Alerta, Crítico)
- Relatórios e estatísticas
- Registro de ações tomadas
- Autenticação segura com Supabase
- Interface responsiva e moderna

## Tecnologias

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Hosting**: Vercel

## Deploy

Para fazer o deploy completo do sistema, siga o guia detalhado em [DEPLOY.md](./DEPLOY.md).

### Resumo Rápido

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações do banco de dados
3. Faça deploy no [Vercel](https://vercel.com)
4. Configure as variáveis de ambiente

## Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Executar

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── LoginPage.tsx          # Página de login
│   ├── RegisterPage.tsx       # Página de registro
│   ├── Dashboard.tsx          # Dashboard principal
│   ├── StudentList.tsx        # Lista de estudantes
│   ├── AddStudentModal.tsx    # Modal para adicionar estudante
│   ├── EditStudentModal.tsx   # Modal para editar estudante
│   ├── StudentDetailsModal.tsx # Modal com detalhes do estudante
│   ├── AbsenceModal.tsx       # Modal para registrar faltas
│   └── Reports.tsx            # Página de relatórios
├── lib/
│   └── supabase.ts           # Cliente Supabase
├── App.tsx                    # Componente principal
└── main.tsx                   # Ponto de entrada

supabase/
└── migrations/               # Migrações do banco de dados
```

## Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Autenticação obrigatória para todas as operações
- Usuários só podem acessar seus próprios dados
- Senhas criptografadas pelo Supabase Auth

## Suporte

Para problemas ou dúvidas, consulte:
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Vercel](https://vercel.com/docs)
- [Guia de Deploy](./DEPLOY.md)

## Licença

MIT
