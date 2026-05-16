# RELATÓRIO — Anexos, PDF e Sentença v2.8

## O que foi feito

- Corrigida a integração do botão **Anexar** com a lista visual de arquivos selecionados.
- Adicionado reconhecimento de nome, tipo e tamanho dos anexos.
- Mantida leitura local de arquivos textuais simples.
- Adicionada tentativa de leitura local de PDFs textuais/pesquisáveis com PDF.js.
- Adicionado aviso para PDFs escaneados/imagem que exigem OCR ou transcrição.
- Ajustado o envio para que o texto extraído dos anexos seja incluído como contexto na pergunta/consulta.
- Ajustado o prompt/backend para a Charlie Echo não responder genericamente que não consegue ler anexos quando houver texto extraído.
- Aumentado limite inicial de mensagem para permitir contexto textual extraído de anexos, mantendo cautela de tamanho.
- Incluído o PDF da sentença interna autorizando sugestões de alteração de governança e aperfeiçoamento do Protocolo Mão na Massa.

## Arquivos principais alterados

- `assets/js/charlie-ia-pages.js`
- `functions/api/ia.js`
- `ia-estudantes.html`
- `ia-profissional.html`
- `ia-estudantes/index.html`
- `ia-profissional/index.html`

## Arquivos incluídos

- `GOVERNANCA/PDF/SENTENCA_INTERNA_CHARLIE_ECHO_GOVERNANCA_PROTOCOLO_MAO_NA_MASSA.pdf`
- `ORIENTACOES/REGRA_ANEXOS_PDF_LEITURA_LOCAL_v2_8.md`
- `RELATORIOS/RELATORIO_ANEXOS_PDF_SENTENCA_v2_8.md`
- `COMMIT_ANEXOS_PDF_SENTENCA_v2_8.md`
