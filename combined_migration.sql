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
  USING (auth.uid() = user_id);/*
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
  USING (auth.uid() = user_id);/*
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