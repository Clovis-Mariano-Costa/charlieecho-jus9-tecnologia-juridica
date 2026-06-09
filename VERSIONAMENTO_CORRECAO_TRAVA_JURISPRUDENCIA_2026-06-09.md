# VERSIONAMENTO - Correcao da Trava em Jurisprudencia

Registrado em: 2026-06-09 20:43:16.23695

## Problema

Charlie Echo estava tratando a palavra `jurisprudencia` como gatilho automatico de pesquisa guiada. Com isso, perguntas como "explique jurisprudencia" ou "proponha jurisprudencia" podiam receber apenas protocolo de fonte, sem resposta substantiva.

## Correcao

- Doutrina e jurisprudencia deixam de ser automaticamente pedido de fonte.
- Perguntas explicativas, analiticas ou conceituais passam a receber resposta substantiva.
- Pesquisa guiada fica reservada para pedidos de fonte, link, busca, inteiro teor, ementa, tribunal, relator, numero de processo, acordao ou precedente especifico.
- Criada intencao `analise jurisprudencial responsavel`.
- Fallback local da pagina passa a explicar doutrina e jurisprudencia quando a API oscilar.

## Limites Preservados

Charlie Echo nao deve inventar processo, relator, tribunal, data, ementa, tese vinculante, autor, obra, pagina ou citacao literal.

Sem fonte conferida, a resposta deve ser apresentada como sintese orientativa, com recomendacao de conferencia em base oficial e revisao humana para uso real.

## Testes

- `node --check functions\api\ia.js`
- `node --check assets\js\charlie-ia-pages.js`
- `node tests\charlie-echo-public-regression.mjs`

Resultado: `CHARLIE_ECHO_REGRESSION_OK`, incluindo o caso `jurisprudencia-sem-trava`.
