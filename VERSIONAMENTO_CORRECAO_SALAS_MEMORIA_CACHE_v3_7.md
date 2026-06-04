# Versionamento - Correcao salas, memoria e cache v3.7

Data: 2026-06-04

## Problema observado

O botao `Nova sala` aparecia na interface, mas podia nao executar no navegador publicado.

Tambem foi observado que a Charlie Echo ainda parecia nao lembrar da pergunta anterior.

## Causas tratadas

- O navegador podia usar JavaScript antigo em cache.
- A criacao de sala dependia de `window.prompt()`, que pode ser bloqueado ou parecer sem efeito.
- A memoria curta estava embutida na mensagem, mas nao era enviada como campo estruturado ao endpoint.
- O fallback local ainda podia responder como se nao houvesse contexto.

## Correcoes

- Adicionado `?v=3.7` ao script `charlie-ia-pages.js` nas quatro entradas de chat.
- `Nova sala` agora cria uma sala imediatamente, com nome automatico.
- A memoria curta da sala tambem e enviada no campo `room` para `/api/ia`.
- O endpoint `/api/ia` passa a montar contexto de sala antes da pergunta atual.
- Adicionado `continuationFallback` para respostas locais quando a API nao responder.
- Auditoria atualizada para impedir regressao de cache e dependencia de prompt.

## Validacao

```bash
node --check assets/js/charlie-ia-pages.js
node --check functions/api/ia.js
node --check scripts/audit-charlie-chat-capabilities.mjs
node scripts/audit-charlie-chat-capabilities.mjs
```
