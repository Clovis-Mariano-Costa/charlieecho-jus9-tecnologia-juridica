# Testes Manuais - JUS9_DRIVE_SAVER_MVP

Classificacao: INTERNO / TESTE / APPS SCRIPT
Data: 2026-06-06

## Antes de testar

1. Colar `Code.gs` no projeto Apps Script `JUS9_DRIVE_SAVER_MVP`.
2. Configurar `CHAVE_INTERNA` em Propriedades do script.
3. Executar `doGet` uma vez ou publicar como Web App somente quando estiver pronto.
4. Nao compartilhar a chave interna.

## Payload PUBLICO

```json
{
  "chaveInterna": "VALOR_DA_SUA_CHAVE",
  "titulo": "Teste publico Charlie Echo",
  "conteudo": "Este e um teste publico ficticio para validar salvamento no Cartorio Digital.",
  "classificacao": "PUBLICO",
  "tipoDocumento": "TESTE",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Fox / Codex",
  "observacao": "Deve ir para 01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS."
}
```

## Payload INTERNO

```json
{
  "chaveInterna": "VALOR_DA_SUA_CHAVE",
  "titulo": "Teste interno Charlie Echo",
  "conteudo": "Este e um teste interno ficticio.",
  "classificacao": "INTERNO",
  "tipoDocumento": "MEMORANDO",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Fox / Codex"
}
```

## Payload JURIDICO_SIGILOSO

```json
{
  "chaveInterna": "VALOR_DA_SUA_CHAVE",
  "titulo": "Teste juridico sigiloso ficticio",
  "conteudo": "Documento ficticio para verificar entrada em revisao humana. Nao contem dados reais.",
  "classificacao": "JURIDICO_SIGILOSO",
  "tipoDocumento": "MINUTA FICTICIA",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Fox / Codex"
}
```

## Payload COFRE_NAO_AUTOMATICO

```json
{
  "chaveInterna": "VALOR_DA_SUA_CHAVE",
  "titulo": "Teste cofre bloqueado",
  "conteudo": "Teste ficticio. Deve ser bloqueado.",
  "classificacao": "COFRE_NAO_AUTOMATICO",
  "tipoDocumento": "TESTE",
  "origem": "Teste manual Apps Script",
  "autorOperacional": "Charlie Fox / Codex"
}
```

Resultado esperado: nao criar arquivo em `04_COFRE_NAO_AUTOMATICO`.

