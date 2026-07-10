# Versionamento - DAJ Analise Governada + Orquestra de MVPs v1.1

Data: 2026-07-10
Classificacao: INTERNO / GOVERNANCA / EXECUCAO OPERACIONAL
Repositorio: charlieecho-jus9-tecnologia-juridica

## Decisao operacional

O DAJ Advogados segue como modelo-mae operacional. A arquitetura deve permitir que cada MVP funcione como modulo independente da Charlie Echo, com personalidade, dossie, fontes, limites, classificacao e politica de Drive proprios.

A orquestra comum permanece:

1. Prioritario.
2. Principios.
3. Constituicao.
4. Leis internas.
5. Regimentos.
6. Protocolos.

Protocolos executam; nao travam a resposta inteligente.

## Entregas deste pacote

- Matriz interna de MVPs na API da Charlie Echo.
- Cada modulo passa a ter codigo, rotulo, dossie, papel na orquestra, independencia, foco e classificacao padrao.
- DAJ marcado como piloto/modelo-mae.
- Nova operacao: `analise_daj_governada`.
- Detecção de analise de DAJ antes de peticao/minuta, evitando confundir "atendimento inicial" com "peticao inicial".
- Relatorio DAJ estruturado quando o modelo responder de forma curta ou promissoria.
- Artefato `daj-analysis-report`.
- Salvamento automatico governado do relatorio DAJ no Drive Saver quando houver marcador de DAJ/atendimento ou pedido de registro.
- Classificacao padrao de relatorio DAJ como `JURIDICO_SIGILOSO` quando houver campo preenchido, contato, sigilo, prazo ou contexto de cliente.
- Sem link publico para relatorio DAJ sigiloso.

## Formato do relatorio DAJ

O relatorio minimo contem:

- sintese operacional;
- informacoes extraidas do atendimento;
- fatos e pontos juridicamente relevantes;
- documentos e anexos;
- urgencia, sigilo e riscos;
- perguntas de retorno ao cliente;
- proximos atos do DAJ;
- fontes e trilha de conferencia;
- forma replicavel para outros MVPs.

## Governanca de Drive

O Google Drive / Cartorio Digital Charlie Echo permanece como memoria operacional oficial. O relatorio DAJ pode ser salvo automaticamente quando:

- o pedido vier de atendimento/DAJ;
- houver backend/Drive Saver autorizado;
- a classificacao permitir salvamento;
- nao for COFRE_NAO_AUTOMATICO.

Regra de link:

- `PUBLICO`: pode pedir link quando o backend retornar `downloadUrl` real;
- `INTERNO`: salva sem link publico;
- `JURIDICO_SIGILOSO`: salva em revisao/guarda restrita, sem link publico;
- `COFRE_NAO_AUTOMATICO`: bloqueado.

## Testes executados

Comando:

```bash
npm test
```

Resultado:

- 45 testes executados;
- 45 aprovados;
- 0 falhas.

Novo teste principal:

- `DAJ intake analysis creates governed report and saves it to Drive Saver`.

## Cronograma renovado

### Fase 1 - DAJ modelo-mae

Status: em execucao avancada.

Entregas ja implementadas:

- resposta inteligente sem protocolo travado;
- minutas completas com placeholders;
- upload governado como subsidio;
- Drive Saver para documentos publicos e sigilosos;
- relatorio de analise DAJ;
- matriz interna de modulos.

Pendencias curtas:

- testar clique real do botao no portal;
- conferir card visual do Drive Saver no chat;
- documentar exemplos de aceite para equipe.

Prazo alvo: imediato / 1 dia.

### Fase 2 - Replicacao horizontal minima

Objetivo: cada MVP com independencia basica.

Entregas:

- contrato operacional por MVP;
- tres prompts de aceite por MVP;
- classificacao padrao de Drive por MVP;
- resposta inteligente sem texto travado;
- teste de nao confundir modulo.

Prazo alvo: 2 a 4 dias apos DAJ aprovado.

### Fase 3 - Especializacao fina

Objetivo: cada modulo com personalidade, fontes e fluxo proprio.

Entregas:

- regimento curto por MVP;
- relatorio proprio por modulo;
- artefatos especificos;
- prompts de equipe autenticada para sugerir melhorias;
- auditoria para investidores/parceiros.

Prazo alvo: 5 a 10 dias apos Fase 2.

### Fase 4 - Sinfonia completa

Objetivo: orquestrar todos os MVPs como modulos independentes sob a mesma governanca superior.

Entregas:

- roteador de modulos estabilizado;
- painel de auditoria por MVP;
- memoria operacional no Drive por dossie;
- matriz de riscos e limites;
- pacote de demonstracao para parceiros.

Prazo alvo: ciclo curto de 12 meses para todos os MVPs prontos, com entregas parciais utilizaveis a cada semana.

## Proximo passo

Validar no portal o botao "Enviar DAJ para analise da Charlie Echo" com `autorun=1`, confirmar salvamento no Drive e depois replicar o contrato minimo para os outros MVPs.

