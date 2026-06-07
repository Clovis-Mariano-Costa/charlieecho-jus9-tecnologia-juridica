# Testes Manuais - JUS9_DRIVE_SAVER_MVP

Classificacao: INTERNO / TESTE / APPS SCRIPT
Data: 2026-06-07

## Cuidados antes de testar

1. Colar `Code.gs` no projeto Apps Script `JUS9_DRIVE_SAVER_MVP`.
2. Configurar `CHAVE_INTERNA` em Propriedades do script.
3. Configurar `JUS9_FOLDER_ENTRADA_REVISAO`, `JUS9_FOLDER_PUBLICO` e `JUS9_FOLDER_INTERNO` em Propriedades do script.
4. Executar `doGet` uma vez ou publicar como Web App somente quando estiver pronto.
5. Nao compartilhar a chave interna, URL ativa do Web App ou IDs das pastas em repositorio publico.

## Estado validado em 2026-06-07

- `PUBLICO`: aprovado
- `INTERNO`: aprovado
- `JURIDICO_SIGILOSO`: aprovado com entrada em revisao humana
- `COFRE_NAO_AUTOMATICO`: mantido bloqueado no codigo

## Cuidados adicionais

6. Confirmar que os IDs nas Script Properties pertencem a conta Google que esta executando o Apps Script.
7. Evitar publicar a URL ativa do Web App em repositorio publico.
8. Depois dos testes de integracao, preferir voltar a implantacao para modo fechado.

## Payload PUBLICO

```json
{
  "chaveInterna": "VALOR_DA_SUA_CHAVE",
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

## Payload INTERNO

```json
{
  "chaveInterna": "VALOR_DA_SUA_CHAVE",
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
  "chaveInterna": "VALOR_DA_SUA_CHAVE",
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
  "chaveInterna": "VALOR_DA_SUA_CHAVE",
  "titulo": "Teste cofre arquivo novo",
  "conteudo": "Teste ficticio. Nao deve salvar automaticamente no cofre.",
  "classificacao": "COFRE_NAO_AUTOMATICO",
  "tipoDocumento": "TESTE",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Echo / Codex"
}
```

Resultado esperado: retornar bloqueio para `04_COFRE_NAO_AUTOMATICO`, sem criar arquivo.

## Fluxo PowerShell

Para reduzir atrito nos proximos envios, usar o script `Enviar-Jus9Documento.ps1` da mesma pasta.

Preferir `-PedirChave` ou a variavel de ambiente `JUS9_DRIVE_SAVER_CHAVE_INTERNA`.

Evitar `-ChaveInterna` em linha de comando, pois o valor pode ficar no historico do terminal.
