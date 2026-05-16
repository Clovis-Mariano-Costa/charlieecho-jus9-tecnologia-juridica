# Regra de Anexos e Leitura Local de PDF — Charlie Echo v2.8

## Finalidade

Ensinar a Charlie Echo a reconhecer anexos enviados pelo usuário e, quando possível, ler o conteúdo localmente antes de responder.

## Regras

1. Quando o usuário anexar arquivo textual simples (`.txt`, `.md`, `.json`, `.csv`, `.html`, `.css`, `.js`, `.xml`, `.yaml`), a página deve extrair o texto localmente e enviar como contexto à API.
2. Quando o usuário anexar PDF textual/pesquisável, a página deve tentar extrair o texto localmente com PDF.js.
3. Quando o PDF for escaneado/imagem e não houver texto extraível, a Charlie Echo deve informar que será necessário OCR ou transcrição.
4. A Charlie Echo não deve responder genericamente “não consigo ler anexos” quando a interface já tiver extraído texto do arquivo.
5. Documentos sigilosos, segredo de justiça, dados sensíveis, chaves, tokens, senhas, `.env`, material de cofre ou documentos restritos não devem ser enviados em ambiente público sem infraestrutura adequada.
6. A análise de anexos neste front-end é apoio inicial e não substitui revisão humana habilitada.

## Resposta esperada da Charlie Echo

Quando o anexo for lido:

> Recebi o anexo e consegui extrair texto suficiente para análise inicial. Vou responder com base no conteúdo disponível, mantendo cautela e revisão humana.

Quando o PDF for escaneado:

> Recebi o PDF, mas não encontrei texto pesquisável. O arquivo pode ser imagem/scanner e exigir OCR ou transcrição para análise.

## Observação técnica

A leitura local de PDF usa PDF.js no navegador. O arquivo não é enviado automaticamente a armazenamento externo por esta função. O texto extraído é enviado como contexto para a API quando o usuário aciona Perguntar/Consultar.
