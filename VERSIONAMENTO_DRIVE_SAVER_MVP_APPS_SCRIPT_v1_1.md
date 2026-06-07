# Versionamento - Drive Saver MVP Apps Script

Classificacao: PUBLICO / VERSIONAMENTO / INTEGRACAO / SEM SEGREDOS
Versao: v1.1
Data: 2026-06-07

## Atualizacao

Consolidada a versao validada em execucao real no Apps Script da conta operacional do Drive.

## O que mudou

- Destinos de pasta validados para a conta correta do Cartorio Digital Charlie Echo
- IDs de pasta retirados do `Code.gs` publico e movidos para Script Properties
- `PUBLICO` validado com sucesso
- `INTERNO` validado com sucesso
- `JURIDICO_SIGILOSO` validado com sucesso, entrando em `00_ENTRADA_PARA_REVISAO_HUMANA`
- `COFRE_NAO_AUTOMATICO` passou a retornar bloqueio explicito, sem criacao automatica
- criado script PowerShell `INTEGRACOES/JUS9_DRIVE_SAVER_MVP/Enviar-Jus9Documento.ps1`
- script PowerShell passou a preferir `-PedirChave` ou variavel de ambiente, evitando chave na linha de comando

## Script Properties obrigatorias

Valores reais devem ficar apenas nas Propriedades do script do Apps Script:

- `CHAVE_INTERNA`
- `JUS9_FOLDER_ENTRADA_REVISAO`
- `JUS9_FOLDER_PUBLICO`
- `JUS9_FOLDER_INTERNO`

Os valores foram validados localmente em 2026-06-07 e nao devem ser registrados neste arquivo publico.

## Decisao operacional

Durante a janela de testes, a implantacao pode ficar aberta o minimo necessario para validar integracao.

Depois da consolidacao, a preferencia e voltar o Web App para modo fechado.

## Limite do Cofre

`04_COFRE_NAO_AUTOMATICO` permanece reservado a atuacao conjunta com o usuario.

Nesta versao, a classificacao `COFRE_NAO_AUTOMATICO` retorna bloqueio e exige procedimento proprio.

## Observacao de seguranca

Nao registrar `CHAVE_INTERNA`, URL ativa do Web App ou IDs reais de pasta em GitHub publico, Drive publico, prints ou chat.
