# Versionamento - Salas com arquivar, excluir e memoria ampliada v3.8

Data: 2026-06-04

## Escopo

Evolucao das salas de chat da Charlie Echo para permitir gestao basica de conversas e continuidade mais longa.

## Entregas

- Adicionados botoes `Arquivar` e `Excluir` nas salas de IA Estudantes e IA Profissional.
- Sala arquivada deixa de ser escolhida como ativa automaticamente.
- Sala excluida e removida da lista local da sessao.
- Se todas as salas forem excluidas, uma nova sala inicial e criada.
- Memoria local ampliada para ate 24 mensagens recentes por sala.
- Contexto enviado para a API ampliado para ate 16 mensagens recentes.
- Resumo da sala ampliado e enriquecido com historico recente.
- Backend `/api/ia` passa a considerar o historico recente estruturado do campo `room`.
- Auditoria atualizada para verificar arquivar, excluir e memoria ampliada.

## Observacao

Nesta etapa, as salas continuam locais por navegador/sessao. Para persistencia real entre dispositivos, usuarios e dias diferentes, sera necessario backend/autenticacao.

## Validacao

```bash
node --check assets/js/charlie-ia-pages.js
node --check functions/api/ia.js
node --check scripts/audit-charlie-chat-capabilities.mjs
node scripts/audit-charlie-chat-capabilities.mjs
```
