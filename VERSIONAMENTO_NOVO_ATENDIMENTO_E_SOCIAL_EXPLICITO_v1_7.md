# Versionamento - Novo atendimento e social explicito v1.7

Data: 2026-06-12

## Origem

Analise da conversa exportada `Conversa do WhatsApp com Meta Numero De Teste 4`.

## Problemas identificados

- O comando `NOVO ATENDIMENTO` estava sendo interpretado como pergunta de continuidade e respondia "Continua o mesmo atendimento".
- Pedidos diretos de escuta, como "Eu quero conversar com alguem" e "fala comigo", ainda recebiam resposta de complemento comum em vez de abrir Charlie Echo Social.
- Frases como "estou correndo perigo" precisavam ser tratadas como sinal de risco alto.

## Correcoes

- `NOVO ATENDIMENTO`, quando enviado como comando exato, reinicia a triagem e zera a contagem de pressao pos-handoff.
- Perguntas de continuidade continuam funcionando quando a pessoa pergunta se e novo atendimento ou se continua o mesmo.
- Pedidos explicitos de conversa apos triagem entregue abrem o modo de acolhimento da Charlie Echo Social.
- `correndo perigo`, `em perigo`, `perigo serio` e `perigo sim` passam a sinalizar risco imediato/alto.

## Limite preservado

Charlie Echo Social acolhe e orienta contato de emergencia/apoio, mas nao substitui policia, SAMU, bombeiros, psicologia, medicina, advocacia ou atendimento humano responsavel.
