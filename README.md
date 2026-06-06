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

Esta versão é pública, educativa e limitada. Ela apresenta a identidade pública da Charlie Echo, documentos públicos sanitizados e uma ponte técnica segura para a OpenAI API via Cloudflare Pages Functions.

## Separação essencial

- **Casa Pública:** pode ir para GitHub e Cloudflare apenas com material público ou sanitizado.
- **Cofre Privado:** não deve ir para GitHub público nem para Cloudflare público.
- **Governança Interna:** pode orientar o trabalho, mas não deve virar página pública automaticamente.
- **Ponte Técnica:** o código pode ser público, mas a chave `OPENAI_API_KEY` fica apenas como Secret no Cloudflare.

## Estrutura principal

```txt
index.html
cofre.html
familia.html
governanca.html
governanca-publica.html
juramentos.html
versoes.html
ia-estudantes.html
ia-mvp.html            # bloqueada/em construção
assets/
data-publica/
documentos-publicos/
functions/api/ia.js
SECURITY.md
RELATORIOS/
POLITICA_DE_PRIVACIDADE.md
AVISO_DE_USO_DA_IA.md
MANUAL_DO_APRENDIZ.md
```

## Arquivos que não pertencem ao repositório público

Não publicar neste repositório:

- conteúdo bruto de WhatsApp;
- documentos pessoais;
- dados reais de cliente, usuário, parceiro, família ou terceiro;
- arquivos de cofre;
- arquivos marcados como sigilosos, secretos, segredo militar/sagrado ou uso interno restrito;
- tokens, senhas, chaves, seeds, `.env` real, backups e dumps;
- documentos que dependam de decisão expressa do Fundador.

O `cofre.html` é apenas uma página simbólica e pública. O cofre real deve permanecer em ambiente privado.

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

## Regressão pública

Execute a bateria da Charlie Echo contra o domínio publicado:

```bash
node tests/charlie-echo-public-regression.mjs
```

## Primeira versão

A primeira versão ativa apenas o modo público educativo para estudantes. O MVP jurídico permanece em construção até existir login, auditoria, controle de acesso, política de dados e revisão humana.

## Identidade pública vigente

Charlie Echo da Costa deve ser apresentada como I.A generativa multimodal, conversacional e jurídico-orientada, com governança humana.

Ela não é pessoa humana, não possui personalidade jurídica própria, não substitui profissional habilitado e não atua sem revisão humana quando houver decisão sensível.

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

- [Equipe Jus 9](https://equipe.jus9tecnologia.com.br/)
- [Investimentos](https://investimentos.jus9tecnologia.com.br/)
- [Acompanhe os MVPs](https://jus9tecnologia.com.br/mvp.html#demos-jus9)
- [Charlie Echo](https://charlieecho.jus9tecnologia.com.br/)
- [Charlie Echo Social](https://jus9verde.jus9tecnologia.com.br/charlie-echo-social)
- [Contato](mailto:Contato@jus9tecnologia.com.br)
