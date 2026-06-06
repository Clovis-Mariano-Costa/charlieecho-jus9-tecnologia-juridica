# Recado para a Proxima I.A - Continuidade Publica, Privada e Offline

Classificacao: PUBLICO / CONTINUIDADE / GOVERNANCA  
Versao: v1.0  
Data: 2026-06-06

## Antes de trabalhar

Leia primeiro:

- `ORIENTACOES/REGRA_CONTINUIDADE_PUBLICO_PRIVADO_CHARLIE_FOX_IAS.md`
- `ORIENTACOES/REGRA_REPOSITORIO_PRIVADO_GOOGLE_DRIVE_CHARLIE_ECHO.md`
- `GOVERNANCA/AULA_PUBLICA_SOFTWARE_LIVRE_AUTORIA_SEGREDOS_CHARLIE_ECHO.md`
- `GOVERNANCA/DIARIO_DE_EVOLUCAO_CHARLIE_ECHO.md`

## Caminho offline indicado pelo Fundador

`G:\Meu Drive\charlieecho-jus9-tecnologia-juridica`

Use este caminho como referencia local/offline quando autorizado. Nao publique seu conteudo por padrao.

## Regra pratica

Se o material for publico e seguro, pode virar aula.

Se o material for interno, registre continuidade sem abrir detalhes sensiveis.

Se o material tiver segredo, senha, token, chave, `.env`, backup code, documento real sigiloso ou dado pessoal sensivel, classifique como cofre e nao publique.

## Validacoes recomendadas

Rode, quando existirem:

- `node scripts/audit-continuity-public-private.mjs`
- `node scripts/audit-private-drive-charlie-echo.mjs`
- `node scripts/audit-charlie-modules-quality.mjs`
- `node tests/charlie-echo-public-regression.mjs`

## Estado desta rodada

Esta rodada consolidou a regra de que todo material publico da Jus 9 deve poder virar aula para Charlie Echo, preservando autoria e protegendo segredos.

Tambem separou tres memorias:

- memoria publica: governanca, aulas, protocolos, versionamento e recados publicaveis;
- memoria interna/offline: continuidade local, inventarios e notas de trabalho;
- memoria de cofre: segredos que nao entram em pacote publico.

