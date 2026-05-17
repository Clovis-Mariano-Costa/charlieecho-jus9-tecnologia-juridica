# RELATÓRIO — Download único, Enter e Limpar v2.4

## O que foi feito

- Reintroduzido um botão único **⬇ Download** nas áreas de resposta da IA Estudantes e IA Profissional.
- O botão abre opções sob demanda: `.txt`, `.md` e aviso de link futuro.
- Mantida a interface limpa, sem múltiplos botões permanentes de formato.
- Implementado envio por **Enter**.
- Mantido **Shift+Enter** para quebra de linha.
- Melhorada a ação **Limpar**, limpando pergunta, resposta, status, áudio e devolvendo foco ao campo principal.
- Criada base da rota futura `/api/gerar-download` para integração posterior com Cloudflare R2/KV.
- Adicionada orientação operacional em `ORIENTACOES/REGRA_DOWNLOAD_UNICO_ENTER_LIMPAR_CHARLIE_ECHO.md`.

## Arquivos principais alterados

- `ia-estudantes.html`
- `ia-profissional.html`
- `ia-estudantes/index.html`
- `ia-profissional/index.html`
- `assets/js/charlie-ia-pages.js`
- `assets/css/charlie-light.css`
- `functions/api/gerar-download.js`
- `ORIENTACOES/REGRA_DOWNLOAD_UNICO_ENTER_LIMPAR_CHARLIE_ECHO.md`
