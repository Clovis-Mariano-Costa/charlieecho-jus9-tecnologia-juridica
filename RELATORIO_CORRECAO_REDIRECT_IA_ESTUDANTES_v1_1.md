# RELATÓRIO — Correção de loop em IA Estudantes

Repositório: `charlieecho-jus9-tecnologia-juridica`

## Problema
A rota pública `https://charlieecho.jus9tecnologia.com.br/ia-estudantes` apresentou erro `ERR_TOO_MANY_REDIRECTS`.

## Correção aplicada

- Removido o padrão de reescrita direta de `/ia-estudantes` para `/ia-estudantes.html` no `_redirects`.
- Criada pasta real `ia-estudantes/index.html`, permitindo que a rota limpa funcione diretamente no Cloudflare Pages.
- Criadas pastas equivalentes para rotas antigas preservadas:
  - `/familia/`
  - `/album/`
  - `/governanca/`
  - `/ia-profissional/`
  - `/politica-de-privacidade/`
  - `/termos-de-uso/`
- Mantidos os arquivos `.html` originais para compatibilidade.
- Atualizados links internos para rotas limpas com barra final.
- Corrigidos títulos HTML que continham tag `<a>` dentro de `<title>`.

## Se o erro persistir
Verificar no Cloudflare se existe Redirect Rule, Page Rule, Transform Rule ou configuração externa redirecionando `/ia-estudantes` para si mesma.
