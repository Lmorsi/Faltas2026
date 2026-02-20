import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://yrfgmnbhsathkoshzhsy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZmdtbmJoc2F0aGtvc2h6aHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjM2OTAsImV4cCI6MjA4NjIzOTY5MH0.EF2As2aOMF-Ctu-k4CU770zZlNljmyo0hPfCrL7TwaM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('Reading migration file...');
  const sql = readFileSync(join(__dirname, 'apply_migrations.sql'), 'utf8');

  console.log('Applying migrations to Supabase...');

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
        if (error) {
          console.error('Error executing statement:', error);
        } else {
          console.log('✓ Statement executed successfully');
        }
      } catch (err) {
        console.error('Error:', err.message);
      }
    }
  }

  console.log('\nMigrations completed!');
}

runMigrations().catch(console.error);
