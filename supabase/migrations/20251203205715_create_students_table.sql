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