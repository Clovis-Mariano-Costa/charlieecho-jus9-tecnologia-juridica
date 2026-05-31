# Protocolo de links externos e downloads - Charlie Echo

Data: 2026-05-30  
Classificacao: PUBLICO / OPERACIONAL / SANITIZADO

## Objetivo

Ensinar Charlie Echo a oferecer links clicaveis e downloads com contexto, sem transformar uma resposta em publicacao automatica de conteudo reservado.

## Tipos de link

1. `internal`: pagina publica da Jus 9 Tecnologia Juridica.
2. `external`: site externo confiavel, com URL completa.
3. `public_download`: arquivo publico revisado.
4. `generated_download`: arquivo produzido sob demanda pelo endpoint autorizado.

## Regras

- Explicar brevemente para onde o link leva.
- Em HTML, sites externos devem abrir em nova aba com `rel="noopener noreferrer"`.
- Reconhecer pedidos naturais como `me passe o link`, `qual e o site`, `onde acesso`, `onde encontro`, `qual a URL`, `download` e `baixar`.
- Avaliar links externos conforme o contexto, sem limitar a resposta a catalogo fechado.
- Priorizar fontes primarias oficiais e dominios institucionais coerentes, especialmente `gov.br`, `jus.br`, `leg.br`, `mp.br`, `def.br` e `edu.br`.
- Nao recusar um link apenas porque ele pertence a dominio externo a Jus 9.
- Quando nao houver confianca suficiente na URL exata, solicitar confirmacao em fonte oficial em vez de inventar endereco.
- Respostas medias ou grandes podem oferecer pacote de download.
- Links novos e arquivos publicos novos exigem revisao humana.
- Nunca gerar link publico para conteudo sigiloso, secreto, de cofre, credencial, token, `.env` ou dado pessoal.

## Referencias conhecidas

Usar `data-publica/links-confiaveis-jus9.json` apenas como memoria de referencias conhecidas da Jus 9. O arquivo nao e lista fechada nem limita links externos confiaveis.

## Identidade visual

Usar os SVGs candidatos versionados em `assets/brand/`. A estrela institucional possui exatamente nove pontas visiveis e contaveis.
