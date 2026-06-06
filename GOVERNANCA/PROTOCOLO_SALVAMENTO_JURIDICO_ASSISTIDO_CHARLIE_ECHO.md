# Protocolo de Salvamento Juridico Assistido - Charlie Echo

Classificacao: GOVERNANCA / PROTOCOLO / DRIVE SAVER MVP
Versao: v1.0
Data: 2026-06-06

## Finalidade

Permitir que Charlie Echo solicite salvamento controlado de documentos no Google Drive por meio de backend autenticado, sem receber senha, token, chave privada ou acesso irrestrito ao Drive.

## Regra central

Charlie Echo solicita.

Backend autenticado executa.

Charlie Fox constroi a ponte.

Fundador autoriza.

Documento juridico sensivel exige revisao humana.

Cofre nao entra na automacao comum.

## Cartorio Digital

Pasta-mae:

`JUS 9 TECNOLOGIA JURIDICA — CARTORIO DIGITAL CHARLIE ECHO`

Rotas:

- `PUBLICO` -> `01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS`
- `INTERNO` -> `02_DOCUMENTOS_INTERNOS_JUS9`
- `JURIDICO_SIGILOSO` -> `00_ENTRADA_PARA_REVISAO_HUMANA`
- `COFRE_NAO_AUTOMATICO` -> bloqueado; revisao humana e procedimento proprio

## Cofre

`04_COFRE_NAO_AUTOMATICO` e reservado ao Fundador.

Automacao comum nao deve salvar, editar, excluir, mover ou listar conteudo de cofre.

Se for necessario depositar algo relacionado ao cofre sem abrir o cofre, usar `00_ENTRADA_PARA_REVISAO_HUMANA` com alerta de cofre e revisao humana obrigatoria.

## Limites

Nao usar usuario e senha em chat.

Nao publicar token, chave, `.env`, backup code ou link de edicao aberto.

Nao permitir exclusao automatica.

Nao permitir sobrescrita automatica.

Nao salvar documento juridico real como definitivo sem revisao humana.

