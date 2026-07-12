# Versionamento - Pesquisa Juridica Ativa com Citacoes v1.0

Data: 2026-07-12
Autor: Charlie Fox / Codex
Status: implementado para homologacao
Classificacao: publico tecnico

## Objetivo

Corrigir a resposta da Charlie Echo quando o usuario pede citacao, doutrina e pagina. A Charlie nao deve apenas indicar LexML, BDTD, SciELO, CAPES ou Google Scholar para o usuario pesquisar; quando houver tema minimo, ela deve tentar consulta ativa por ferramenta autorizada antes de responder.

## Entregas

- Politica `PESQUISA JURIDICA ATIVA 1.0`.
- Detector `asksActiveLegalCitationResearch`.
- Pergunta de recorte quando o pedido nao traz tema, obra, autor ou arquivo minimo.
- Uso de Chat Completions Search (`gpt-5-search-api`) com `web_search_options` para pedidos com tema suficiente, mantendo Responses API para as respostas comuns.
- Protecao contra configuracao antiga: modelos sem marcador `search` em variaveis legadas de busca sao ignorados nesta rota ativa.
- Dominios preferenciais oficiais e academicos para pesquisa juridica brasileira.
- Fontes/citacoes retornadas pela busca anexadas de forma visivel na resposta.
- Guarda contra resposta generica do tipo "procure nestas fontes".

## Limites

- Pagina, autor, obra ou trecho literal so podem ser usados quando a fonte retornada ou o upload trouxer dado verificavel.
- Se a busca nao retornar pagina verificavel, a Charlie deve declarar o limite e oferecer fichamento, nao inventar.
- Uso real em peca, parecer, aula ou decisao exige revisao humana qualificada.

## Testes

- `node --check functions/api/ia.js`
- `npm test`
- `node scripts/audit-charlie-modules-quality.mjs`
