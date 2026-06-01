# Charlie Echo - cenarios ficticios sem dados reais

Data: 2026-06-01

## Objetivo

Garantir que pedidos publicos de treinamento, demonstracao ou uso ficticio recebam uma orientacao explicita para nao informar dados reais.

## Alteracao

- A API publica identifica pedidos ficticios, demonstrativos ou de treinamento.
- Quando necessario, acrescenta um aviso obrigatorio para usar somente dados ficticios.
- O aviso proibe dados pessoais reais, processos reais, documentos sigilosos, senhas, tokens e segredos.
- Qualquer uso real permanece sujeito a revisao humana.

## Validacao

O teste de regressao publica verifica a presenca dessa protecao no handler da API.
