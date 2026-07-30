# Versionamento — Correção de dependências npm

Data: 29 de julho de 2026  
Classificação: PÚBLICO / SEGURANÇA / SEM SEGREDOS

## Auditoria autorizada

O Fundador autorizou o envio dos metadados de dependências ao registro npm.

Resultado inicial:

- 2 vulnerabilidades altas;
- 1 vulnerabilidade baixa;
- 0 críticas.

Pacotes envolvidos: `axios`, `form-data` e `body-parser`.

## Correção

Executado `npm audit fix --omit=dev`, sem `--force`.

Versões resolvidas:

- `axios` 1.19.0;
- `form-data` 4.0.6;
- `express` 4.22.2;
- `body-parser` 1.20.6.

## Verificação

- `npm audit --omit=dev`: 0 vulnerabilidades;
- bateria: 70 testes aprovados, 0 falhas;
- nenhum segredo alterado ou publicado.
