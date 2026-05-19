# Soluções para Problemas de Autenticação

## Problemas Resolvidos

### 1. Sessão não persiste após atualizar página
**Problema:** Ao fazer login e atualizar a página, o usuário era deslogado.

**Solução:** Configurado o Supabase para persistir sessões no localStorage:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
```

### 2. Rate Limit Excedido
**Problema:** Erro "email rate limit exceeded" ao tentar criar várias contas em sequência.

**Causa:** O Supabase limita o número de tentativas de criação de conta para prevenir spam e abuse.

**Soluções:**
1. **Aguarde alguns minutos** antes de tentar criar outra conta
2. **Use uma conta existente** se você já criou uma anteriormente
3. **Mensagens de erro melhoradas** agora informam claramente quando o limite é atingido

### 3. Mensagens de erro genéricas
**Problema:** Erros não eram claros para o usuário.

**Solução:** Implementado tratamento específico de erros:
- Email ou senha inválidos
- Rate limit excedido
- Email já cadastrado
- Outros erros com mensagens descritivas

## Como Testar se Seu Login Funciona

Execute o script de teste:
```bash
node test-login.js
```

Digite seu email e senha quando solicitado. O script irá:
- Tentar fazer login com suas credenciais
- Mostrar mensagens de erro detalhadas se algo estiver errado
- Confirmar sucesso se o login funcionar

## Recomendações

1. **Para criar nova conta:**
   - Use um email válido que você ainda não usou
   - Aguarde pelo menos 5-10 minutos se receber erro de rate limit
   - A senha deve ter pelo menos 6 caracteres

2. **Para fazer login:**
   - Certifique-se de que você realmente criou uma conta antes
   - Verifique se está usando o email e senha corretos
   - O sistema agora mantém você logado mesmo após atualizar a página

3. **Se esqueceu a senha:**
   - Clique em "Esqueceu a senha?" na tela de login
   - Siga as instruções para resetar

## Configurações do Supabase

A confirmação de email está **DESABILITADA** por padrão. Isso significa que você pode fazer login imediatamente após criar sua conta, sem precisar confirmar o email.

Se você quiser habilitar a confirmação de email:
1. Acesse: https://supabase.com/dashboard/project/cxtsvgllisddmvwonsus/auth/users
2. Vá em Settings → Authentication
3. Habilite "Enable email confirmations"

## Próximos Passos

Agora que a autenticação está funcionando corretamente:
1. Faça login no sistema
2. Tente adicionar um estudante
3. O sistema deve funcionar normalmente
