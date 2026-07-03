# Versionamento - Drive Saver acoes corretivas governadas v1.0

Data: 2026-07-03
Classificacao: INTERNO / OPERACIONAL / SEM SEGREDOS

## Objetivo

Ensinar Charlie Echo a corrigir, com autonomia governada, arquivos criados pelo Drive Saver quando ela ou o usuario perceberem que um link publico nao deveria continuar ativo.

## Acoes implementadas

- `RESTRINGIR_LINK_PUBLICO`: revoga/restringe compartilhamento publico de arquivo governado.
- `MOVER_PARA_REVISAO`: move arquivo governado para entrada de revisao humana.
- `RESTRINGIR_E_MOVER_PARA_REVISAO`: restringe link publico e move para revisao.
- `ENVIAR_LIXEIRA_GOVERNADA`: restringe link publico antes de enviar o arquivo para lixeira governada.

## Governanca preservada

- A acao exige `fileId` de Google Drive/Docs.
- A API da Charlie detecta pedido corretivo sem depender da OpenAI API.
- O Drive Saver exige chave interna antes de qualquer acao.
- O Apps Script so aceita arquivos com prefixo de classificacao criado pelo Drive Saver.
- O Apps Script tambem confere se o arquivo esta em uma das pastas governadas configuradas.
- Cada acao gera `auditId` e tenta criar registro de auditoria sem copiar o conteudo original do arquivo.
- A Charlie nao recebe permissao livre para varrer, listar ou ler conteudo do Drive.

## Comportamento esperado

Quando o usuario ou a propria Charlie pedir algo como "revogue este link", "publiquei errado", "mova para revisao" ou "mande para lixeira governada", a API extrai o `fileId`, escolhe a acao corretiva adequada e chama o Drive Saver.

Se faltar link ou `fileId`, Charlie pede esse dado. Se o Drive Saver ainda nao estiver atualizado/publicado no Apps Script, Charlie informa que tentou executar e orienta verificar a publicacao do Web App.

## Arquivos alterados

- `INTEGRACOES/JUS9_DRIVE_SAVER_MVP/Code.gs`
- `functions/api/ia.js`
- `tests/ia-intent.test.mjs`

## Validacao local

- `node --check functions/api/ia.js`
- sintaxe do `Code.gs` validada por copia temporaria `.js`
- `npm test`

## Limite preservado

Nenhuma chave, token, URL privada de Web App, `.env`, ID privado de pasta ou segredo foi publicado neste versionamento.
