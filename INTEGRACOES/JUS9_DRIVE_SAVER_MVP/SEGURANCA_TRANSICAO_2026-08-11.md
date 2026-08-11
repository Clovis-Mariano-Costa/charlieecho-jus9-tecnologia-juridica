# Transicao de seguranca do Mini BackEnd

Classificacao: INTERNO / OPERACIONAL / SEM SEGREDOS
Estado: PREPARADO_LOCALMENTE; DEPLOY E HOMOLOGACAO AINDA PENDENTES
Alvo canonico: jus9tecnologia.com.br

## O que foi preparado

- Assinatura HMAC-SHA256 v1 com `timestamp`, `nonce` e protecao contra replay.
- Limite de corpo JSON antes do parse e limites de metadados.
- Comparacao de assinatura/chave sem igualdade direta simples.
- Digest SHA-256 do conteudo incluido no documento criado para verificacao de integridade.
- Auditoria com digest e HMAC opcional usando chave separada.
- Idempotency key gerada pelo cliente PowerShell quando nao fornecida.
- Cliente PowerShell sem envio de `chaveInterna` no modo padrao.
- Modo legado explicitamente nomeado (`-UsarChaveLegada`) para a janela de transicao.
- Erros devolvidos com limite e redacao de propriedades sensiveis.

## Configuracao sem valores secretos

Manter os valores somente nas Script Properties do Apps Script:

```text
CHAVE_INTERNA=<segredo HMAC com pelo menos 32 caracteres>
JUS9_REQUIRE_SIGNED_REQUESTS=false   # transicao; depois true
JUS9_ALLOW_LEGACY_KEY=true            # transicao; depois false
JUS9_PREVIOUS_HMAC_KEY=<chave anterior somente durante rotacao>
JUS9_AUDIT_HMAC_KEY=<segredo separado opcional>
JUS9_SIGNING_KEY_ID=<id publico da versao da chave>
```

Depois de publicar e testar o cliente assinado, alterar somente os dois controles de transicao para:

```text
JUS9_REQUIRE_SIGNED_REQUESTS=true
JUS9_ALLOW_LEGACY_KEY=false
```

## Ordem segura de ativacao

1. Fazer uma copia/versionamento da implantacao atual do Apps Script.
2. Publicar a nova versao sem divulgar a URL ativa nem os IDs das pastas.
3. Executar `doGet` e confirmar que o contrato informa HMAC-SHA256 v1.
4. Executar os testes PUBLICO, INTERNO, JURIDICO_SIGILOSO e cofre bloqueado com o cliente PowerShell.
5. Repetir uma request assinada e confirmar bloqueio de replay.
6. Alterar `JUS9_REQUIRE_SIGNED_REQUESTS=true` e `JUS9_ALLOW_LEGACY_KEY=false`.
7. Repetir um teste assinado e um teste legado; o segundo deve falhar.
8. Registrar URL/ID da implantacao, horario, hash da versao e resultado dos testes em registro interno, sem registrar segredo.

## Limites desta preparacao

- Nenhum deploy, merge, revogacao, exclusao ou escrita no Drive foi executado por esta preparacao.
- Apps Script continua dependendo do TLS do Web App e dos controles de acesso do Google Drive; o codigo nao inventa criptografia de armazenamento para o documento.
- A rotacao pode aceitar temporariamente `CHAVE_INTERNA` e `JUS9_PREVIOUS_HMAC_KEY`; remova a anterior ao encerrar a janela de migracao.
- A assinatura HMAC protege autenticidade e integridade entre cliente e endpoint, mas nao substitui rotacao de segredo, controle de acesso, monitoramento ou resposta a incidente.
- Os testes que dependem de conta Google, URL ativa, pastas e implantacao precisam ser executados pelo responsavel autorizado.
