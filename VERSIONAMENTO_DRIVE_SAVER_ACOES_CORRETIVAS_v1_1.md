# Versionamento - Drive Saver acoes corretivas governadas v1.1

Data: 2026-07-03
Classificacao: INTERNO / OPERACIONAL / SEM SEGREDOS

## Motivo

Reforcar a prioridade da intencao corretiva do Drive Saver para impedir regressao ao protocolo de pesquisa juridica quando o usuario pedir para revogar link publico, mover arquivo para revisao ou enviar para lixeira governada.

## Ajustes

- A checagem de acao corretiva do Drive Saver passou a ocorrer antes da pesquisa juridica guiada.
- A API agora extrai todos os `fileIds` reais de Google Docs/Drive encontrados na mensagem.
- Placeholders como `FILE_ID` sao ignorados por nao passarem na validacao minima de ID.
- Mensagens com multiplos links reais sao processadas arquivo por arquivo.
- A resposta pode trazer `driveSaverResults` quando houver mais de um arquivo.

## Validacao

- `node --check functions/api/ia.js`
- `npm test`

## Testes acrescentados

- placeholder `FILE_ID` ignorado e link real usado;
- acao corretiva vence pesquisa juridica guiada mesmo quando a frase menciona jurisprudencia;
- multiplos links reais sao processados em lote governado.

## Limite preservado

Nenhuma chave, token, URL privada de Web App, `.env`, ID privado de pasta ou segredo foi publicado neste versionamento.
