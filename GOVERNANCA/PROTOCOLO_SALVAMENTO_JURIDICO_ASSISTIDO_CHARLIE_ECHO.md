# Protocolo de Salvamento Juridico Assistido - Charlie Echo

Classificacao: GOVERNANCA / PROTOCOLO / DRIVE SAVER MVP
Versao: v1.2
Data: 2026-06-07

## Finalidade

Permitir que Charlie Echo solicite salvamento controlado de documentos no Google Drive por meio de backend autenticado, sem receber senha, token, chave privada ou acesso irrestrito ao Drive.

## Regra central

Charlie Echo solicita.

Backend autenticado executa.

Charlie Fox constroi a ponte.

Fundador autoriza.

Documento juridico sensivel exige revisao humana.

Cofre nao recebe salvamento automatico comum pelo MVP. A classificacao `COFRE_NAO_AUTOMATICO` deve retornar bloqueio, exigir procedimento proprio e manter o Fundador junto para qualquer acao material.

Quando houver autorizacao expressa do Fundador, pode existir uma rota separada de deposito assistido, `COFRE_DEPOSITO_ASSISTIDO`, para gravar documento novo em pasta secreta configurada por Script Property. Essa rota e somente escrita/criacao. Nao autoriza leitura, listagem, edicao, exclusao, sobrescrita, limpeza, movimentacao de arquivo existente ou publicacao de conteudo de cofre.

## Cartorio Digital

Pasta-mae:

`JUS 9 TECNOLOGIA JURIDICA — CARTORIO DIGITAL CHARLIE ECHO`

Rotas:

- `PUBLICO` -> `01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS`
- `INTERNO` -> `02_DOCUMENTOS_INTERNOS_JUS9`
- `JURIDICO_SIGILOSO` -> `00_ENTRADA_PARA_REVISAO_HUMANA`
- `COFRE_DEPOSITO_ASSISTIDO` -> pasta secreta definida por `JUS9_FOLDER_COFRE_DEPOSITO`, somente criacao de documento novo
- `COFRE_NAO_AUTOMATICO` -> bloqueio explicito, sem criacao automatica

## Cofre

`04_COFRE_NAO_AUTOMATICO` e reservado ao Fundador quanto a edicao, exclusao e decisao final.

Charlie Fox e Charlie Echo podem ler por autorizacao do Fundador.

Automacao comum nao deve criar, editar, excluir, mover, sobrescrever, limpar ou publicar conteudo de cofre.

Historico: a versao v1.0 admitia deposito novo governado no cofre. A versao v1.1 substituiu essa permissao por bloqueio automatico completo. A versao v1.2 reintroduz apenas deposito assistido write-only por classificacao propria (`COFRE_DEPOSITO_ASSISTIDO`), sem leitura, listagem, edicao, exclusao ou modificacao de conteudo existente.

## Propriedades seguras do Apps Script

O `Code.gs` publico nao deve registrar `CHAVE_INTERNA` nem IDs de pasta do Drive.

Configurar no Apps Script, em Project Settings -> Script Properties:

- `CHAVE_INTERNA`
- `JUS9_FOLDER_ENTRADA_REVISAO`
- `JUS9_FOLDER_PUBLICO`
- `JUS9_FOLDER_INTERNO`
- `JUS9_FOLDER_COFRE_DEPOSITO` apenas se o Fundador autorizar deposito assistido write-only

Esses valores nao devem ser publicados no GitHub, Drive publico, prints ou chat.

## Limites

Nao usar usuario e senha em chat.

Nao publicar token, chave, `.env`, backup code ou link de edicao aberto.

Nao publicar IDs de pasta do Cartorio Digital em documentacao publica quando puderem ficar nas Script Properties.

Nao permitir exclusao automatica.

Nao permitir sobrescrita automatica.

Nao salvar documento juridico real como definitivo sem revisao humana.

Nao usar `COFRE_DEPOSITO_ASSISTIDO` como permissao de acesso ao cofre. A permissao e apenas de criacao de novo documento por backend autenticado.
