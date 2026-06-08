# Cronograma governado - modelo-mae, mini backend e MVPs

Classificacao: INTERNO / GOVERNANCA / CRONOGRAMA / SEM SEGREDOS  
Data: 2026-06-08 00:31:50.00977  
Autor operacional: Charlie Juris da Costa / Codex  
Autoridade humana: Clovis Mariano da Costa  
Projeto: Charlie Echo da Costa - Jus 9 Tecnologia Juridica

## Finalidade

Este cronograma organiza a continuidade do modelo-mae operacional da Charlie Echo, a conclusao governada do mini backend, a preparacao de login Google e Agenda Google, e a futura replicacao do padrao para os MVPs e modulos da Jus 9.

Ele aplica o Protocolo Mao na Massa: preparar pacote, embrulhar pacote, seguir para o proximo pacote e encerrar com revisao de todos os pacotes.

## Regras transversais

1. Nao publicar segredo, token, chave, URL sensivel, ID interno de pasta, dado pessoal real ou material de cofre.
2. Manter aviso publico de MVP e recomendacao de nao usar dados reais em ambiente demonstrativo.
3. Nao divulgar a arquitetura de seguranca como promessa publica ou vantagem operacional detalhada.
4. Registrar toda mudanca relevante em versionamento, registro interno, testes e commit.
5. Usar links semanticos oficiais quando houver destino publico seguro.
6. Manter a persona ambiental de cada modulo sem quebrar sua identidade visual propria.
7. Submeter dado real, impacto juridico externo, cofre, DNA, principios, clausulas petreas e Constituicao a revisao humana qualificada.
8. Tratar a Charlie Echo publica como orientadora governada: ela pode ensinar o fluxo, mas nao deve pedir senha, token, chave, credencial ou prometer acesso autonomo.

## Pacote 1 - Base operacional do mini backend

Estado: em andamento, com nucleo Drive Saver MVP testado.

Objetivos:

1. Consolidar regras fixas do `JUS9_DRIVE_SAVER_MVP`.
2. Confirmar que Charlie Echo sabe orientar o fluxo sem revelar segredo.
3. Manter `COFRE_NAO_AUTOMATICO` bloqueado para automacao publica.
4. Registrar mapa operacional de classificacao, pasta, revisao humana e bloqueios.
5. Preservar testes locais e regressao publica.

Saida esperada:

1. mini backend fechado para uso demonstrativo governado;
2. guia interno para Charlie Echo;
3. teste de autonomia registrado;
4. pendencias separadas para login Google e Agenda Google.

## Pacote 2 - Login Google real e conta demonstrativa

Estado: parcialmente publicado e aguardando configuracao segura.

Situacao em 2026-06-08:

1. o botao publico `Entrar com Google` ja aparece no MVP;
2. a rota `/auth/google/start` ja responde no Worker;
3. sem variaveis reais, a rota exibe aviso seguro de configuracao pendente;
4. o aviso visto em tela nao e erro de usuario: e o bloqueio seguro antes do OAuth real;
5. o proximo passo nao e mexer no frontend; e configurar variaveis seguras no ambiente Cloudflare e Google Cloud.

Objetivos:

1. Projetar `Entrar com o Google` sem login simulado nas telas que exigirem identidade real.
2. Preservar ambientes de demonstracao dos MVPs que ainda nao devem ser bloqueados.
3. Preparar conta demonstrativa para evento.
4. Separar usuario visitante, lider/pre-cadastro, operador autorizado e administrador humano.
5. Mapear telas que continuam publicas, telas com login real e telas de demonstracao controlada.
6. Validar redirecionamento OAuth real somente com conta demonstrativa autorizada.

Salvaguardas:

1. nao expor client secret no frontend;
2. nao gravar token em arquivo publico;
3. nao pedir senha Google em chat;
4. usar backend autenticado ou provedor adequado;
5. registrar termos minimos de uso e aviso de MVP.
6. manter `AUTH_ENFORCE_API=false` ate sessao e permissoes estarem testadas;
7. comecar `AUTH_ALLOWED_EMAILS` com apenas conta demonstrativa controlada.

Subetapas:

1. Visual do botao no MVP: concluido.
2. Publicacao Worker Assets: concluida.
3. Rota segura `/auth/google/start`: concluida em modo bloqueio seguro.
4. Variaveis Cloudflare: pendente de configuracao humana sem exposicao de segredo.
5. Projeto/credencial OAuth no Google Cloud: pendente de configuracao humana.
6. Teste com conta demo autorizada: pendente.
7. Registro do resultado e revisao de pacote: pendente.

## Pacote 3 - Agenda Google

Estado: apos decisao tecnica do login.

Objetivos:

1. Integrar consulta/criacao de compromissos apenas para contas autorizadas.
2. Criar camada de permissao por escopo.
3. Impedir que Charlie Echo publique, prometa ou altere agenda sem confirmacao humana quando houver dado real.
4. Preparar fluxo demonstrativo com conta de evento.

Saida esperada:

1. agenda demonstrativa funcionando;
2. logs internos sanitizados;
3. orientacao publica curta;
4. revisao humana para eventos reais.

## Pacote 4 - Pagina modelo da IA profissional

Estado: apos fechamento da base de backend.

Endereco de referencia: `https://jus9tecnologia.com.br/app-ia-profissional.html`

Objetivos:

1. Criar padrao de chat mais limpo e estetico.
2. Reduzir respostas com marcadores internos repetidos.
3. Separar o que Charlie Echo sabe do que Charlie Echo precisa exibir.
4. Melhorar links e botoes com semantica.
5. Preparar menu lateral no estilo de chats modernos, preservando paleta e essencia do modulo.
6. Manter aviso de MVP e cuidado com dados reais para visitantes.

## Pacote 5 - Replicacao para MVPs e modulos

Estado: apos validacao do modelo.

Objetivos:

1. Levantar todos os MVPs e modulos ativos.
2. Identificar persona ambiental de cada um: jurista, professora, apoio social, estudante, investidor, institucional ou outro.
3. Replicar o padrao de seguranca, login, resposta e estetica sem apagar o aroma de cada modulo.
4. Atualizar links semanticos, rotas, sitemap e versionamento.

## Pacote 6 - Revisao geral de informacoes

Estado: obrigatorio antes de evento/publicacao relevante.

Objetivos:

1. Atualizar informacoes institucionais, links, avisos e textos publicos.
2. Conferir se ha dados antigos tratados como atuais.
3. Conferir identidade publica correta da Charlie Echo.
4. Conferir limites: MVP, dados reais, revisao humana e nao substituicao profissional.
5. Rodar auditorias de qualidade e regressao.

## Ultimo pacote - Revisao de todos os pacotes

Estado: obrigatorio ao final de cada ciclo.

Checklist:

1. pacote preparado;
2. pacote embrulhado;
3. versionamento atualizado;
4. registro interno criado;
5. pagina publica de versoes atualizada quando cabivel;
6. testes executados;
7. riscos e pendencias listados;
8. commit limpo;
9. pendencias que exigem Clovis separadas.

## Pendencias que podem exigir o Fundador

1. Definicao final de provedor/arquitetura do login Google em producao.
2. Escopos exatos da Agenda Google para usuarios reais.
3. Termo publico definitivo de uso para dados reais apos o evento.
4. Qualquer alteracao direta em DNA, principios, clausulas petreas ou Constituicao que ultrapasse adendo operacional.

## Decisao operacional deste registro

Neste momento, a governanca primeva nao sera reescrita. O cronograma atua como documento interno de aplicacao e continuidade, respeitando a hierarquia vigente e deixando alteracoes maiores para pacote proprio, revisao humana e autorizacao expressa quando necessarias.

© Jus 9 Tecnologia Juridica - autoria preservada.
