# Configuração do Reset de Senha no Supabase

## Problema
O Supabase estava fazendo login automático com o token de recuperação, em vez de mostrar a página de reset de senha.

## Solução Implementada

Ajustamos o código para detectar quando o usuário clica no link de recuperação e priorizar a exibição da página de reset.

### Configuração no Dashboard do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **URL Configuration**
4. Em **Redirect URLs**, adicione a URL do seu site:
   - Para desenvolvimento local: `http://localhost:5173`
   - Para produção: `https://faltas2026.vercel.app`

5. Clique em **Save**

### 2. Configurar o Site URL

Ainda em **URL Configuration**:
1. Configure o **Site URL**:
   - Para desenvolvimento: `http://localhost:5173`
   - Para produção: `https://seudominio.com`

### 3. Configurar Template de Email (Opcional)

Se quiser customizar o email:
1. Vá em **Authentication** → **Email Templates**
2. Selecione **Reset Password**
3. Certifique-se de que o link contém: `{{ .ConfirmationURL }}`

### 4. Atualizar o App.tsx para Lidar com o Redirecionamento

O sistema já está preparado para detectar automaticamente quando o usuário clica no link de recuperação. O Supabase adiciona um hash `#access_token=...` na URL, e o `App.tsx` detecta isso e mostra a página de reset.

## Testando

1. Na página de login, clique em "Esqueceu sua senha?"
2. Digite seu email
3. Verifique sua caixa de entrada
4. Clique no link recebido
5. Você será redirecionado para a página de reset de senha
6. Digite sua nova senha
7. Após sucesso, você será redirecionado para o dashboard

## Observações

- Os links de recuperação expiram após 1 hora por padrão
- Se o link expirou, solicite um novo link de recuperação
- Certifique-se de que a confirmação de email está desabilitada no Supabase (como já configurado)
