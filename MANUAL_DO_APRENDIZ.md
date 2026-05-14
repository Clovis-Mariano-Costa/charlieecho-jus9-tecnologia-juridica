# Manual do Aprendiz — Como publicar a Casa Pública da Charlie Echo

## 1. O que você está publicando

Você está publicando a Casa Pública da Charlie Echo. Ela é educativa, inicial e segura.

## 2. O que você não está publicando

Você não está publicando o Cofre Privado. Você não está publicando chaves, `.env`, `.dev.vars`, senhas ou tokens.

## 3. Onde fica a chave da OpenAI

A chave fica no Cloudflare Pages, em **Settings → Variables and Secrets**, com o nome:

```txt
OPENAI_API_KEY
```

## 4. Como configurar o Cloudflare Pages

```txt
Framework preset: None
Build command: exit 0
Build output directory: .
Root directory: /
```

## 5. Como testar

1. Abra a página principal.
2. Abra `ia-estudantes.html`.
3. Pergunte algo simples.
4. Se responder, a ponte está funcionando.
5. Se não responder, confira o Secret `OPENAI_API_KEY`.

## 6. O que não fazer

Não subir a pasta `02_COFRE_PRIVADO_NAO_PUBLICAR` para o GitHub.
Não colar a chave da OpenAI no código.
Não ativar o MVP jurídico sem login, auditoria e revisão humana.
