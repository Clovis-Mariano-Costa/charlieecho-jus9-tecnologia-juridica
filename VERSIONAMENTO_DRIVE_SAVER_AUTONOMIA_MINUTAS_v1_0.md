# Versionamento - Drive Saver autonomia para minutas v1.0

Data: 2026-07-03
Classificacao: INTERNO / OPERACIONAL / SEM SEGREDOS

## Objetivo

Ensinar Charlie Echo a agir com autonomia governada quando o usuario pede minuta com link ou download:

1. criar a minuta demonstrativa no chat;
2. classificar o conteudo por criterio proprio;
3. salvar no Drive Saver quando o backend estiver configurado;
4. gerar link publico somente quando a classificacao final permitir;
5. responder em linguagem humana, sem expor regra interna como fala principal.

## Criterio implementado

- `PUBLICO`: minuta demonstrativa, com placeholders, sem sinais de dados reais, processo, documento pessoal, segredo, cofre, token, senha ou identificador sensivel. Pode pedir `criarLinkDownload=true` ao Drive Saver.
- `JURIDICO_SIGILOSO`: pedido juridico com dado real, risco sensivel, processo, cliente, crianca/adolescente identificavel, documento pessoal ou duvida razoavel. Salva em rota de revisao/guarda, sem link publico.

## Comportamento esperado

Quando o Drive Saver estiver configurado no ambiente seguro, Charlie Echo tenta salvar automaticamente o documento e mostra `downloadUrl` real se o backend retornar.

Quando nao estiver configurado, Charlie Echo entrega a minuta no chat e informa que o download local da pagina continua disponivel.

## Arquivos alterados

- `functions/api/ia.js`
- `tests/ia-intent.test.mjs`

## Validacao

- `node --check functions/api/ia.js`
- `npm test`

## Limite preservado

Nenhuma chave, URL ativa do Web App, token, `.env`, ID privado de pasta ou segredo foi publicado neste versionamento.
