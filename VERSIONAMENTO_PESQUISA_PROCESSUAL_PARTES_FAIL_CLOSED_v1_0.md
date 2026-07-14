# Versionamento - Pesquisa processual por partes fail-closed v1.0

Data: 2026-07-13

## Regra

- Consulta processual por nome, CPF ou DAJ e uma operacao estruturada.
- A API generativa da Charlie Echo nao cria resultado, minuta ou vinculo para essa operacao.
- Nome e CPF devem seguir ao endpoint autenticado do portal Jus 9.
- Enquanto o conector externo aguarda orientacao oficial, essa espera deve ser declarada sem simulacao.

## Implementacao

- `functions/api/ia.js` valida `route.operation` e `route.searchType` em pares permitidos.
- A mesma intencao e reconhecida em mensagem direta para fechar caminhos legados.
- O retorno declara que o modelo generativo nao foi chamado e que nenhum resultado foi inventado.

## Testes

- Rota por nome nao chama OpenAI nem produz peca juridica.
- Pedido por CPF inferido da mensagem falha fechado sem OpenAI.
- Suite completa preserva producao documental, DataJud por numero, pesquisa juridica ativa, Drive Saver e WhatsApp.

