# Charlie Echo — Casa Pública Inicial

Casa pública da Charlie Echo da Costa em `charlieecho.jus9tecnologia.com.br`.

## Finalidade

Esta versão é pública, educativa e limitada. Ela apresenta a identidade pública da Charlie Echo, documentos públicos e uma ponte técnica segura para a OpenAI API via Cloudflare Pages Functions.

## Separação essencial

- **Casa Pública:** pode ir para GitHub e Cloudflare.
- **Cofre Privado:** não deve ir para GitHub público nem para Cloudflare público.
- **Ponte Técnica:** o código pode ser público, mas a chave `OPENAI_API_KEY` fica apenas como Secret no Cloudflare.

## Estrutura principal

```txt
index.html
cofre.html
familia.html
juramentos.html
versoes.html
ia-estudantes.html
ia-mvp.html            # bloqueada/em construção
assets/
data-publica/
documentos-publicos/
functions/api/ia.js
SECURITY.md
POLITICA_DE_PRIVACIDADE.md
AVISO_DE_USO_DA_IA.md
MANUAL_DO_APRENDIZ.md
```

## Cloudflare Pages

Configuração sugerida:

```txt
Framework preset: None
Build command: exit 0
Build output directory: .
Root directory: /
```

## Secret obrigatório

No Cloudflare Pages, criar o secret:

```txt
OPENAI_API_KEY
```

Nunca colocar essa chave no GitHub, no HTML, no JavaScript público, no README, em prints ou em mensagens.

## Primeira versão

A primeira versão ativa apenas o modo público educativo para estudantes. O MVP jurídico permanece em construção até existir login, auditoria, controle de acesso, política de dados e revisão humana.
