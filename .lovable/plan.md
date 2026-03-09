
Objetivo: corrigir de forma definitiva o sumiço de “Mensagem Bot” (e outros tipos novos) após salvar + F5, garantindo persistência no banco.

1) Diagnóstico já confirmado
- O problema não está no editor de perguntas nem no RLS atual.
- O erro real está no banco: constraint `questions_type_check` bloqueia tipos novos.
- Evidência capturada nas requests:
  - `POST /rest/v1/questions` retornando `400`
  - mensagem: `violates check constraint "questions_type_check"`
  - payload incluía `type: "bot_message"`.

2) Causa raiz
- A tabela `questions` foi criada com CHECK antigo aceitando apenas:
  - `text, email, phone, number, single, multiple`
- O app hoje usa também:
  - `bot_message, select, radio` (e o widget/chat também considera formatos modernos).
- Resultado: insert de `bot_message` falha e a pergunta some ao recarregar.

3) Plano de ajuste (implementação)
- Criar migration para atualizar o CHECK de `questions.type`:
  - remover constraint atual `questions_type_check`
  - recriar com lista compatível com o app atual + legado:
    - `text, email, phone, number, textarea, select, radio, bot_message, single, multiple`
- Manter `single/multiple` por compatibilidade com dados legados.
- Não relaxar para `WITH CHECK (true)` no banco; manter validação de domínio de tipo (apenas lista permitida).

4) Blindagem adicional no frontend (para evitar regressão silenciosa)
- Em `saveFlowQuestions`, validar `question.type` antes do insert/update usando a mesma lista permitida.
- Se encontrar tipo inválido:
  - abortar save com toast claro (ex.: “Tipo de pergunta não suportado”)
  - logar o tipo inválido no console para diagnóstico rápido.
- Benefício: evita “falhou no banco sem clareza” caso alguém introduza tipo novo sem migration.

5) Verificação pós-correção (obrigatória)
- Teste E2E no mesmo fluxo:
  1. adicionar `text`, `phone`, `bot_message`, `select`, `radio`
  2. salvar
  3. dar F5
  4. confirmar que continuam no editor
  5. confirmar via query em `questions` que todos persistiram
  6. validar em `teste.envialead.com.br` que a mensagem bot aparece na ordem correta.
- Critério de sucesso:
  - nenhum POST `questions` com status 400 por constraint
  - tipos persistem e reaparecem após reload.

Detalhes técnicos
- Constraint atual identificada: `CHECK (type = ANY (ARRAY['text','email','phone','number','single','multiple']))`.
- O ajuste é estrutural de schema (migration SQL), não apenas código frontend.
- RLS de `questions` já está adequado para INSERT/UPDATE/SELECT neste cenário; o bloqueio principal é o CHECK de tipo.
