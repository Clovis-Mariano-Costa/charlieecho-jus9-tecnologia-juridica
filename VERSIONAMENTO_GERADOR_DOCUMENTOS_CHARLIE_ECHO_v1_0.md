# Versionamento - Gerador de documentos Charlie Echo v1.0

Data: 2026-05-25

## Atualizacao

Implementado o primeiro gerador de documentos para download da Charlie Echo.

## O que mudou

- A rota `functions/api/gerar-download.js` agora devolve arquivo como anexo HTTP.
- O frontend passa a poder oferecer download local e download pelo servidor.
- Os formatos iniciais suportados sao `.txt` e `.md`.
- Quando o servidor nao estiver disponivel, o navegador deve manter fallback local por `Blob`.

## Limite atual

Esta versao gera download imediato, mas ainda nao cria link publico persistente.

Para link publico permanente sera necessario armazenamento seguro, como Cloudflare R2/KV, banco proprio ou servidor Node com pasta controlada.

## Seguranca

Nenhum token, senha, chave, dado real, documento pessoal ou conteudo de cofre foi incluido.
