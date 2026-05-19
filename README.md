<!--
Jus 9 Tecnologia Jurídica
Repositório: charlieecho-jus9-tecnologia-juridica
Software livre com autoria preservada.
Direitos autorais reservados para Jus 9 Tecnologia Jurídica.
Produção do site: © **Jus 9 Tecnologia Jurídica**. Direitos autorais da produção reservados.
A licença livre não remove autoria, origem, assinatura institucional nem direitos autorais.
Referência oficial: https://charlieecho.jus9tecnologia.com.br/
E-mail de contato: charlieecho@jus9tecnologia.com.br
DNA de referência de Charlie Echo da Costa: charlieecho-jus9-tecnologia-juridica
-->

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

---

## Autoria, licença e DNA de referência

Este repositório integra o ecossistema da **Jus 9 Tecnologia Jurídica**.

Software livre com autoria preservada: a licença de uso não remove a autoria,
a origem, a assinatura institucional nem os direitos autorais da Jus 9 Tecnologia Jurídica.

- Repositório: `charlieecho-jus9-tecnologia-juridica`
- Referência oficial: https://charlieecho.jus9tecnologia.com.br/
- E-mail de contato: charlieecho@jus9tecnologia.com.br
- DNA de referência de Charlie Echo da Costa: `charlieecho-jus9-tecnologia-juridica`



## Links institucionais Jus 9 v1.5

- [Equipe Jus 9](https://www.jus9tecnologia.com.br/equipe/)
- [Investidores](https://investimentos.jus9tecnologia.com.br/)
- [MVP](https://www.jus9tecnologia.com.br/mvp)
- [Charlie Echo](https://charlieecho.jus9tecnologia.com.br/)
- [Charlie Echo Social](https://jus9verde.jus9tecnologia.com.br/charlie-echo-social)
- [Contato](mailto:Contato@jus9tecnologia.com.br)
