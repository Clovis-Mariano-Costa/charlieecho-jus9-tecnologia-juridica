# Regressão ao vivo com nova tentativa limitada - v1.0

Data: 2026-06-01

## Objetivo

Reduzir falsos negativos ocasionais na homologação ao vivo da Charlie Echo sem esconder regressões reais.

## Alteração

Cada caso ao vivo pode realizar no máximo uma nova tentativa quando a primeira resposta não cumprir os critérios esperados. Se a segunda resposta também falhar, a suíte continua encerrando com erro.

## Limite

A nova tentativa não altera respostas, prompts ou regras da Charlie Echo. Ela existe apenas na automação de homologação.
