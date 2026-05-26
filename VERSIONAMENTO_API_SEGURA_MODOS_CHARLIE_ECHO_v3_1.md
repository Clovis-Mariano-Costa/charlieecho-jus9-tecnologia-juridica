# Versionamento - API segura modos Charlie Echo v3.1

Data: 2026-05-26
Repositorio: charlieecho-jus9-tecnologia-juridica

## Objetivo

Consolidar a rota segura de IA da Charlie Echo para os modos estudantes, profissional e social, preservando fallback local e sem expor segredos no frontend.

## Alteracoes

- `GET /api/ia` passa a responder diagnostico publico seguro da rota.
- `POST /api/ia` passa a aceitar `mode` com valores `estudantes`, `profissional` e `social`.
- Criado modo social com linguagem simples, acolhedora e limites de atendimento humano/emergencial.
- Criadas rotas de compatibilidade:
  - `/work/api/ia`
  - `/api/work/ia`
- Adicionada variavel opcional `JUS9_MODEL_SOCIAL` em `.env.example`.

## Governanca

- `OPENAI_API_KEY` continua apenas em Cloudflare Secret ou ambiente seguro.
- Nenhum token, chave, senha ou dado real foi colocado em HTML/JS.
- O frontend deve manter fallback local quando a API estiver indisponivel.
- A versao publica nao substitui profissional humano habilitado.
