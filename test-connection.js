import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rcweekixfemcbsedkbrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjd2Vla2l4ZmVtY2JzZWRrYnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjU1MzYsImV4cCI6MjA4NzA0MTUzNn0.DY3lgG1ev-lFOwgdN7E1ubqbQo6cJ2dDa6e9u-Hdkko';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');

  console.log('1. Verificando autenticação...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.log('⚠️  Usuário não está logado (esperado se ainda não criou conta)');
  } else {
    console.log('✅ Usuário logado:', user?.email);
  }

  console.log('\n2. Verificando tabela students...');
  try {
    const { data, error, count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('❌ ERRO: Tabela "students" não existe!');
        console.log('   → Você precisa executar o SQL do arquivo apply_migrations.sql');
      } else {
        console.log('❌ ERRO:', error.message);
      }
    } else {
      console.log('✅ Tabela "students" existe');
      console.log('   Total de registros:', count);
    }
  } catch (err) {
    console.log('❌ ERRO ao acessar tabela:', err.message);
  }

  console.log('\n3. Verificando tabela absences...');
  try {
    const { error } = await supabase
      .from('absences')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('❌ ERRO: Tabela "absences" não existe!');
      } else {
        console.log('❌ ERRO:', error.message);
      }
    } else {
      console.log('✅ Tabela "absences" existe');
    }
  } catch (err) {
    console.log('❌ ERRO ao acessar tabela:', err.message);
  }

  console.log('\n4. Verificando tabela actions_taken...');
  try {
    const { error } = await supabase
      .from('actions_taken')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('❌ ERRO: Tabela "actions_taken" não existe!');
      } else {
        console.log('❌ ERRO:', error.message);
      }
    } else {
      console.log('✅ Tabela "actions_taken" existe');
    }
  } catch (err) {
    console.log('❌ ERRO ao acessar tabela:', err.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 DIAGNÓSTICO:');
  console.log('\nSe você viu erros de "tabela não existe", siga estes passos:');
  console.log('1. Acesse: https://supabase.com/dashboard/project/rcweekixfemcbsedkbrj/sql/new');
  console.log('2. Copie TODO o conteúdo do arquivo "apply_migrations.sql"');
  console.log('3. Cole no SQL Editor e clique em "Run"');
  console.log('4. Execute este script novamente: node test-connection.js');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testConnection();
