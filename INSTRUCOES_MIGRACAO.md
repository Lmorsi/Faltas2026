# Instruções para Aplicar as Migrações no Supabase

As tabelas do banco de dados já estão definidas no projeto. Para criá-las no Supabase, siga estas instruções:

## Opção 1: Via Dashboard do Supabase (Recomendado)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto: **yrfgmnbhsathkoshzhsy**
3. No menu lateral, clique em **SQL Editor**
4. Copie e cole o conteúdo do arquivo `apply_migrations.sql` (na raiz do projeto)
5. Clique em **Run** para executar a migração
6. Verifique se as tabelas foram criadas acessando **Table Editor** no menu lateral

## Opção 2: Via CLI do Supabase

Se preferir usar a linha de comando:

```bash
npx supabase db push --db-url "postgresql://postgres:[SUA-SENHA]@db.yrfgmnbhsathkoshzhsy.supabase.co:5432/postgres"
```

**Nota:** Você precisará da senha do banco de dados que pode ser encontrada em: Dashboard > Settings > Database > Connection string

## Tabelas que serão criadas:

### 1. **students** (Alunos)
- Armazena informações dos alunos
- Campos: nome completo, ano, turma, total de faltas, status
- Cada usuário só pode ver e gerenciar seus próprios alunos

### 2. **absences** (Faltas)
- Registra as faltas dos alunos por disciplina
- Campos: data da falta, faltas por matéria (Matemática, Português, etc.)
- Vinculada à tabela de alunos

### 3. **actions_taken** (Ações Tomadas)
- Registra as ações pedagógicas tomadas para cada aluno
- Campos: descrição da ação, data de registro
- Vinculada à tabela de alunos

## Segurança (RLS - Row Level Security)

Todas as tabelas possuem RLS (Row Level Security) habilitada, o que significa que:
- ✅ Usuários autenticados só podem acessar seus próprios dados
- ✅ Cada registro é vinculado ao usuário que o criou
- ✅ Não é possível ver dados de outros usuários
- ✅ Políticas separadas para leitura, inserção, atualização e exclusão

## Verificação

Após executar a migração, você pode verificar se tudo foi criado corretamente:

1. No Dashboard do Supabase, vá em **Table Editor**
2. Você deverá ver 3 tabelas: `students`, `absences`, e `actions_taken`
3. Cada tabela terá um ícone de cadeado 🔒 indicando que o RLS está ativado

## Problemas Comuns

**Erro: "relation already exists"**
- Isso significa que as tabelas já foram criadas. Você pode ignorar este erro.

**Erro: "permission denied"**
- Verifique se você está usando as credenciais corretas
- Certifique-se de que está logado no projeto correto

## Próximos Passos

Após aplicar as migrações:
1. Faça login no sistema usando a tela de registro
2. Comece a adicionar alunos
3. Registre as faltas dos alunos
4. Acompanhe o status e tome ações quando necessário

---

**Observação:** Este arquivo pode ser removido após aplicar as migrações com sucesso.
