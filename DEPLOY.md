# Guia de Deploy - Sistema de Gestão Escolar

Este guia irá ajudá-lo a fazer o deploy completo do sistema no Vercel e Supabase para uso em produção.

## Passo 1: Configurar o Supabase

### 1.1 Criar um Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: Sistema Gestao Escolar (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte e guarde-a
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project"
6. Aguarde a criação do projeto (pode levar alguns minutos)

### 1.2 Obter as Credenciais do Supabase

Após a criação do projeto:

1. No menu lateral, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Anote as seguintes informações:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public** key (em "Project API keys")

### 1.3 Executar as Migrações do Banco de Dados

1. No menu lateral do Supabase, clique em **SQL Editor**
2. Clique em "New query"
3. Execute cada migração na ordem abaixo:

#### Migração 1: Criar tabela de estudantes

```sql
/*
  # Criar tabela de estudantes

  1. Nova Tabela
    - `students`
      - `id` (uuid, chave primária)
      - `nome_completo` (text)
      - `ano` (text)
      - `turma` (text)
      - `total_faltas` (integer, padrão 0)
      - `status` (text, padrão 'Regular')
      - `created_at` (timestamptz)
      - `user_id` (uuid, referência para auth.users)

  2. Segurança
    - Habilitar RLS na tabela `students`
    - Adicionar políticas para usuários autenticados lerem e gerenciarem seus próprios estudantes
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  ano text NOT NULL,
  turma text NOT NULL,
  total_faltas integer DEFAULT 0,
  status text DEFAULT 'Regular',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own students"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students"
  ON students FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Migração 2: Criar tabela de faltas

```sql
/*
  # Criar tabela de faltas

  1. Nova Tabela
    - `absences`
      - `id` (uuid, chave primária)
      - `student_id` (uuid, referência para students)
      - `data_falta` (date)
      - Colunas para cada disciplina (integer, padrão 0)
      - `created_at` (timestamptz)
      - `user_id` (uuid, referência para auth.users)

  2. Segurança
    - Habilitar RLS na tabela `absences`
    - Adicionar políticas para usuários autenticados gerenciarem faltas de seus estudantes
*/

CREATE TABLE IF NOT EXISTS absences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  data_falta date NOT NULL,
  matematica integer DEFAULT 0,
  lingua_portuguesa integer DEFAULT 0,
  historia integer DEFAULT 0,
  geografia integer DEFAULT 0,
  arte integer DEFAULT 0,
  lem integer DEFAULT 0,
  educacao_fisica integer DEFAULT 0,
  pd1 integer DEFAULT 0,
  pd2 integer DEFAULT 0,
  pd3 integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view absences of their own students"
  ON absences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert absences for their own students"
  ON absences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update absences of their own students"
  ON absences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete absences of their own students"
  ON absences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Migração 3: Criar tabela de ações tomadas

```sql
/*
  # Criar tabela de ações tomadas

  1. Nova Tabela
    - `actions_taken`
      - `id` (uuid, chave primária)
      - `student_id` (uuid, referência para students)
      - `description` (text)
      - `created_at` (timestamptz)
      - `user_id` (uuid, referência para auth.users)

  2. Segurança
    - Habilitar RLS na tabela `actions_taken`
    - Adicionar políticas para usuários autenticados gerenciarem ações de seus estudantes
*/

CREATE TABLE IF NOT EXISTS actions_taken (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE actions_taken ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view actions for their own students"
  ON actions_taken FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert actions for their own students"
  ON actions_taken FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update actions for their own students"
  ON actions_taken FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete actions for their own students"
  ON actions_taken FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

4. Clique em "Run" para cada migração
5. Verifique se não há erros

### 1.4 Configurar Autenticação

1. No menu lateral, clique em **Authentication**
2. Clique em **Providers**
3. Verifique se o **Email** está habilitado (deve estar por padrão)
4. Clique em **Settings** (dentro de Authentication)
5. Em **Email Auth**, certifique-se de que:
   - "Enable email confirmations" está **DESABILITADO** (para facilitar o uso inicial)
   - Ou configure um serviço de email se quiser confirmações

## Passo 2: Fazer Deploy no Vercel

### 2.1 Preparar o Repositório Git

Se ainda não tiver um repositório Git:

1. Acesse [https://github.com](https://github.com)
2. Crie um novo repositório (pode ser privado)
3. No seu terminal local, execute:

```bash
git init
git add .
git commit -m "Initial commit - Sistema de Gestão Escolar"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin main
```

### 2.2 Deploy no Vercel

1. Acesse [https://vercel.com](https://vercel.com)
2. Faça login (pode usar sua conta do GitHub)
3. Clique em "Add New" > "Project"
4. Importe seu repositório do GitHub
5. Configure o projeto:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 Configurar Variáveis de Ambiente no Vercel

Antes de fazer o deploy, configure as variáveis de ambiente:

1. Na página de configuração do projeto no Vercel
2. Expanda "Environment Variables"
3. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL = (cole a Project URL do seu Supabase)
VITE_SUPABASE_ANON_KEY = (cole a anon public key do seu Supabase)
```

4. Clique em "Deploy"

### 2.4 Aguardar o Deploy

O Vercel irá:
1. Instalar as dependências
2. Fazer o build do projeto
3. Publicar o site

Após alguns minutos, você receberá a URL do seu site em produção!

## Passo 3: Testar o Sistema

1. Acesse a URL fornecida pelo Vercel
2. Crie uma conta de usuário
3. Faça login
4. Teste todas as funcionalidades:
   - Adicionar estudantes
   - Registrar faltas
   - Ver relatórios
   - Adicionar ações tomadas

## Configurações Adicionais (Opcional)

### Domínio Personalizado

1. No Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme as instruções

### Backup do Banco de Dados

1. No Supabase, vá em **Database** > **Backups**
2. Configure backups automáticos (disponível em planos pagos)

### Monitoramento

1. No Vercel: veja logs e analytics em **Analytics** e **Logs**
2. No Supabase: monitore uso em **Settings** > **Usage**

## Suporte e Problemas

### Erros Comuns

1. **Erro de conexão com o banco**: Verifique se as variáveis de ambiente estão corretas
2. **Erro de autenticação**: Verifique as configurações de auth no Supabase
3. **Erro 404**: Certifique-se de que o build foi feito corretamente

### Limites do Plano Gratuito

- **Supabase Free Tier**:
  - 500 MB de banco de dados
  - 1 GB de armazenamento de arquivos
  - 2 GB de largura de banda

- **Vercel Free Tier**:
  - 100 GB de largura de banda
  - Builds ilimitados

Para uso em larga escala, considere fazer upgrade para planos pagos.

## Próximos Passos

Após o deploy bem-sucedido:

1. Compartilhe a URL com sua equipe
2. Crie as primeiras contas de usuário
3. Comece a cadastrar estudantes
4. Configure backups regulares
5. Monitore o uso e performance

## Contato e Suporte

Para problemas técnicos:
- Documentação Vercel: https://vercel.com/docs
- Documentação Supabase: https://supabase.com/docs

---

Desenvolvido com React, TypeScript, Tailwind CSS, Supabase e Vercel.
