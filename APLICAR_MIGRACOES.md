# Como Aplicar as Migrações no Supabase de Produção

O erro "Could not find the table 'public.students' in the schema cache" significa que as tabelas não foram criadas no banco de dados de produção. Você precisa executar as migrações manualmente.

## Passo a Passo

### 1. Acesse o SQL Editor do Supabase

1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `rcweekixfemcbsedkbrj`
4. No menu lateral, clique em **SQL Editor**

### 2. Execute as Migrações na Ordem

Execute cada SQL abaixo em ordem, um de cada vez:

#### Migração 1: Criar Tabela de Estudantes

```sql
/*
  # Create Students Table

  1. New Tables
    - `students`
      - `id` (uuid, primary key) - Unique identifier
      - `nome_completo` (text) - Student's full name
      - `ano` (text) - School year (6º ANO, 7º ANO, 8º ANO, 9º ANO)
      - `turma` (text) - Class (A through L)
      - `total_faltas` (integer) - Total absences count
      - `status` (text) - Student status
      - `created_at` (timestamptz) - Record creation timestamp
      - `user_id` (uuid) - Reference to authenticated user who created the record

  2. Security
    - Enable RLS on `students` table
    - Add policy for authenticated users to read their own students
    - Add policy for authenticated users to insert their own students
    - Add policy for authenticated users to update their own students
    - Add policy for authenticated users to delete their own students
*/

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

#### Migração 2: Criar Tabela de Faltas

```sql
/*
  # Create Absences Table

  1. New Tables
    - `absences`
      - `id` (uuid, primary key) - Unique identifier
      - `student_id` (uuid) - Reference to student
      - `data_falta` (date) - Date of the absence
      - `matematica` (integer) - Absences in Mathematics
      - `lingua_portuguesa` (integer) - Absences in Portuguese
      - `historia` (integer) - Absences in History
      - `geografia` (integer) - Absences in Geography
      - `arte` (integer) - Absences in Art
      - `lem` (integer) - Absences in LEM (Foreign Language)
      - `educacao_fisica` (integer) - Absences in Physical Education
      - `pd1` (integer) - Absences in PD1
      - `pd2` (integer) - Absences in PD2
      - `pd3` (integer) - Absences in PD3
      - `created_at` (timestamptz) - Record creation timestamp
      - `user_id` (uuid) - Reference to authenticated user

  2. Security
    - Enable RLS on `absences` table
    - Add policy for authenticated users to read their own absence records
    - Add policy for authenticated users to insert their own absence records
    - Add policy for authenticated users to update their own absence records
    - Add policy for authenticated users to delete their own absence records
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
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own absence records"
  ON absences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own absence records"
  ON absences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own absence records"
  ON absences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own absence records"
  ON absences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Migração 3: Criar Tabela de Ações Tomadas

```sql
/*
  # Create actions_taken table

  1. New Tables
    - `actions_taken`
      - `id` (uuid, primary key) - Unique identifier
      - `student_id` (uuid, foreign key) - References students table
      - `description` (text) - Description of the action taken
      - `created_at` (timestamptz) - When the action was recorded
      - `user_id` (uuid) - User who recorded the action

  2. Security
    - Enable RLS on `actions_taken` table
    - Add policy for authenticated users to read their own actions
    - Add policy for authenticated users to insert their own actions
    - Add policy for authenticated users to update their own actions
    - Add policy for authenticated users to delete their own actions
*/

CREATE TABLE IF NOT EXISTS actions_taken (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE actions_taken ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own actions"
  ON actions_taken FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions"
  ON actions_taken FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actions"
  ON actions_taken FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own actions"
  ON actions_taken FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS actions_taken_student_id_idx ON actions_taken(student_id);
CREATE INDEX IF NOT EXISTS actions_taken_user_id_idx ON actions_taken(user_id);
```

### 3. Verificar se as Tabelas Foram Criadas

Execute este SQL para verificar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('students', 'absences', 'actions_taken')
ORDER BY table_name;
```

Você deve ver as 3 tabelas listadas:
- actions_taken
- absences
- students

### 4. Confirmar o Usuário (se necessário)

Se ainda não confirmou o email do usuário, execute:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'lucasmorsi2@gmail.com';
```

## Após Aplicar as Migrações

1. Recarregue a página do seu site
2. Faça login novamente
3. Tente adicionar um estudante
4. O sistema deve funcionar normalmente agora

## Solução de Problemas

Se ainda houver erros:

1. Verifique se todas as 3 tabelas foram criadas
2. Verifique se as policies de RLS foram criadas corretamente
3. Certifique-se de que está logado com o usuário correto
4. Limpe o cache do navegador e recarregue a página
