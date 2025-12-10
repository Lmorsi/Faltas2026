# Configuração de Recuperação de Senha

A funcionalidade de recuperação de senha foi implementada usando o sistema de autenticação do Supabase. Para que o sistema funcione completamente, você precisa configurar o envio de emails no seu projeto Supabase.

## Como Funciona

1. **Usuário clica em "Esqueceu a senha?"** - Um modal é exibido solicitando o email
2. **Email de recuperação é enviado** - Supabase envia um email com link de redefinição
3. **Usuário clica no link** - É redirecionado para a página de redefinição de senha
4. **Nova senha é definida** - O usuário define uma nova senha e é automaticamente logado

## Configuração no Supabase

### 1. Acesse as Configurações de Email

No painel do Supabase:
1. Vá para **Authentication** > **Email Templates**
2. Localize o template "Reset Password"

### 2. Configure o URL de Redirecionamento

O sistema está configurado para redirecionar para: `${window.location.origin}/reset-password`

Certifique-se de que este URL está na lista de URLs permitidos:
1. Vá para **Authentication** > **URL Configuration**
2. Em **Redirect URLs**, adicione:
   - `http://localhost:5173/reset-password` (para desenvolvimento)
   - Seu domínio de produção + `/reset-password`

### 3. Configuração de Email (Opcional)

Por padrão, o Supabase usa seu próprio serviço de email para desenvolvimento. Para produção, você pode configurar seu próprio provedor SMTP:

1. Vá para **Settings** > **Authentication** > **SMTP Settings**
2. Configure seu provedor de email (ex: SendGrid, AWS SES, etc.)

## Testando a Funcionalidade

### Em Desenvolvimento

1. Clique em "Esqueceu a senha?" na tela de login
2. Digite um email cadastrado
3. Verifique os logs do Supabase ou sua caixa de entrada
4. Clique no link de recuperação
5. Defina uma nova senha

### Importante

- O link de recuperação expira após 1 hora por padrão
- O link só pode ser usado uma vez
- Se o email não estiver cadastrado, nenhum email será enviado (por segurança)

## Personalização

Você pode personalizar os templates de email no painel do Supabase:
- **Authentication** > **Email Templates**
- Edite o template "Reset Password" com sua marca e mensagens

## Solução de Problemas

### O email não está sendo enviado
- Verifique se o email está cadastrado no sistema
- Confirme que as URLs de redirecionamento estão configuradas corretamente
- Verifique os logs no painel do Supabase

### O link de redirecionamento não funciona
- Certifique-se de que o domínio está nas URLs permitidas
- Verifique se a URL está correta no código
- Teste em uma janela anônima para evitar problemas de cache

### Erro "Link inválido ou expirado"
- O link pode ter expirado (padrão: 1 hora)
- O link pode já ter sido usado
- Solicite um novo link de recuperação
