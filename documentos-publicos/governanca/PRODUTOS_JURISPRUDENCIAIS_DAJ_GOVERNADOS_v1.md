# Produtos jurisprudenciais DAJ governados v1

Versao tecnica: `produtos-jurisprudenciais-daj-v1`
Escopo: operacionalizacao das fichas jurisprudenciais conferidas do MVP DAJ Advogados.
Dependencia: `fichas-jurisprudenciais-daj-v1`.

## Finalidade

Transformar uma ficha jurisprudencial conferida em material de trabalho juridico demonstrativo:

1. argumento de peticao;
2. checklist probatorio;
3. quadro comparativo;
4. pacote DAJ com argumento, checklist e comparacao.

Esta camada nao cria julgado, nao inventa ementa, nao atribui citacao literal e nao substitui conferencia do inteiro teor.

## Ordem de decisao

1. Identificar a pergunta atual, sem contaminar com memoria antiga da sala.
2. Localizar precedente conferido no catalogo de fichas.
3. Identificar o tipo de produto pedido: argumento, checklist, quadro ou pacote.
4. Responder com produto governado e fontes oficiais.
5. Classificar o artefato para Drive Saver:
   - PUBLICO: produto demonstrativo baseado em fonte publica conferida e sem dado real.
   - JURIDICO_SIGILOSO: quando houver cliente real, processo real, dado pessoal, documento pessoal, segredo, cofre ou risco sensivel.
6. Salvar no Google Drive / Cartorio Digital Charlie Echo somente quando o pedido ou o fluxo governado indicarem Drive, PDF, download, registro ou link.

## Regras de seguranca

- Link publico so pode aparecer quando o Drive Saver retornar `downloadUrl` real.
- Produto sigiloso pode ser salvo no Drive, mas sem link publico.
- Quando o processo citado na fonte oficial estiver em segredo de justica, Charlie nao deve inventar numero.
- O produto deve dizer que e demonstrativo, nao citacao literal e exige revisao humana.

## Exemplos de gatilho

- "Monte um argumento de peticao com o REsp 2.077.278."
- "Faca checklist probatorio do golpe do boleto."
- "Crie quadro comparativo do REsp 2.029.511 com meu caso ficticio."
- "Gere PDF com checklist do REsp 2.052.228."

## Status

Pacote inicial aplicado ao DAJ. Depois de aprovado, replicar a estrutura para outros MVPs com catalogos proprios e classificacao adequada ao instrumento.
