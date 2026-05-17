# Decisão técnica — Cloudflare Workers como base principal da Jus 9

**Decisão registrada:** manter `https://www.jus9tecnologia.com.br/` funcionando como **Cloudflare Worker**, sem migração imediata para Cloudflare Pages.

## Razão

A Jus 9 deixou de ser apenas site estático. O ecossistema previsto envolve IA, API, autenticação, cofre documental, logs, portal do cliente, backend, governança da Charlie Echo, módulos jurídicos e integrações futuras.

Por isso, o Worker deve ser tratado como base técnica principal para aplicações com lógica, rotas, secrets, APIs e serviços.

## Uso recomendado

- **Workers:** domínio principal, APIs, IA, backend, autenticação, cofre, logs, portal do cliente, funções de segurança e orquestração.
- **Pages:** páginas estáticas simples, cartas públicas, landing pages, documentação pública e projetos que não dependam de backend próprio.

## Regra de segurança

Nunca publicar no GitHub:

- chaves de API;
- tokens;
- secrets;
- senhas;
- `.env` real;
- dados protegidos;
- segredo de justiça;
- documentos sigilosos sem higienização/autorização.

## Repositório futuro recomendado

Criar futuramente o repertório `infra-jus9-cloudflare` para registrar DNS, Workers, Pages, rotas, deploys, secrets, ambientes, domínios e decisões técnicas.

## Frase de governança

A Jus 9 poderá usar Pages para páginas estáticas, mas Workers permanece como núcleo técnico principal quando houver IA, backend, dados jurídicos, segurança, autenticação, logs ou governança sensível.
