# Continuidade S52 — Charlie Echo Async Jobs

Estado: IMPLEMENTAÇÃO LOCAL EM BRANCH, SEM MERGE, DEPLOY OU PUBLICAÇÃO.

Branch: `codex/s52-charlie-echo-async`

## Entrega técnica

Foi criada a interface `/api/ia/jobs` e `/api/ia/jobs/:job_id` para jobs assíncronos governados. O contrato:

- `POST /api/ia/jobs` valida `message`, `mode`, `requestId` e `metadata` sanitizada;
- retorna rapidamente `202`, `job_id`, `poll_url`, `expires_at`, estado `queued` e `process_effect: none` quando o armazenamento está configurado;
- `GET /api/ia/jobs/:job_id` expõe somente estado, identificadores técnicos, TTL e referência de resultado, nunca prompt, resposta bruta, segredo ou `payload_hash`;
- reenvio com o mesmo `requestId` e o mesmo hash retorna o mesmo job;
- o mesmo `requestId` com payload diferente entra em `reconciliation_required` e retorna `409`;
- transições aceitas: `queued`, `running`, `succeeded`, `failed`, `expired`, `reconciliation_required`;
- TTL vencido é marcado como `expired` no polling;
- o adaptador precisa implementar `createIfAbsent` atômico, `getByRequestId`, `get` e `save`.

## Limite de segurança

Sem `env.ASYNC_JOB_STORE` compatível, a rota responde `503 async_job_store_not_configured`. A implementação não usa memória efêmera em produção e não finge possuir Queue, Durable Object, worker ou persistência durável que ainda não foram provisionados.

`MemoryAsyncJobStore` existe exclusivamente para testes sintéticos locais; não é um backend de produção.

## Verificação

- `node --check functions/lib/async-jobs.js`
- `node --check functions/api/ia.js`
- `node --test tests/async-jobs.test.mjs`: 4 aprovados, 0 falhas
- suíte existente `npm test`: 84 aprovados, 0 falhas
- `git diff --check`: aprovado

## Próxima porta de saída

Provisionar e revisar um backend durável real com operação atômica `createIfAbsent`, TTL, worker/Queue, recuperação e observabilidade sem conteúdo sensível. Depois repetir os testes de integração em ambiente de desenvolvimento e somente então abrir revisão técnica. Nenhuma POC confirmatória, merge, deploy ou efeito de processo foi executado neste pacote.
