# Guia Rápido: Corrigir Produção

## Problema Atual

1. **Login está bloqueado** - O usuário precisa confirmar o email
2. **Tabelas não existem** - O banco de dados não tem as tabelas necessárias

## Solução em 3 Passos

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto: **rcweekixfemcbsedkbrj**

### Passo 2: Confirmar o Email do Usuário

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Cole este SQL e clique em **Run**:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email = 'lucasmorsi2@gmail.com';
```

### Passo 3: Criar as Tabelas do Sistema

1. Ainda no **SQL Editor**, crie uma **New Query**
2. Copie TODO o conteúdo do arquivo `apply_migrations.sql` (nesta pasta)
3. Cole no editor e clique em **Run**

**OU** se preferir, execute cada bloco separadamente:

#### A) Criar Tabela de Estudantes

```sql
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  ano text NOT NULL,
  turma text NOT NULL,
  total_faltas integer DEFAULT 0,
  status text DEFAULT 'Regular',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own students"
  ON students FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own students"
  ON students FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students"
  ON students FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students"
  ON students FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

#### B) Criar Tabela de Faltas

```sql
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
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own absence records"
  ON absences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own absence records"
  ON absences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own absence records"
  ON absences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own absence records"
  ON absences FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

#### C) Criar Tabela de Ações

```sql
CREATE TABLE IF NOT EXISTS actions_taken (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE actions_taken ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own actions"
  ON actions_taken FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions"
  ON actions_taken FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actions"
  ON actions_taken FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own actions"
  ON actions_taken FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS actions_taken_student_id_idx ON actions_taken(student_id);
CREATE INDEX IF NOT EXISTS actions_taken_user_id_idx ON actions_taken(user_id);
```

## Verificar se Funcionou

Execute este SQL para verificar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('students', 'absences', 'actions_taken')
ORDER BY table_name;
```

Deve retornar 3 tabelas.

## Pronto!

Agora você pode:
1. Acessar o site em produção
2. Fazer login com: `lucasmorsi2@gmail.com` / `uni123`
3. Adicionar estudantes
4. Registrar faltas
5. Gerar relatórios

## Dicas

- Se ainda tiver problemas, limpe o cache do navegador (Ctrl + Shift + Delete)
- Tente fazer logout e login novamente
- Verifique se as 3 tabelas foram criadas no SQL Editor
