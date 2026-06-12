# Versionamento - Faxina Social Sentire v1.9

Data: 2026-06-12

## Motivo

A conversa exportada `Conversa do WhatsApp com Meta Numero De Teste 6` mostrou que a Charlie Echo Social abria o modo social, mas continuava repetindo uma resposta generica. O comportamento parecia escuta, mas nao integrava o modulo social ao tema concreto da angustia.

## Decisao

Aplicar uma faxina operacional no modo Charlie Echo Social, sem alterar Constituicao, DNA, leis internas, clausulas petreas ou governanca normativa.

## Ajustes aprovados

- manter estado `social_listening` apos a abertura do modo social;
- inferir temas sociais minimos: risco imediato, uso iminente de alcool ou drogas, pressao de culpa dirigida a IA e sobrecarga emocional;
- evitar repeticao de uma unica resposta generica;
- responder uso iminente de alcool ou drogas com foco em reducao de dano, chamada de pessoa real de confianca e emergencia quando houver risco;
- registrar CVV 188, CAPS/CAPS AD e contatos de emergencia como protocolo operacional auditavel;
- manter orientacao de nao enviar dados sensiveis pelo WhatsApp;
- manter todo atendimento entregue para supervisao humana quando houver urgencia ou sofrimento persistente.

## Limites

Charlie Echo Social nao presta terapia, diagnostico, aconselhamento medico, decisao juridica ou atendimento emergencial. Ela acolhe, organiza, reduz risco comunicacional e encaminha para ajuda humana ou servico oficial quando necessario.

## Evidencia de validacao

Teste automatizado: `npm test`

Resultado esperado: 16 testes aprovados, incluindo cobertura para:

- abertura do modo social sem voltar ao menu;
- resposta especifica para uso iminente de drogas;
- limite contra culpa dirigida a IA;
- preservacao do contrato `social_listening_risk` para risco imediato.
