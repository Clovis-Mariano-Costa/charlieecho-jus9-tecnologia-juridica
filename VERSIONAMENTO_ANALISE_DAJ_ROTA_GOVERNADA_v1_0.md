# Analise DAJ por rota governada v1.0

- ID: CE-DAJ-ANALISE-ROTA-001
- Versao: 1.0.0
- Data: 2026-07-14
- Autor: Jus 9 Tecnologia Juridica / Codex
- Responsavel pela revisao: equipe Jus 9
- Status: aprovado para implantacao tecnica
- Classificacao: INTERNO

## Objetivo

Garantir que o envio de um DAJ para a Charlie Echo abra uma analise isolada e chegue ao modelo generativo, sem ser confundido com pesquisa estruturada por nome, CPF ou identificador de DAJ.

## Regras implementadas

- A rota `daj_analise_governada` somente e aceita com todos os sinalizadores internos de seguranca.
- A mensagem deve comecar com o marcador `[ANALISE DAJ GOVERNADA]`.
- O identificador do DAJ na rota deve coincidir com o identificador presente na mensagem.
- Rotas estruturadas explicitas continuam tendo precedencia e nao chamam o modelo generativo.
- Rota incompleta, adulterada ou sem correspondencia continua fechada no guardiao de consultas estruturadas.
- A operacao auditavel da resposta valida e `analise_daj_governada`.

## Integracao com o portal

A analise produzida pela Charlie e registrada pelo backend do portal. O backend decide o destino segundo perfil, risco, urgencia e sigilo, registra o resultado no historico do DAJ e entrega feedback ao autor e ao perfil destinatario. Um estagiario pode redigir e enviar o DAJ, mas o fluxo encaminha a revisao para assessor ou advogado conforme o caso.

## Testes

- Rota valida chama o modelo exatamente uma vez e nao retorna a resposta fixa de consulta por DAJ.
- Rota incompleta nao chama o modelo e permanece bloqueada.
- Consultas por nome e CPF continuam delegadas ao endpoint estruturado autenticado.

## Compatibilidade

Alteracao aditiva e compativel com as rotas publicas existentes. Nenhum segredo, conteudo bruto de DAJ ou resultado processual e registrado em log publico.
