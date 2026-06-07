# Protocolo de Salvamento Juridico Assistido - Charlie Echo

Classificacao: GOVERNANCA / PROTOCOLO / DRIVE SAVER MVP
Versao: v1.1
Data: 2026-06-07

## Finalidade

Permitir que Charlie Echo solicite salvamento controlado de documentos no Google Drive por meio de backend autenticado, sem receber senha, token, chave privada ou acesso irrestrito ao Drive.

## Regra central

Charlie Echo solicita.

Backend autenticado executa.

Charlie Fox constroi a ponte.

Fundador autoriza.

Documento juridico sensivel exige revisao humana.

Cofre nao recebe salvamento automatico pelo MVP. A classificacao `COFRE_NAO_AUTOMATICO` deve retornar bloqueio, exigir procedimento proprio e manter o Fundador junto para qualquer acao material.

## Cartorio Digital

Pasta-mae:

`JUS 9 TECNOLOGIA JURIDICA — CARTORIO DIGITAL CHARLIE ECHO`

Rotas:

- `PUBLICO` -> `01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS`
- `INTERNO` -> `02_DOCUMENTOS_INTERNOS_JUS9`
- `JURIDICO_SIGILOSO` -> `00_ENTRADA_PARA_REVISAO_HUMANA`
- `COFRE_NAO_AUTOMATICO` -> bloqueio explicito, sem criacao automatica

## Cofre

`04_COFRE_NAO_AUTOMATICO` e reservado ao Fundador quanto a edicao, exclusao e decisao final.

Charlie Fox e Charlie Echo podem ler por autorizacao do Fundador.

Automacao comum nao deve criar, editar, excluir, mover, sobrescrever, limpar ou publicar conteudo de cofre.

Historico: a versao v1.0 admitia deposito novo governado no cofre. A versao v1.1 substitui essa permissao por bloqueio automatico completo, conforme a regra operacional vigente do Cartorio Digital.

## Propriedades seguras do Apps Script

O `Code.gs` publico nao deve registrar `CHAVE_INTERNA` nem IDs de pasta do Drive.

Configurar no Apps Script, em Project Settings -> Script Properties:

- `CHAVE_INTERNA`
- `JUS9_FOLDER_ENTRADA_REVISAO`
- `JUS9_FOLDER_PUBLICO`
- `JUS9_FOLDER_INTERNO`

Esses valores nao devem ser publicados no GitHub, Drive publico, prints ou chat.

## Limites

Nao usar usuario e senha em chat.

Nao publicar token, chave, `.env`, backup code ou link de edicao aberto.

Nao publicar IDs de pasta do Cartorio Digital em documentacao publica quando puderem ficar nas Script Properties.

Nao permitir exclusao automatica.

Nao permitir sobrescrita automatica.

Nao salvar documento juridico real como definitivo sem revisao humana.
