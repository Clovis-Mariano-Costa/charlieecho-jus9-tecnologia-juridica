# Segurança — Charlie Echo

## Regra de ouro

A chave `OPENAI_API_KEY` nunca deve ser publicada.

Ela deve existir apenas como Secret no Cloudflare Pages.

## Nunca publicar

```txt
OPENAI_API_KEY
.env
.env.*
.dev.vars
.dev.vars.*
tokens
senhas
chaves privadas
COFRE_PRIVADO_NAO_PUBLICAR/
dados de segredo de justiça
documentos jurídicos sensíveis
```

## Uso da versão pública

A versão pública é educativa, experimental e organizacional. Ela não deve receber:

- segredo de justiça;
- dados pessoais sensíveis;
- documentos sigilosos;
- peças processuais sigilosas;
- estratégias profissionais confidenciais;
- informações que exijam sigilo profissional.

## Limites

Charlie Echo não substitui advogado, juiz, promotor, defensor público, professor, profissional técnico, profissional de saúde ou autoridade competente.

## Se uma chave for exposta

1. Revogar a chave imediatamente na OpenAI.
2. Criar nova chave.
3. Remover qualquer vestígio do repositório.
4. Conferir histórico do Git.
5. Atualizar o Secret no Cloudflare.
