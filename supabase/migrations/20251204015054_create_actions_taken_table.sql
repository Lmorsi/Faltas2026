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