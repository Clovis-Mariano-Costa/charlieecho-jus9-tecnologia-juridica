# Testes Manuais - JUS9_DRIVE_SAVER_MVP

Classificacao: INTERNO / TESTE / APPS SCRIPT
Data: 2026-06-07

## Cuidados antes de testar

1. Colar `Code.gs` no projeto Apps Script `JUS9_DRIVE_SAVER_MVP`.
2. Configurar `CHAVE_INTERNA` com pelo menos 32 caracteres aleatorios em Propriedades do script.
3. Configurar `JUS9_FOLDER_ENTRADA_REVISAO`, `JUS9_FOLDER_PUBLICO` e `JUS9_FOLDER_INTERNO` em Propriedades do script.
4. Configurar `JUS9_FOLDER_COFRE_DEPOSITO` apenas se o Fundador autorizar deposito assistido write-only.
5. Durante a transicao, manter `JUS9_REQUIRE_SIGNED_REQUESTS=false` e `JUS9_ALLOW_LEGACY_KEY=true`; depois dos testes, mudar para `true` e `false`, respectivamente.
6. Se for encadear auditoria, configurar `JUS9_AUDIT_HMAC_KEY` separado de `CHAVE_INTERNA` e registrar `JUS9_SIGNING_KEY_ID` sem o valor secreto.
7. Executar `doGet` uma vez ou publicar como Web App somente quando estiver pronto.
8. Nao compartilhar chave, assinatura, URL ativa do Web App ou IDs das pastas em repositorio publico.

## Estado validado em 2026-06-07

- `PUBLICO`: aprovado
- `INTERNO`: aprovado
- `JURIDICO_SIGILOSO`: aprovado com entrada em revisao humana
- `COFRE_DEPOSITO_ASSISTIDO`: aprovado apenas como criacao de documento novo, se propriedade de pasta estiver configurada
- `COFRE_NAO_AUTOMATICO`: mantido bloqueado no codigo

## Cuidados adicionais

9. Confirmar que os IDs nas Script Properties pertencem a conta Google que esta executando o Apps Script.
10. Verificar que requests assinadas com timestamp fora de 5 minutos falham.
11. Reenviar o mesmo `timestamp` + `nonce` e confirmar bloqueio de replay.
12. Depois dos testes de integracao, preferir voltar a implantacao para modo fechado.

## Contrato de autenticacao

O cliente `Enviar-Jus9Documento.ps1` assina por padrao. A assinatura e HMAC-SHA256 sobre:

```text
timestamp.nonce.JSON_CANONICO_V1
```

`JSON_CANONICO_V1` usa os campos em ordem fixa no `Code.gs`; `timestamp`, `nonce`, `assinatura` e `chaveInterna` ficam fora do JSON assinado. O cliente nao envia `chaveInterna` no modo padrao. Use `-UsarChaveLegada` somente enquanto a implantacao publicada ainda aceitar exclusivamente a chave antiga.

Testes negativos obrigatorios: assinatura alterada, corpo alterado, nonce reutilizado, timestamp expirado, segredo menor que 32 caracteres e `JUS9_REQUIRE_SIGNED_REQUESTS=true` sem assinatura.

Para rotacao, colocar a nova chave em `CHAVE_INTERNA` e manter a antiga temporariamente em `JUS9_PREVIOUS_HMAC_KEY`; remover a anterior depois da janela de migracao e dos testes.

Os payloads abaixo sao modelos documentais: `timestamp=0`, nonce e assinatura sao placeholders e nao devem ser enviados literalmente. Para executar, usar o cliente PowerShell ou gerar os tres campos com o contrato acima.

## Payload PUBLICO

```json
{
  "timestamp": 0,
  "nonce": "NONCE_GERADO_PELO_CLIENTE",
  "assinatura": "ASSINATURA_HMAC_GERADA_PELO_CLIENTE",
  "titulo": "Teste publico Charlie Echo",
  "conteudo": "Este e um teste publico ficticio para validar salvamento no Cartorio Digital.",
  "classificacao": "PUBLICO",
  "tipoDocumento": "TESTE",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Echo / Codex",
  "observacao": "Deve ir para 01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS."
}
```

Resultado esperado: salvar em `01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS`, com `revisaoHumanaObrigatoria = false`.

## Payload PUBLICO com link de download

```json
{
  "timestamp": 0,
  "nonce": "NONCE_GERADO_PELO_CLIENTE",
  "assinatura": "ASSINATURA_HMAC_GERADA_PELO_CLIENTE",
  "titulo": "Teste publico com link de download",
  "conteudo": "Este e um teste publico ficticio para validar link governado.",
  "classificacao": "PUBLICO",
  "tipoDocumento": "TESTE_DOWNLOAD",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Echo / Codex",
  "observacao": "Deve criar link publico apenas por estar classificado como PUBLICO.",
  "criarLinkDownload": true
}
```

Resultado esperado: salvar em `01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS`, retornar `linkPublicoCriado = true` e preencher `downloadUrl`. Nao usar este modo para documento interno, juridico sigiloso ou cofre.

## Payload INTERNO

```json
{
  "timestamp": 0,
  "nonce": "NONCE_GERADO_PELO_CLIENTE",
  "assinatura": "ASSINATURA_HMAC_GERADA_PELO_CLIENTE",
  "titulo": "Teste interno Charlie Echo",
  "conteudo": "Este e um teste interno ficticio.",
  "classificacao": "INTERNO",
  "tipoDocumento": "MEMORANDO",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Echo / Codex"
}
```

Resultado esperado: salvar em `02_DOCUMENTOS_INTERNOS_JUS9`, com `revisaoHumanaObrigatoria = false`.

## Payload JURIDICO_SIGILOSO

```json
{
  "timestamp": 0,
  "nonce": "NONCE_GERADO_PELO_CLIENTE",
  "assinatura": "ASSINATURA_HMAC_GERADA_PELO_CLIENTE",
  "titulo": "Teste juridico sigiloso ficticio",
  "conteudo": "Documento ficticio para verificar entrada em revisao humana. Nao contem dados reais.",
  "classificacao": "JURIDICO_SIGILOSO",
  "tipoDocumento": "MINUTA FICTICIA",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Echo / Codex",
  "observacao": "Teste de entrada em revisao humana."
}
```

Resultado esperado: salvar em `00_ENTRADA_PARA_REVISAO_HUMANA`, com `revisaoHumanaObrigatoria = true`.

## Payload COFRE_NAO_AUTOMATICO

```json
{
  "timestamp": 0,
  "nonce": "NONCE_GERADO_PELO_CLIENTE",
  "assinatura": "ASSINATURA_HMAC_GERADA_PELO_CLIENTE",
  "titulo": "Teste cofre arquivo novo",
  "conteudo": "Teste ficticio. Nao deve salvar automaticamente no cofre.",
  "classificacao": "COFRE_NAO_AUTOMATICO",
  "tipoDocumento": "TESTE",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Echo / Codex"
}
```

Resultado esperado: retornar bloqueio para `04_COFRE_NAO_AUTOMATICO`, sem criar arquivo.

## Payload COFRE_DEPOSITO_ASSISTIDO

Usar somente com autorizacao expressa do Fundador e `JUS9_FOLDER_COFRE_DEPOSITO` configurada.

```json
{
  "timestamp": 0,
  "nonce": "NONCE_GERADO_PELO_CLIENTE",
  "assinatura": "ASSINATURA_HMAC_GERADA_PELO_CLIENTE",
  "titulo": "Deposito assistido no cofre",
  "conteudo": "Registro ficticio para validar deposito write-only. Nao contem segredo real.",
  "classificacao": "COFRE_DEPOSITO_ASSISTIDO",
  "tipoDocumento": "DEPOSITO_ASSISTIDO",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Echo / Codex",
  "observacao": "Deve apenas criar documento novo; nao ler, editar, excluir ou listar conteudo existente."
}
```

Resultado esperado: criar documento novo na pasta definida por `JUS9_FOLDER_COFRE_DEPOSITO`, com `revisaoHumanaObrigatoria = true` e `cofreDepositoAssistido = true`.

## Fluxo PowerShell

Para reduzir atrito nos proximos envios, usar o script `Enviar-Jus9Documento.ps1` da mesma pasta.

Preferir `-PedirChave` ou a variavel de ambiente `JUS9_DRIVE_SAVER_CHAVE_INTERNA`. O script usa assinatura HMAC por padrao.

Evitar `-ChaveInterna` em linha de comando, pois o valor pode ficar no historico do terminal. `-UsarChaveLegada` envia a chave no corpo e deve ser removido ao fechar a transicao.
