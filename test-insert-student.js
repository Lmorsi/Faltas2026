import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const supabaseUrl = 'https://rcweekixfemcbsedkbrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjd2Vla2l4ZmVtY2JzZWRrYnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjU1MzYsImV4cCI6MjA4NzA0MTUzNn0.DY3lgG1ev-lFOwgdN7E1ubqbQo6cJ2dDa6e9u-Hdkko';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testInsertStudent() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   TESTE DE INSERÇÃO DE ESTUDANTE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const email = await question('Digite seu email: ');
  const password = await question('Digite sua senha: ');

  console.log('\n🔄 Fazendo login...\n');

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      console.log('❌ ERRO ao fazer login:', authError.message);
      rl.close();
      return;
    }

    if (!authData.session) {
      console.log('❌ ERRO: Sem sessão criada');
      rl.close();
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('🆔 User ID:', authData.user.id);

    console.log('\n🔄 Tentando adicionar estudante de teste...\n');

    const studentData = {
      nome_completo: 'João da Silva Teste',
      ano: '6º ANO',
      turma: 'A',
      user_id: authData.user.id,
      total_faltas: 0,
      status: 'Regular'
    };

    console.log('Dados do estudante:', studentData);

    const { data: insertData, error: insertError } = await supabase
      .from('students')
      .insert([studentData])
      .select();

    if (insertError) {
      console.log('\n❌ ERRO ao inserir estudante:');
      console.log('   Código:', insertError.code);
      console.log('   Mensagem:', insertError.message);
      console.log('   Detalhes:', insertError.details);
      console.log('   Dica:', insertError.hint);

      if (insertError.code === '42501') {
        console.log('\n💡 DIAGNÓSTICO:');
        console.log('   → Erro de permissão (RLS - Row Level Security)');
        console.log('   → As políticas de segurança podem estar bloqueando a inserção');
        console.log('   → Verifique se as políticas RLS estão configuradas corretamente');
      }
    } else {
      console.log('\n✅ ESTUDANTE ADICIONADO COM SUCESSO!\n');
      console.log('Dados retornados:', insertData);

      console.log('\n🔄 Verificando lista de estudantes...\n');

      const { data: students, error: selectError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', authData.user.id);

      if (selectError) {
        console.log('❌ Erro ao buscar estudantes:', selectError.message);
      } else {
        console.log(`✅ Total de estudantes encontrados: ${students.length}`);
        students.forEach((s, i) => {
          console.log(`\n   ${i + 1}. ${s.nome_completo}`);
          console.log(`      Série/Turma: ${s.ano} - ${s.turma}`);
          console.log(`      Faltas: ${s.total_faltas}`);
          console.log(`      Status: ${s.status}`);
        });
      }
    }

  } catch (err) {
    console.log('❌ ERRO INESPERADO:', err.message);
    console.error(err);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  rl.close();
}

testInsertStudent();
