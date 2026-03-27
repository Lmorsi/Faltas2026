import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigrations() {
  console.log('🚀 Iniciando aplicação das migrações...\n');

  try {
    const sqlContent = readFileSync(join(__dirname, 'apply_migrations.sql'), 'utf-8');

    console.log('📄 Lendo arquivo de migração: apply_migrations.sql');
    console.log('📊 Tamanho do SQL:', sqlContent.length, 'caracteres\n');

    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log('📝 Total de comandos SQL a executar:', statements.length, '\n');

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⏳ Executando comando ${i + 1}/${statements.length}...`);

      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        if (error.message && error.message.includes('already exists')) {
          console.log(`⚠️  Comando ${i + 1} - Objeto já existe (ignorando)`);
        } else {
          console.error(`❌ Erro no comando ${i + 1}:`, error.message);
        }
      } else {
        console.log(`✅ Comando ${i + 1} - Executado com sucesso`);
      }
    }

    console.log('\n✅ Migrações aplicadas com sucesso!');
    console.log('\n📋 Verificando tabelas criadas...\n');

    const { data: tables, error: tablesError } = await supabase
      .from('students')
      .select('count');

    if (tablesError) {
      console.log('⚠️  Tabela students ainda não está acessível. Execute o SQL manualmente no dashboard.');
      console.log('🔗 https://supabase.com/dashboard/project/rcweekixfemcbsedkbrj/sql/new');
    } else {
      console.log('✅ Tabela students está acessível e funcionando!');
    }

  } catch (error) {
    console.error('\n❌ Erro ao aplicar migrações:', error.message);
    console.log('\n💡 Solução alternativa:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/rcweekixfemcbsedkbrj/sql/new');
    console.log('2. Cole o conteúdo do arquivo apply_migrations.sql');
    console.log('3. Clique em "Run"');
    process.exit(1);
  }
}

applyMigrations();
