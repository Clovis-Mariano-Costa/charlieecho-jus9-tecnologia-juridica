# Publicar acoes corretivas no Apps Script

Data: 2026-07-03
Classificacao: OPERACIONAL / SEM SEGREDOS

## Por que este passo existe

A API da Charlie Echo ja reconhece pedidos como "revogue este link", "publiquei errado", "mova para revisao" e "mande para lixeira governada".

Para a acao realmente acontecer no Google Drive, o Web App do Apps Script `JUS9_DRIVE_SAVER_MVP` precisa estar publicado com o `Code.gs` atualizado deste repositorio.

## Arquivo fonte

Use o conteudo completo de:

`INTEGRACOES/JUS9_DRIVE_SAVER_MVP/Code.gs`

## Passo a passo

1. Abra o projeto `JUS9_DRIVE_SAVER_MVP` no Google Apps Script.
2. Abra o arquivo `Code.gs`.
3. Substitua o conteudo inteiro pelo `Code.gs` deste repositorio.
4. Salve o projeto.
5. Clique em `Deploy` / `Manage deployments`.
6. Edite o Web App existente.
7. Escolha `New version`.
8. Mantenha o mesmo acesso/configuracao ja aprovado para o Web App.
9. Clique em `Deploy`.
10. Nao altere nem publique chaves em chat, print, GitHub ou documento publico.

## Teste esperado depois da publicacao

Na Charlie Echo, envie uma mensagem com link real de arquivo criado pelo Drive Saver, por exemplo:

`revogue o link publico deste documento https://docs.google.com/document/d/FILE_ID/edit`

Resposta esperada:

- Charlie identifica `RESTRINGIR_LINK_PUBLICO`;
- Drive Saver retorna `ok=true`;
- a resposta inclui `AuditId`;
- se houver auditoria criada, a resposta inclui link de registro de auditoria.

## Sinal de que o Apps Script ainda esta antigo

Se a resposta disser que o Apps Script "parece ainda estar na versao anterior" ou se o Drive Saver responder `Conteudo vazio`, significa que a API da Charlie ja esta atualizada, mas o Web App do Apps Script ainda nao recebeu o novo `Code.gs`.
