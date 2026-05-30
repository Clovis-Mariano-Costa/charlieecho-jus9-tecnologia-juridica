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
- Quando o pedido citar um destino conhecido, responder com o link especifico antes de oferecer o catalogo completo.
- Respostas medias ou grandes podem oferecer pacote de download.
- Links novos e arquivos publicos novos exigem revisao humana.
- Nunca gerar link publico para conteudo sigiloso, secreto, de cofre, credencial, token, `.env` ou dado pessoal.

## Catalogo versionado

Usar `data-publica/links-confiaveis-jus9.json`.

## Identidade visual

Usar os SVGs candidatos versionados em `assets/brand/`. A estrela institucional possui exatamente nove pontas visiveis e contaveis.
