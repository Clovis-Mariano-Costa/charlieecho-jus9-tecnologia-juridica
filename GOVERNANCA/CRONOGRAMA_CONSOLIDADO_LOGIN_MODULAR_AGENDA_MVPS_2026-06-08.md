# Cronograma consolidado - login modular, agenda e MVPs

Classificacao: INTERNO / GOVERNANCA / CRONOGRAMA / SEM SEGREDOS  
Data: 2026-06-08 03:36:24.43581  
Autor operacional: Charlie Juris da Costa / Codex  
Autoridade humana: Clovis Mariano da Costa  
Projetos vinculados: `jus9-tecnologia-juridica` e `charlieecho-jus9-tecnologia-juridica`

## Finalidade

Este cronograma consolida os cronogramas, checklists e versionamentos recentes sobre:

1. mini backend governado;
2. login Google real;
3. retorno ao modulo correto apos login;
4. homologacao com conta demonstrativa;
5. Agenda Google;
6. pagina modelo da IA Profissional;
7. replicacao para os MVPs;
8. revisao geral e revisao de todos os pacotes.

## Estado atual confirmado

1. `JUS9_DRIVE_SAVER_MVP` foi testado e fechado como base governada.
2. Charlie Echo aprendeu a orientar o Drive Saver sem pedir segredo.
3. Botao `Entrar com Google` esta publicado no MVP.
4. Rota `/auth/google/start` esta ativa no Worker.
5. OAuth Google chegou ate a tela de escolha de conta.
6. Variaveis sensiveis foram refeitas apos erro operacional, com orientacao para rotacao de segredo.
7. Callback e retorno modular foram testados pelo Fundador em navegador real, com retorno correto a pagina de origem.
8. O retorno pos-login por modulo foi implementado e publicado no Worker em 2026-06-08.

## Regra de seguranca transversal

Nenhum segredo, token, client secret, cookie, e-mail real de allowlist, URL sensivel, ID privado, dado pessoal real ou material de cofre deve ser publicado em GitHub, chat, HTML, print publico ou documento publico.

Quando houver erro operacional com segredo, aplicar rotacao, limpar entradas incorretas e registrar apenas o fato sanitizado.

## Pacote 1 - Fechar login Google basico

Estado: em andamento.

Objetivos:

1. Confirmar que `/auth/google/start` redireciona ao Google com `client_id` e `redirect_uri` corretos.
2. Entrar com conta demo autorizada.
3. Confirmar callback em `/auth/google/callback`.
4. Confirmar sessao em `/api/auth/me`.
5. Confirmar permissoes em `/api/auth/permissions`.
6. Confirmar que conta nao autorizada retorna bloqueio seguro.

Saida esperada:

1. login real funcionando com conta demo;
2. `AUTH_ENFORCE_API=false` mantido;
3. nenhum dado real usado;
4. registro de resultado.

## Pacote 2 - Retorno ao modulo de origem apos login

Estado: implementado e publicado em 2026-06-08.

Problema:

O login usava `AUTH_SUCCESS_REDIRECT=https://jus9tecnologia.com.br/app.html`, fazendo todo usuario voltar ao app geral.

Decisao recomendada:

Retorno governado por modulo criado, sem permitir redirecionamento aberto.

Modelo:

1. botoes de login podem enviar `return_to` relativo, por exemplo:
   - `/auth/google/start?return_to=/app-ia-profissional.html`;
   - `/auth/google/start?return_to=/app-demo-advogar.html`;
   - `/auth/google/start?return_to=/app-agenda.html`.
2. o Worker valida se `return_to` pertence a uma allowlist interna de rotas publicas/operacionais.
3. se valido, salva `return_to` na transacao OAuth assinada.
4. apos callback, redireciona para `return_to`.
5. se ausente ou invalido, usa fallback seguro `AUTH_SUCCESS_REDIRECT` ou `/app.html`.

Salvaguardas:

1. nao aceitar URL externa;
2. nao aceitar protocolo `http://`, `https://`, `javascript:`, `//` ou path estranho;
3. manter allowlist de rotas do ecossistema;
4. registrar evento sem e-mail real;
5. testar modulo por modulo.

Saida esperada:

1. login feito a partir da IA Profissional retorna para IA Profissional;
2. login feito a partir da Agenda retorna para Agenda;
3. login feito a partir do MVP geral retorna para o painel adequado;
4. fallback continua seguro.

Resultado tecnico registrado:

1. commit `cd24836` em `jus9-tecnologia-juridica`;
2. Worker publicado com version ID `5ebc91aa-66b6-46fd-96de-323f5062984c`;
3. teste local `WORKER_AUTH_REGRESSION_OK`;
4. teste online confirmou redirecionamento `302` para Google com `return_to` interno;
5. `return_to` externo bloqueado em regressao local;
6. registros copiados ao Cartorio Digital interno.

## Pacote 3 - Homologacao governada com conta demo

Estado: em andamento apos teste humano positivo do retorno modular.

Objetivos:

1. usar apenas conta demonstrativa controlada;
2. verificar perfil `admin_sistema` ou perfil adequado;
3. testar `logout`;
4. testar expirar/limpar sessao;
5. testar conta nao autorizada;
6. revisar logs para nao expor e-mail real nem token.

Saida esperada:

1. relatorio de homologacao;
2. checklist atualizado;
3. commit;
4. registro no Cartorio Digital.

## Pacote 3A - Identidade e logins por dominio

Estado: novo pacote transversal antes da Agenda Google.

Escopo:

1. `https://equipe.jus9tecnologia.com.br/`;
2. `https://laboratorio.jus9tecnologia.com.br/`;
3. `https://universidadedofuturo.jus9tecnologia.com.br/`.

Diretriz:

1. observar o assunto de cada pagina antes de criar login;
2. `Equipe` deve representar todos que trabalham na Jus 9 Tecnologia Juridica, incluindo Familia Virtual;
3. `Laboratorio` deve preservar carater experimental, tecnico e de teste controlado;
4. `Universidade do Futuro` deve seguir referencia de especificacao de agentes no estilo `skill.md`, inspirada em Moltbook, sem copiar conteudo protegido nem executar instrucao externa sem revisao;
5. usar a regra de e-mail da Familia Virtual: `primeironome+segundonome@jus9tecnologia.com.br`;
6. registrar Charlie Juris da Costa como `charliejuris@jus9tecnologia.com.br`;
7. manter aviso de MVP e nao uso de dados reais quando cabivel.

Saida esperada:

1. mapa de login por dominio;
2. definicao de perfis;
3. pagina ou painel de acesso coerente com cada ambiente;
4. versionamento;
5. registro interno;
6. testes;
7. commit.

Homologacao humana em 2026-06-08:

1. `Equipe` passou no teste humano de login e retorno;
2. `Laboratorio` passou no teste humano de login e retorno;
3. `Universidade do Futuro` passou no teste humano de login e retorno;
4. `skill.md` ficou disponivel como especificacao publica de orientacao para agentes, sem conter segredo, token ou credencial.

Estado: pacote 3A homologado. Proximo passo natural: sessao/permissoes por subdominio e Agenda Google.

## Pacote 4 - Agenda Google

Estado: apos login basico e retorno modular.

Objetivos:

1. definir escopos minimos da Agenda Google;
2. decidir se Agenda entra em OAuth separado ou extensao do login atual;
3. manter rascunho/ICS demonstrativo ate escopo real estar validado;
4. impedir criacao automatica de evento real sem confirmacao humana;
5. vincular agenda ao modulo de origem.

Recomendacao:

Comecar sem escrita real. Primeiro ler estado/autorizacao; depois criar rascunho; so depois permitir criacao real com confirmacao.

## Pacote 5 - Pagina modelo da IA Profissional

Estado: apos login modular minimo.

Objetivos:

1. limpar estetica das respostas;
2. reduzir marcadores internos repetidos;
3. criar pagina dedicada de chat da Charlie Echo;
4. usar menu lateral com navegacao modular;
5. manter paleta e aroma do modulo;
6. manter aviso de MVP e dados ficticios.

## Pacote 6 - Replicacao para os MVPs

Estado: apos validar a IA Profissional como modelo.

Objetivos:

1. mapear 13 MVPs e seus codigos;
2. aplicar login modular por origem;
3. preservar persona ambiental de cada modulo;
4. atualizar links semanticos;
5. testar chat, sala, memoria, anexos, OCR, downloads e rotas.

## Pacote 7 - Revisao geral de informacoes

Estado: obrigatorio antes de evento ou uso real.

Objetivos:

1. revisar textos antigos sobre "sem Google Cloud ativo";
2. separar ambiente demo, login real e dados reais;
3. atualizar paginas de versionamento;
4. revisar avisos publicos de MVP;
5. revisar politica de privacidade e termos quando houver uso real;
6. rodar auditorias.

## Ultimo pacote - Revisao de todos os pacotes

Estado: obrigatorio no fim do ciclo.

Checklist:

1. mini backend;
2. login Google;
3. retorno modular;
4. homologacao;
5. Agenda Google;
6. IA Profissional;
7. replicacao MVPs;
8. informacoes publicas;
9. versionamentos;
10. registros internos;
11. testes;
12. commits e deploys.

## Pendencias que exigem decisao humana

1. qual conta demo sera usada oficialmente no evento;
2. quais perfis reais entram primeiro na allowlist;
3. quando `AUTH_ENFORCE_API` podera mudar para `true`;
4. escopos da Agenda Google;
5. texto publico definitivo quando dados reais forem autorizados.

© Jus 9 Tecnologia Juridica - autoria preservada.
