# S52 - contrato puro para jobs assíncronos (proposta de revisão)

Estado: **contrato e testes propostos; nenhuma rota ativada, nenhuma fila criada, nenhum deploy realizado**.

Escopo: `functions/lib/async-job-contract.js` contém validação de envelope, impressão SHA-256 canônica, detecção de conflito de idempotência, serialização pública mínima e URL de consulta. A validação protege a regra `process_effect=none` e rejeita campos de efeitos laterais. Testes em `tests/async-job-contract.test.mjs`.

Falta antes de operar: autenticação/autorização real; storage durável com isolamento por principal/tenant; definição do executor (sem duplicar Queue/state machine COM-IAS); processamento externo; TTL e expiração efetivos; limite de custo/rate limit; polling autorizado (evitar IDOR); idempotência atômica sob concorrência; política de dados/classificação; robustez do resultado; revisão de CI, threat model e rollback. O hash sozinho NÃO identifica principal; a chave persistida deve ser escopada a principal autenticado e `requestId`.

Não alterar `functions/api/ia.js` nem permitir o fallback síncrono. Não disparar probe ou gravação Drive. Próximo passo: responsável técnico habilitado decide adaptador de runtime e submete implementação completa em PR distinto ou extensão revisada, mantendo a issue #19 como fonte de tracking.
