# Versionamento - Memoria de usuario e instrumento no Drive v1.0

Data: 2026-07-10

## Objetivo

Registrar memoria configuravel de usuario e painel de instrumento/MVP no Cartorio Digital Charlie Echo, sem depender de uma resposta gerada pela OpenAI.

## Alteracoes na API

- Nova operacao governada: `memoria_usuario_instrumento`.
- Novo artifact: `user-memory-instrument-config`.
- Novo tipo de documento enviado ao Drive Saver: `MEMORIA_USUARIO_INSTRUMENTO_CHARLIE_ECHO`.
- Classificacao padrao: `INTERNO`.
- Link publico: nao criado.
- A operacao roda antes da conversa normal e nao exige `OPENAI_API_KEY`.
- Conteudo recebido passa por limpeza simples contra scripts e redacao basica de senha, token, chave, secret e segredo quando enviados em formato `campo: valor`.

## Governanca

Este registro nao e prova de fato real, credencial, segredo, autorizacao juridica ou permissao para expor dados. Ele serve para calibrar continuidade, preferencias e funcionamento do instrumento dentro da orquestra da Charlie Echo.

## Teste

Adicionado teste cobrindo:

- salvamento no Drive Saver sem chamada a OpenAI;
- classificacao `INTERNO`;
- ausencia de link publico;
- redacao de senha em conteudo de memoria;
- retorno de `viewUrl` governado.

Resultado local em 2026-07-10: `npm test` passou com 46 testes.
