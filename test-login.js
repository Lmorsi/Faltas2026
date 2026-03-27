import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const supabaseUrl = 'https://cxtsvgllisddmvwonsus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dHN2Z2xsaXNkZG12d29uc3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjIzNDIsImV4cCI6MjA4NzAzODM0Mn0.GHR185POIaJoCmSNjP8MiWvBcYkeKeJJsGyzX0wdoZ8';

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

async function testLogin() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   TESTE DE LOGIN - SUPABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const email = await question('Digite seu email: ');
  const password = await question('Digite sua senha: ');

  console.log('\n🔄 Tentando fazer login...\n');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      console.log('❌ ERRO ao fazer login:');
      console.log('   Mensagem:', error.message);
      console.log('   Status:', error.status);

      if (error.message.includes('Invalid login credentials')) {
        console.log('\n💡 DIAGNÓSTICO:');
        console.log('   → Email ou senha incorretos');
        console.log('   → Verifique se você realmente criou uma conta com este email');
        console.log('   → Certifique-se de que a senha está correta');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('\n💡 DIAGNÓSTICO:');
        console.log('   → Email não confirmado');
        console.log('   → Por padrão, o Supabase está configurado para não exigir confirmação');
        console.log('   → Se estiver vendo este erro, verifique as configurações de autenticação');
      }
    } else if (data.session) {
      console.log('✅ LOGIN REALIZADO COM SUCESSO!\n');
      console.log('📧 Email:', data.user.email);
      console.log('🆔 User ID:', data.user.id);
      console.log('📅 Criado em:', new Date(data.user.created_at).toLocaleString('pt-BR'));
      console.log('\n🎉 Tudo está funcionando corretamente!');
    }
  } catch (err) {
    console.log('❌ ERRO INESPERADO:', err.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  rl.close();
}

testLogin();
