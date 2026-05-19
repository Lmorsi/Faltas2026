/*
  # Add archived column to students table

  1. Changes
    - `students`: add `archived` boolean column (default false)
      - When true, the student is hidden from the main list and shown in a separate archived view.

  2. Notes
    - Existing rows default to false (not archived), preserving all current data.
    - No RLS changes needed; existing policies already cover the new column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'archived'
  ) THEN
    ALTER TABLE students ADD COLUMN archived boolean NOT NULL DEFAULT false;
  END IF;
END $$;
