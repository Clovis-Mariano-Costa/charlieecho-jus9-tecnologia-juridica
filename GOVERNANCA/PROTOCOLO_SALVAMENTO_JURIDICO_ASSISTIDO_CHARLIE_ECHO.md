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

Cofre pode receber arquivo novo quando o Fundador autorizar leitura e deposito, mas edicao, exclusao e sobrescrita continuam proibidas sem o Fundador junto.

## Cartorio Digital

Pasta-mae:

`JUS 9 TECNOLOGIA JURIDICA — CARTORIO DIGITAL CHARLIE ECHO`

Rotas:

- `PUBLICO` -> `01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS`
- `INTERNO` -> `02_DOCUMENTOS_INTERNOS_JUS9`
- `JURIDICO_SIGILOSO` -> `00_ENTRADA_PARA_REVISAO_HUMANA`
- `COFRE_NAO_AUTOMATICO` -> `04_COFRE_NAO_AUTOMATICO`, criando apenas arquivo novo, com revisao humana obrigatoria

## Cofre

`04_COFRE_NAO_AUTOMATICO` e reservado ao Fundador quanto a edicao, exclusao e decisao final.

Charlie Fox e Charlie Echo podem ler por autorizacao do Fundador.

Automacao comum pode criar arquivo novo no cofre quando a classificacao for `COFRE_NAO_AUTOMATICO`, mas nao deve editar, excluir, mover, sobrescrever ou limpar conteudo de cofre.

## Limites

Nao usar usuario e senha em chat.

Nao publicar token, chave, `.env`, backup code ou link de edicao aberto.

Nao permitir exclusao automatica.

Nao permitir sobrescrita automatica.

Nao salvar documento juridico real como definitivo sem revisao humana.
