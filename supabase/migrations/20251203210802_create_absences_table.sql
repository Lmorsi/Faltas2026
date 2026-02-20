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