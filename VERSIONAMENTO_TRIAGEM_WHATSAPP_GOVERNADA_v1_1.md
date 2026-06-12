# Versionamento - Triagem WhatsApp Governada v1.1

Classificação: PÚBLICO / ORIENTAÇÃO OPERACIONAL SANITIZADA
Repositório: charlieecho-jus9-tecnologia-juridica
Instituição: Jus 9 Tecnologia Jurídica

## Objetivo

Evoluir o webhook WhatsApp de resposta fixa para triagem governada inicial, sem IA decisória, sem banco de dados e sem armazenamento de conteúdo sensível.

## Entregas

- Adicionada triagem por intenção inicial em `server.js`.
- Mantido envio institucional pelo WhatsApp Cloud API.
- Mantida resposta rápida `200` ao webhook da Meta.
- Mantido fallback de número móvel brasileiro para o modo de teste da Meta.
- Adicionados testes para intenções de triagem e mensagens de governança.

## Intenções de triagem

- `menu`: saudação, teste ou pedido inicial.
- `urgent`: urgência, prazo, audiência ou ato sensível.
- `document`: documento, processo, contrato, anexo ou PDF.
- `human`: pedido de atendimento humano.
- `general`: descrição geral ou dúvida inicial.

## Segurança

- Não há gravação de banco de dados nesta fase.
- Logs continuam mascarando identificadores de WhatsApp.
- A resposta orienta a não enviar senhas, tokens, códigos ou documentos sensíveis.
- A Charlie Echo não substitui análise humana qualificada nem toma decisão jurídica final.

## Próximo passo sugerido

Criar memória operacional governada, preferencialmente com banco simples e política de retenção clara, antes de conectar IA generativa ao atendimento.
