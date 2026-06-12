# Versionamento - Cofre Depósito Assistido WhatsApp v1.4

Classificação: PÚBLICO / ORIENTAÇÃO OPERACIONAL SANITIZADA
Repositório: charlieecho-jus9-tecnologia-juridica
Instituição: Jus 9 Tecnologia Jurídica

## Objetivo

Ensinar a Charlie Echo a usar o cofre secreto apenas como depósito assistido write-only, sem leitura, listagem, edição, exclusão, sobrescrita ou modificação de conteúdo existente.

## Decisão de governança

- `COFRE_NAO_AUTOMATICO` continua bloqueado.
- Nova rota permitida: `COFRE_DEPOSITO_ASSISTIDO`.
- A rota só cria documento novo.
- A pasta real fica em Script Property: `JUS9_FOLDER_COFRE_DEPOSITO`.
- A triagem WhatsApp só usará essa rota se o Render estiver configurado com `JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO=COFRE_DEPOSITO_ASSISTIDO`.

## Conversa WhatsApp

A triagem também foi melhorada para:

- reconhecer continuidade depois de dados mínimos recebidos;
- responder se o usuário pergunta se é novo atendimento ou continuação;
- acolher angústia com próximos passos práticos;
- evitar pedir o mesmo formulário depois que o caso já está pronto para atendimento humano.

## Segurança

- Não foram publicados URL do Apps Script, chave interna, ID de pasta ou segredo.
- Logs continuam mascarando identificador de WhatsApp.
- A Charlie Echo continua sem permissão para ler, apagar ou modificar cofre.
- A análise jurídica permanece dependente de revisão humana qualificada.

## Próximo passo operacional

Atualizar o `Code.gs` no Apps Script, configurar `JUS9_FOLDER_COFRE_DEPOSITO` nas Script Properties e, se desejado, configurar no Render:

```txt
JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO=COFRE_DEPOSITO_ASSISTIDO
```
