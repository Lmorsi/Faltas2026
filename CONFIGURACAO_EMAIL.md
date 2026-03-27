# Configuração do Supabase - Guia Completo

## Situação Atual

O projeto anterior no Supabase não está mais acessível. Você precisará criar um novo projeto e configurá-lo.

## Passo a Passo para Configurar Novo Projeto

### 1. Criar Novo Projeto no Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **"New Project"**
3. Preencha as informações:
   - **Name**: Sistema de Controle de Faltas (ou nome de sua preferência)
   - **Database Password**: Escolha uma senha forte (anote em local seguro)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
4. Clique em **"Create new project"**
5. Aguarde alguns minutos enquanto o projeto é provisionado

### 2. Obter as Credenciais

Após o projeto ser criado:

1. No dashboard do projeto, vá em **Settings** (ícone de engrenagem) > **API**
2. Você verá duas informações importantes:
   - **Project URL**: algo como `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: uma chave longa começando com `eyJ...`

### 3. Atualizar o Arquivo .env

Abra o arquivo `.env` na raiz do projeto e atualize com suas credenciais:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 4. Aplicar as Migrações (Criar as Tabelas)

Com o novo projeto configurado:

1. No dashboard do Supabase, vá em **SQL Editor** (ícone </>)
2. Clique em **"New query"**
3. Copie **TODO** o conteúdo do arquivo `apply_migrations.sql` (na raiz do projeto)
4. Cole no editor
5. Clique em **"Run"** (ou pressione Ctrl/Cmd + Enter)
6. Aguarde a confirmação de sucesso

### 5. Verificar se as Tabelas Foram Criadas

1. No menu lateral, clique em **Table Editor** (ícone de tabela)
2. Você deverá ver 3 tabelas:
   - ✅ **students** - Alunos
   - ✅ **absences** - Faltas
   - ✅ **actions_taken** - Ações tomadas
3. Cada tabela terá um ícone de cadeado 🔒 indicando que RLS está ativado

### 6. Configurar Autenticação

Para o sistema funcionar corretamente:

1. Vá em **Authentication** > **Providers**
2. Certifique-se de que **Email** está habilitado
3. Em **Authentication** > **URL Configuration**, configure:
   - **Site URL**: URL onde seu site estará hospedado
   - **Redirect URLs**: Adicione:
     - `http://localhost:5173/reset-password` (desenvolvimento)
     - Seu domínio de produção + `/reset-password`

### 7. Testar o Sistema

1. Salve todas as alterações no arquivo .env
2. Reinicie o servidor de desenvolvimento
3. Acesse o sistema no navegador
4. Tente fazer o registro de um novo usuário
5. Após o login, tente adicionar um aluno

## Estrutura das Tabelas Criadas

### 📚 students (Alunos)
- Nome completo
- Ano escolar (6º ao 9º)
- Turma (A a L)
- Total de faltas
- Status (Regular, Em Alerta, Crítico)

### 📝 absences (Faltas)
- Data da falta
- Faltas por disciplina:
  - Matemática, Língua Portuguesa
  - História, Geografia
  - Arte, LEM
  - Educação Física
  - PD1, PD2, PD3

### 🎯 actions_taken (Ações Tomadas)
- Descrição da ação pedagógica
- Data de registro
- Vinculado ao aluno

## Segurança (RLS)

Todas as tabelas possuem **Row Level Security** habilitada:
- ✅ Cada usuário só vê seus próprios dados
- ✅ Proteção contra acesso não autorizado
- ✅ Políticas separadas para leitura, inserção, atualização e exclusão

## Recuperação de Senha

O sistema possui funcionalidade de recuperação de senha:

1. **Como usar**: Clique em "Esqueceu a senha?" na tela de login
2. **Email enviado**: Supabase envia automaticamente o link de recuperação
3. **Link expira**: Após 1 hora por padrão
4. **URLs permitidas**: Configure em Authentication > URL Configuration

## Problemas Comuns

### "Invalid API key"
- Verifique se copiou corretamente a chave anon
- Certifique-se de que o arquivo .env foi salvo
- Reinicie o servidor de desenvolvimento

### "Failed to fetch"
- Verifique se a URL do projeto está correta
- Certifique-se de que o projeto Supabase está ativo
- Verifique sua conexão com a internet

### Tabelas não aparecem
- Execute o SQL completo do arquivo `apply_migrations.sql` de uma vez
- Não execute as migrações em partes
- Se houver erro, leia a mensagem e corrija

### Erro ao fazer login/registro
- Verifique se as tabelas foram criadas corretamente
- Confirme que RLS está ativado em todas as tabelas
- Verifique se a autenticação por email está habilitada

## Suporte

Se precisar de ajuda adicional:
- 📖 [Documentação do Supabase](https://supabase.com/docs)
- 💬 [Discord do Supabase](https://discord.supabase.com)
- 🎥 [Vídeos tutoriais](https://www.youtube.com/c/Supabase)

---

**Importante**: Após configurar tudo corretamente, você pode deletar este arquivo.
