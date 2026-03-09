

# Painel Super Admin para alexandre@chromotech.com.br

## Resumo

Criar um painel administrativo completo que permita ao usuário `alexandre@chromotech.com.br` ser o "dono do sistema" com visão total: todas as empresas, todos os usuários, todos os fluxos, com ações de ativar/desativar, gerenciar período de teste, e "ver como usuário".

## Mudanças no Banco de Dados

### 1. Atualizar perfil do alexandre para global admin
- UPDATE do profile de `alexandre@chromotech.com.br` para `company_id = '00000000-0000-0000-0000-000000000001'` e `role = 'admin'`
- Garantir que a empresa `00000000-0000-0000-0000-000000000001` exista

### 2. Adicionar coluna `trial_end_date` na tabela `companies`
- `trial_end_date TIMESTAMPTZ NULL` para controlar período de teste
- Permitir que o super admin defina datas de expiração de trial

## Novos Arquivos

### `src/pages/SuperAdmin.tsx`
Página principal do painel admin com abas:
- **Empresas**: Lista todas as empresas com status (ativo/trial/inativo), data de trial, ações (ativar, desativar, liberar trial, tornar permanente)
- **Usuários**: Todos os usuários do sistema com empresa vinculada, status, ações (ativar/desativar, "ver como")
- **Fluxos**: Todos os fluxos de todas as empresas, com filtro por empresa
- **Visão Geral**: Métricas globais (total empresas, usuários, fluxos, leads)

### `src/components/admin/AdminCompanies.tsx`
Tabela de empresas com:
- Nome, email, status (badge colorido), trial_end_date
- Botões: Ativar/Desativar, Definir trial (date picker), Liberar permanente

### `src/components/admin/AdminUsers.tsx`
Tabela de usuários com:
- Nome, email, empresa, role, is_active
- Botões: Ativar/Desativar, "Ver como" (impersonar navegando com filtro de company_id no localStorage temporário)

### `src/components/admin/AdminFlows.tsx`
Tabela de fluxos com:
- Nome, empresa, status, criado_em, qtd perguntas, qtd leads
- Filtro por empresa

### `src/components/admin/AdminOverview.tsx`
Cards de métricas globais: total empresas, total usuários ativos, total fluxos, total leads

## Arquivos Editados

### `src/App.tsx`
- Adicionar rota `/admin` apontando para `SuperAdmin`

### `src/components/Sidebar.tsx`
- Adicionar item "Admin" (ícone Shield) visível apenas para global admins
- Verificar `is_global_admin()` via RPC no carregamento do sidebar

## Funcionalidade "Ver como Usuário"
- Ao clicar "Ver como", armazena `viewing_as_company_id` no sessionStorage
- Um banner fixo no topo mostra "Visualizando como [Empresa]" com botão "Voltar"
- As queries do sistema usam esse company_id temporário em vez do real
- Implementado via contexto React (`AdminViewContext`)

## Detalhes Técnicos

- Todas as queries do SuperAdmin usam `is_global_admin()` que já existe e permite acesso a tudo via RLS
- A função "Ver como" é apenas visual/de contexto no frontend - o RLS do global admin já permite ver tudo
- O `trial_end_date` será usado pelo frontend para exibir status e pelo futuro backend para bloquear acesso
- Nenhuma nova RLS policy necessária - o `is_global_admin()` já cobre os acessos

