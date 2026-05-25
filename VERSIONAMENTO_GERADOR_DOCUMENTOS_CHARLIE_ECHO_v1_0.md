# Versionamento - Gerador de documentos Charlie Echo v1.0

Data: 2026-05-25

## Atualizacao

Implementado o primeiro gerador de documentos para download da Charlie Echo.

## O que mudou

- A rota `functions/api/gerar-download.js` agora devolve arquivo como anexo HTTP.
- O frontend passa a poder oferecer download local e download pelo servidor.
- Os formatos suportados passam a incluir `.txt`, `.md`, `.pdf`, `.html`, `.json`, `.csv`, `.ics`, `.vcf`, `.xml`, `.log`, `.rtf`, `.yaml`, `.sql`, `.js`, `.css`, `.svg`, `.tex`, `.docx`, `.xlsx`, `.pptx` e `.zip`.
- Quando o servidor nao estiver disponivel, o navegador deve manter fallback local por `Blob`.

## Limite atual

Esta versao gera download imediato, incluindo PDF simples e pacotes Office/ZIP minimos gerados no servidor, mas ainda nao cria link publico persistente.

Os formatos `.docx`, `.xlsx` e `.pptx` sao versoes minimas baseadas em OpenXML para documento simples, planilha simples e apresentacao simples. Para documentos ricos com layout profissional, a proxima etapa deve usar gerador dedicado ou modelo institucional.

Para link publico permanente sera necessario armazenamento seguro, como Cloudflare R2/KV, banco proprio ou servidor Node com pasta controlada.

## Seguranca

Nenhum token, senha, chave, dado real, documento pessoal ou conteudo de cofre foi incluido.
