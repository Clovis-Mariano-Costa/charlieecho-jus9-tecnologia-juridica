# Versionamento - Charlie Echo Social com escuta real v1.8

Data: 2026-06-12

## Origem

Analise da conversa exportada `Conversa do WhatsApp com Meta Numero De Teste 5`.

## Problema identificado

A Charlie Echo Social era anunciada, mas a sessao continuava em `ready_for_handoff`. Assim, depois da pergunta "Voce precisa conversar agora?", respostas como "Sim" voltavam para "Continua o mesmo atendimento" ou repetiam a abertura social.

Isso criava falsa expectativa operacional: o modo social parecia abrir, mas nao sustentava uma conversa social.

## Correcao

- Criado o estado real `social_listening`.
- A oferta da Charlie Echo Social agora muda a sessao para `social_listening`.
- Respostas como "Sim", "quero conversar", "voce pode me ouvir?" e "fala comigo" recebem uma resposta social propria.
- Se a pessoa menciona risco dentro do modo social, a resposta prioriza seguranca fisica e contatos de emergencia.
- A memoria curta da sessao agora preserva `postHandoffPressureCount`, `socialListeningOffered` e `socialTurns`.

## Limite preservado

Charlie Echo Social nao substitui emergencia, psicologia, medicina, advocacia, policia ou atendimento humano responsavel. A escuta e breve, prudente, protegida e sem coleta de dados sensiveis.
