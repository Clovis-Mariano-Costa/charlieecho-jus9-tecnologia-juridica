# Versionamento - Salas, memoria curta e OCR Charlie Echo v3.6

Data: 2026-06-04

## Escopo

Atualizacao das telas publicas da Charlie Echo para reduzir regressao operacional nos chats.

## Entregas

- Corrigido o botao `Governanca` da pagina inicial.
- Adicionado painel de salas em IA Estudantes e IA Profissional.
- Adicionada memoria curta por sala usando `sessionStorage`.
- A proxima pergunta passa a receber o resumo da sala ativa como contexto.
- Ampliados anexos aceitos: texto, PDF, DOCX, XLSX, PNG, JPG, JPEG e WEBP.
- Adicionado OCR local para imagens com Tesseract.js quando o navegador conseguir carregar a biblioteca.
- Adicionada tentativa de OCR local para primeiras paginas de PDF escaneado.
- Adicionada extracao basica de DOCX/XLSX com JSZip quando disponivel.
- Limpas mensagens locais principais para ASCII, evitando erros visiveis de codificacao.
- Criada auditoria `scripts/audit-charlie-chat-capabilities.mjs`.

## Limites honestos

OCR local depende do navegador, do tamanho do arquivo, da qualidade da imagem e do carregamento de biblioteca externa.

Para producao real, ainda e recomendado backend/worker dedicado com:

- upload seguro;
- limite por usuario;
- logs de auditoria;
- armazenamento temporario;
- politica de retencao;
- OCR robusto;
- controle de acesso.

## Validacao

```bash
node --check assets/js/charlie-ia-pages.js
node --check scripts/audit-charlie-chat-capabilities.mjs
node scripts/audit-charlie-chat-capabilities.mjs
```
