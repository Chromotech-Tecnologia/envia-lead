

# Ajuste de Exibição por URL + Script Único por Conta

## Problemas Identificados

1. **URL matching só compara hostname** (domínio): o código atual faz `allowed.hostname === current.hostname`, ignorando o path. Então se a URL configurada é `https://app.pertodemimbrasil.com.br/empresa/studio-bella-arte`, ele só compara `app.pertodemimbrasil.com.br` e permite em QUALQUER página do site.

2. **Script é por fluxo** (`?flow=UUID`): cada fluxo gera um script diferente. O usuário quer um script único por conta/empresa que carregue automaticamente o fluxo correto baseado na URL da página.

## Mudanças Planejadas

### 1. Nova Edge Function: `envialead-loader` (script por empresa)
- Aceita parâmetro `?company=COMPANY_ID` em vez de `?flow=FLOW_ID`
- Busca **todos os fluxos ativos** dessa empresa
- Para cada fluxo, busca as URLs configuradas (`flow_urls`)
- Compara a URL completa da página atual (hostname + pathname) com as URLs configuradas
- Carrega e exibe apenas o fluxo que corresponde à página atual
- Se nenhum fluxo tem URL configurada que bata, não mostra nada

### 2. Corrigir URL matching na Edge Function `envialead-widget` (manter compatível)
- Mudar de `allowed.hostname === current.hostname` para comparação que inclua o **pathname**
- Normalizar URLs (remover trailing slash, comparar case-insensitive)
- Lógica: se a URL configurada tem path, comparar hostname + path. Se só tem domínio, aceitar qualquer página daquele domínio.

### 3. Atualizar `IntegrationCode` (componente do editor de fluxo)
- Mostrar **dois códigos**: o código por fluxo (existente) e o novo código por empresa (recomendado)
- O código por empresa: `<script src='.../envialead-loader?company=COMPANY_ID'></script>`
- Destacar que o código por empresa é o ideal: "Cole uma vez, funciona para todos os fluxos"

### 4. Corrigir `get-flow-data` também
- Mesma correção de URL matching (hostname + pathname)

## Detalhes Técnicos

**Lógica de matching de URL melhorada:**
```
- URL configurada: "https://site.com/empresa/x"
  → match: hostname === "site.com" AND pathname starts with "/empresa/x"
- URL configurada: "https://site.com" (sem path)
  → match: hostname === "site.com" (qualquer página)
- URL configurada: "*.site.com"
  → match: wildcard no subdomínio
```

**Nova edge function `envialead-loader`:**
- Query: busca flows WHERE company_id = ? AND is_active = true
- Para cada flow, busca flow_urls
- Compara current page URL com as URLs de cada flow
- Se match, injeta o script do widget com aquele flow_id
- Se múltiplos flows batem, carrega o mais específico (mais path segments)

**Arquivos editados/criados:**
- `supabase/functions/envialead-loader/index.ts` (novo)
- `supabase/functions/envialead-widget/index.ts` (fix URL matching)
- `supabase/functions/get-flow-data/index.ts` (fix URL matching)
- `src/components/flow-editor/IntegrationCode.tsx` (mostrar código por empresa)
- `src/components/IntegrationCode.tsx` (mesmo ajuste)

