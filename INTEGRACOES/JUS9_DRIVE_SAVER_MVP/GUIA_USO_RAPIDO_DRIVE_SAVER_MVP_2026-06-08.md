# Guia de Uso Rapido - Drive Saver MVP

Classificacao: INTERNO / GUIA RAPIDO / APPS SCRIPT
Data: 2026-06-08

## Finalidade

Reduzir o atrito para a Charlie Echo e para a equipe ao salvar documentos no Cartorio Digital via mini backend.

## Pre-requisitos

1. `Code.gs` atualizado no Apps Script.
2. `CHAVE_INTERNA` configurada nas propriedades do script.
3. `JUS9_FOLDER_ENTRADA_REVISAO`, `JUS9_FOLDER_PUBLICO` e `JUS9_FOLDER_INTERNO` configuradas nas propriedades do script.
4. `JUS9_FOLDER_COFRE_DEPOSITO` configurada somente se houver autorizacao expressa para deposito assistido write-only.
5. URL do Web App ativa.
6. Pastas de destino com IDs validos para a conta que executa o script.

## Script principal

Usar:

- `INTEGRACOES/JUS9_DRIVE_SAVER_MVP/Enviar-Jus9Documento.ps1`
- `INTEGRACOES/JUS9_DRIVE_SAVER_MVP/Configurar-DriveSaverEnv.ps1`, para criar ou atualizar o `.env` local da Charlie Echo sem versionar segredos.

## Configurar o miniBackend local

Quando a URL do Web App do Apps Script ja estiver publicada, executar na raiz da integracao:

```powershell
powershell -ExecutionPolicy Bypass -File ".\Configurar-DriveSaverEnv.ps1" -GerarApiToken
```

O script pede `JUS9_DRIVE_SAVER_URL` e `JUS9_DRIVE_SAVER_CHAVE_INTERNA` sem imprimir a chave no terminal, gera `JUS9_DRIVE_SAVER_API_TOKEN` local forte e grava somente no `.env` local, protegido pelo `.gitignore`.

Depois, iniciar a Charlie Echo:

```powershell
npm start
```

Para teste a partir do MVP Advogados, usar o endpoint intermediario:

```text
http://127.0.0.1:3000/api/drive-saver/documentos
```

No DAJ Express, informar apenas o `JUS9_DRIVE_SAVER_API_TOKEN`. A `CHAVE_INTERNA` do Apps Script nunca deve entrar no navegador.

## Exemplo rapido

```powershell
powershell -ExecutionPolicy Bypass -File ".\Enviar-Jus9Documento.ps1" `
  -Uri "SUA_URL_DO_WEB_APP" `
  -PedirChave `
  -Classificacao "INTERNO" `
  -Titulo "Teste rapido" `
  -Conteudo "Conteudo ficticio de teste." `
  -TipoDocumento "MEMORANDO" `
  -RegistrarEm ".\ultimo-registro.json"
```

## Modos de uso

### 1. Enviar pedindo chave

Usar `-PedirChave` para digitar `CHAVE_INTERNA` sem exibir o valor no terminal.

### 2. Enviar por variavel de ambiente

O script tambem aceita a variavel de ambiente `JUS9_DRIVE_SAVER_CHAVE_INTERNA`, configurada fora do repositorio.

### 3. Enviar e registrar

Usar `-RegistrarEm` para guardar a resposta em JSON.

O registro nao grava `CHAVE_INTERNA` nem a URL do Web App.

### 4. Enviar e abrir documento criado

Usar `-AbrirUrlCriada`.

### 5. Link publico de download

O Apps Script aceita `criarLinkDownload=true`, mas somente para classificacao `PUBLICO`.

Para `INTERNO`, `JURIDICO_SIGILOSO`, `COFRE_NAO_AUTOMATICO` ou qualquer rota com revisao/cofre, o retorno deve permanecer sem link publico.

O caminho recomendado para o MVP Advogados e usar um backend intermediario, como `/api/drive-saver/documentos`, para que a `CHAVE_INTERNA` fique no servidor e nunca no navegador.

### Compatibilidade

O parametro `-ChaveInterna` ainda existe, mas deve ser evitado porque pode aparecer no historico do terminal.

## Regra do cofre

`COFRE_NAO_AUTOMATICO` continua bloqueado no codigo atual.

Nao usar o script para tentar contornar essa regra.

Para deposito assistido write-only, usar a classificacao `COFRE_DEPOSITO_ASSISTIDO`, com `JUS9_FOLDER_COFRE_DEPOSITO` configurada nas Script Properties. Essa rota apenas cria documento novo; nao le, edita, apaga, move, lista, sobrescreve ou publica conteudo existente do cofre.

## Boa pratica

Depois da janela de testes, preferir voltar o Web App para modo fechado e executar teste final de confirmacao.
