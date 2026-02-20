/*
  # Complete Database Schema Setup

  1. New Tables
    - `students`
      - `id` (uuid, primary key) - Unique identifier for student
      - `nome_completo` (text) - Student's full name
      - `ano` (text) - School year (6º ANO, 7º ANO, 8º ANO, 9º ANO)
      - `turma` (text) - Class designation (A through L)
      - `total_faltas` (integer) - Total count of absences across all subjects
      - `status` (text) - Current student status (Regular, Em Alerta, Crítico)
      - `created_at` (timestamptz) - Timestamp when record was created
      - `user_id` (uuid) - Reference to the authenticated user who owns this record

    - `absences`
      - `id` (uuid, primary key) - Unique identifier for absence record
      - `student_id` (uuid) - Foreign key reference to students table
      - `data_falta` (date) - Date when absences occurred
      - `matematica` (integer) - Number of absences in Mathematics class
      - `lingua_portuguesa` (integer) - Number of absences in Portuguese Language class
      - `historia` (integer) - Number of absences in History class
      - `geografia` (integer) - Number of absences in Geography class
      - `arte` (integer) - Number of absences in Art class
      - `lem` (integer) - Number of absences in Foreign Language class
      - `educacao_fisica` (integer) - Number of absences in Physical Education class
      - `pd1` (integer) - Number of absences in Elective 1
      - `pd2` (integer) - Number of absences in Elective 2
      - `pd3` (integer) - Number of absences in Elective 3
      - `created_at` (timestamptz) - Timestamp when record was created
      - `user_id` (uuid) - Reference to the authenticated user who owns this record

    - `actions_taken`
      - `id` (uuid, primary key) - Unique identifier for action record
      - `student_id` (uuid) - Foreign key reference to students table
      - `description` (text) - Detailed description of the action taken
      - `created_at` (timestamptz) - Timestamp when action was recorded
      - `user_id` (uuid) - Reference to the authenticated user who recorded the action

  2. Security
    - Enable Row Level Security (RLS) on all tables
    - All tables restricted by default - no access without policies
    - Separate policies for SELECT, INSERT, UPDATE, and DELETE operations
    - All policies require authentication and verify user ownership via user_id
    - Cascade deletion ensures data integrity when students or users are removed

  3. Important Notes
    - All policies use `auth.uid()` to verify the current authenticated user
    - Each table links records to users via `user_id` foreign key
    - ON DELETE CASCADE ensures related records are automatically cleaned up
    - Default values prevent null issues (e.g., total_faltas defaults to 0)
    - Indexes on actions_taken improve query performance for foreign key lookups
*/

-- Create students table
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

-- Create absences table
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

-- Create actions_taken table
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS actions_taken_student_id_idx ON actions_taken(student_id);
CREATE INDEX IF NOT EXISTS actions_taken_user_id_idx ON actions_taken(user_id);

-- Optional: Confirm user email (uncomment if needed)
-- UPDATE auth.users
-- SET email_confirmed_at = NOW(), confirmed_at = NOW()
-- WHERE email = 'lucasmorsi2@gmail.com';
