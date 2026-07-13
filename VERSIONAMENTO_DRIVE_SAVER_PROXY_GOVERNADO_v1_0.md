# Drive Saver por proxy governado v1.0

- ID: CHARLIE-DRIVE-PROXY-1.0
- Versao: 1.0.0
- Autor: Codex / Charlie Fox, sob direcao do Fundador
- Responsavel pela revisao: Fundador da Jus 9 Tecnologia Juridica
- Data: 2026-07-13
- Status: homologacao tecnica concluida
- Classificacao: INTERNO

## Regra operacional

A API publica continua respondendo perguntas. Criacao, revogacao, movimentacao ou envio a lixeira no Google Drive somente ocorre quando a requisicao traz autorizacao interna valida do proxy Jus 9. O segredo nunca vai ao navegador.

Cada operacao recebe `requestId` e `idempotencyKey`. O `Code.gs` reutiliza por seis horas o resultado de uma operacao ja concluida, evitando documento duplicado em repeticao por timeout.

## Publicacao

1. Configurar `JUS9_CHARLIE_INTERNAL_TOKEN` no Pages da Charlie Echo e no Worker do portal.
2. Publicar nova versao do Web App Apps Script com o `Code.gs` deste repositorio.
3. Validar resposta anonima sem escrita e perfil autorizado com documento inteiramente ficticio.
4. Conferir `downloadUrl`, `viewUrl`, classificacao, pasta e auditoria antes do aceite.
