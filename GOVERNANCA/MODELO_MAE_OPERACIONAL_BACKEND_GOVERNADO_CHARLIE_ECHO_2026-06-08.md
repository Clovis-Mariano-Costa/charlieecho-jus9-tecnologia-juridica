# Modelo-mae operacional - Backend governado Charlie Echo

Classificacao: INTERNO / LEI OPERACIONAL / PROTOCOLO / SEM SEGREDOS
Registrado em: 2026-06-08 00:09:37.28174

## Finalidade

Criar um padrao replicavel para todos os MVPs e modulos da Charlie Echo, preservando a identidade visual, a paleta, o aroma e a essencia de cada ambiente.

Este modelo nao altera governanca primeva, Constituicao, DNA, principios ou prioritario. Ele organiza camada operacional, backend, resposta publica, seguranca e UI.

## Camadas

1. Camada publica: aviso de MVP, demonstracao e recomendacao de nao usar dados reais.
2. Camada de acesso: entrar com Google, conta de demonstracao e perfis futuros.
3. Camada de classificacao: PUBLICO, INTERNO, JURIDICO_SIGILOSO, COFRE_NAO_AUTOMATICO e classificacao desconhecida.
4. Camada de mini backend: Drive Saver MVP, agenda futura, auditoria e fila de revisao humana.
5. Camada de resposta: texto limpo, objetivo e adaptado ao modulo.
6. Camada de UI: menu lateral, salas, botoes essenciais e links semanticos.
7. Camada de governanca: leis e protocolos operacionais atualizados conforme cada modulo.

## Regra publica do MVP

O publico deve ver aviso simples:

> Ambiente MVP demonstrativo. Use dados ficticios. Nao envie dados reais, documentos sigilosos, senhas, tokens ou informacoes sensiveis.

O publico nao precisa ver detalhes internos de seguranca, arquitetura, chaves, IDs, propriedades, rotas privadas ou cofre.

## Regra interna para dados reais

A Jus 9 pode se preparar para dados reais, mas so deve liberar uso real por modulo quando houver:

- login real;
- perfis e permissoes;
- classificacao obrigatoria;
- auditoria;
- revisao humana quando cabivel;
- backend autenticado;
- segredo fora do frontend;
- logs sem conteudo sensivel desnecessario;
- procedimento de cofre separado.

## Regra fixa do Drive Saver

- PUBLICO -> `01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS` -> `revisaoHumanaObrigatoria = false`.
- INTERNO -> `02_DOCUMENTOS_INTERNOS_JUS9` -> `revisaoHumanaObrigatoria = false`.
- JURIDICO_SIGILOSO -> `00_ENTRADA_PARA_REVISAO_HUMANA` -> `revisaoHumanaObrigatoria = true`.
- COFRE_NAO_AUTOMATICO -> `BLOQUEADO`, sem salvamento automatico.
- Classificacao desconhecida -> `00_ENTRADA_PARA_REVISAO_HUMANA` -> `revisaoHumanaObrigatoria = true`.

Charlie Echo nunca deve pedir nem revelar `CHAVE_INTERNA`, URL ativa do Web App, IDs privados de pastas, tokens, senhas, `.env` ou credenciais.

## Padrao de resposta da Charlie Echo

Charlie Echo deve saber muito e dizer pouco.

Resposta publica padrao:

- comecar pela resposta util;
- usar listas curtas;
- evitar apresentacao repetida;
- evitar `Escuta`, `Sentire`, `Leitura do pedido` e `Caminho escolhido` quando nao forem necessarios;
- evitar excesso de `**`;
- mostrar alertas apenas quando houver risco, dado sensivel, cofre, segredo, uso juridico real ou pedido de metodo;
- adaptar tom ao modulo.

## Personalidade por modulo

- IA Profissional / DAJ: jurista prudente, objetiva, tecnica e orientada a revisao humana quando cabivel.
- Professora / DAA: didatica, clara, paciente, com exemplos.
- Estudantes / DEJ: educativa, leve e organizada.
- Social / DIC: acolhedora, simples, protetiva e encaminhadora.
- Perito / DPJ: tecnico, estruturado e cauteloso com prova.
- Autoridades / DMG, DMP, DAP: cautela maxima, sem simular ato oficial.
- Investidores / DIP: institucional, transparente e sem promessa financeira indevida.

## Padrao visual

Preservar a paleta e a identidade de cada MVP. Melhorar sem descaracterizar.

Preferir:

- menu lateral consistente;
- botoes essenciais visiveis;
- comandos secundarios em menu ou painel;
- links semanticos quando houver destino confiavel;
- aviso MVP discreto e claro;
- tela de chat limpa;
- menos botoes soltos dentro da sala.

## Entrar com Google

Preparar o padrao pensando em usuarios reais e conta de demonstracao para evento.

Enquanto o login real nao estiver validado:

- nao prometer protecao de producao;
- nao bloquear demos publicas que ainda precisam estar abertas;
- manter telas simuladas claramente como demonstrativas;
- separar ambiente de pre-cadastro do lider, demonstracao publica e futuro acesso autenticado.

## Proximo passo

Aplicar primeiro em `app-ia-profissional.html` / IA Profissional, depois replicar aos demais MVPs e modulos preservando o aroma de cada ambiente.
