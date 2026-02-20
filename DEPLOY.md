# Guia de Deploy - Sistema de Controle de Faltas

## ✅ Configuração Concluída

O arquivo `.env` já foi atualizado com as novas credenciais do Supabase:
- **URL**: https://cxtsvgllisddmvwonsus.supabase.co
- **Chave anon**: Configurada

## 🚀 Próximo Passo: Criar as Tabelas no Banco de Dados

### Acesso Rápido ao SQL Editor:
**Link direto**: https://supabase.com/dashboard/project/cxtsvgllisddmvwonsus/sql/new

### Instruções:

1. **Abra o SQL Editor** usando o link acima (ou navegue: Dashboard > SQL Editor)

2. **Copie TODO o conteúdo** do arquivo `apply_migrations.sql` (na raiz do projeto)

3. **Cole no editor** e clique em **"Run"** (ou Ctrl/Cmd + Enter)

4. **Aguarde** a confirmação de sucesso

5. **Verifique as tabelas**:
   - Vá em **Table Editor** no menu lateral
   - Você deverá ver 3 tabelas criadas:
     - ✅ students (alunos)
     - ✅ absences (faltas)
     - ✅ actions_taken (ações tomadas)

## 📊 Estrutura das Tabelas

### students (Alunos)
- Nome completo, ano, turma
- Total de faltas e status
- Vinculado ao usuário

### absences (Faltas)
- Data da falta
- Faltas por disciplina (Matemática, Português, História, etc.)
- Vinculado ao aluno e usuário

### actions_taken (Ações Tomadas)
- Descrição da ação pedagógica
- Data de registro
- Vinculado ao aluno e usuário

## 🔒 Segurança

Todas as tabelas possuem RLS ativado:
- Cada usuário só vê seus próprios dados
- Proteção automática contra acesso não autorizado

## 🧪 Testar o Sistema

Após criar as tabelas:

1. Inicie o servidor: `npm run dev`
2. Acesse: http://localhost:5173
3. Cadastre-se e faça login
4. Adicione alunos e registre faltas

## 📦 Deploy em Produção (Vercel)

Para fazer deploy:

1. Crie um repositório no GitHub
2. Faça push do código
3. Acesse [Vercel](https://vercel.com)
4. Importe o repositório
5. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Faça deploy

Após o deploy, configure no Supabase:
- **Authentication > URL Configuration**
- Adicione sua URL de produção + `/reset-password` nas Redirect URLs

## ❓ Problemas Comuns

**"Invalid API key"**
→ Reinicie o servidor após alterar o .env

**Tabelas não aparecem**
→ Execute TODO o SQL do arquivo `apply_migrations.sql` de uma vez

**Erro ao adicionar aluno**
→ Verifique se as tabelas foram criadas e você está logado

## 📚 Suporte

- [Documentação Supabase](https://supabase.com/docs)
- [Discord Supabase](https://discord.supabase.com)

---

**Pronto para usar!** Execute o SQL e comece a usar o sistema. 🎉
