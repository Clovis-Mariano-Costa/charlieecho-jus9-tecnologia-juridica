# Versionamento - Cache de Downloads Charlie Echo v3.8

Data: 2026-06-05
Classificacao: PUBLICO CONTROLADO / UX / CACHE

## Problema observado

Mesmo apos a publicacao dos downloads enxutos, a pagina `ia-estudantes` podia continuar exibindo o menu antigo no navegador do usuario.

## Causa provavel

O arquivo `charlie-ia-pages.js?v=3.7` podia permanecer em cache no navegador ou na borda CDN por algumas horas.

## Correcao

As quatro entradas principais de chat passaram a carregar:

`charlie-ia-pages.js?v=3.8`

Arquivos atualizados:

- `ia-estudantes.html`
- `ia-estudantes/index.html`
- `ia-profissional.html`
- `ia-profissional/index.html`

## Validacao esperada

Ao abrir o menu de Download, devem aparecer somente:

- PDF
- DOCX
- PPTX
- ZIP

## Observacao

Se o navegador ainda exibir a versao antiga, fechar e abrir a aba ou usar recarregamento forte deve resolver. A versao `v=3.8` evita que o usuario dependa do cache antigo `v=3.7`.
