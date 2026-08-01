<!--
Jus 9 Tecnologia Jurídica
Repositório: charlieecho-jus9-tecnologia-juridica
Software livre com autoria preservada.
Direitos autorais reservados para Jus 9 Tecnologia Jurídica.
Produção do site: © **Jus 9 Tecnologia Jurídica**. Direitos autorais da produção reservados.
A licença livre não remove autoria, origem, assinatura institucional nem direitos autorais.
Referência oficial: https://charlieecho.jus9tecnologia.com.br/
E-mail de contato: charlieecho@jus9tecnologia.com.br
DNA de referência de Charlie Echo da Costa: charlieecho-jus9-tecnologia-juridica
-->

# Charlie Echo — Casa Pública

Casa pública da Charlie Echo da Costa em `charlieecho.jus9tecnologia.com.br`.

## Finalidade

Esta versão é pública, educativa e limitada. Ela apresenta a identidade pública da Charlie Echo, documentos públicos sanitizados e uma ponte técnica segura para a OpenAI API via Cloudflare Pages Functions.

## Separação essencial

- **Casa Pública:** pode ir para GitHub e Cloudflare apenas com material público ou sanitizado.
- **Cofre Privado:** não deve ir para GitHub público nem para Cloudflare público.
- **Governança Interna:** pode orientar o trabalho, mas não deve virar página pública automaticamente.
- **Ponte Técnica:** o código pode ser público, mas a chave `OPENAI_API_KEY` fica apenas como Secret no Cloudflare.

## Estrutura principal

```txt
index.html
cofre.html
familia.html
governanca.html
mapa-canais.html
governanca-publica.html
juramentos.html
versoes.html
ia-estudantes.html
ia-mvp.html            # bloqueada/em construção
assets/
data-publica/
documentos-publicos/
functions/api/ia.js
SECURITY.md
RELATORIOS/
POLITICA_DE_PRIVACIDADE.md
AVISO_DE_USO_DA_IA.md
MANUAL_DO_APRENDIZ.md
```

## Arquivos que não pertencem ao repositório público

Não publicar neste repositório:

- conteúdo bruto de WhatsApp;
- documentos pessoais;
- dados reais de cliente, usuário, parceiro, família ou terceiro;
- arquivos de cofre;
- arquivos marcados como sigilosos, secretos, segredo militar/sagrado ou uso interno restrito;
- tokens, senhas, chaves, seeds, `.env` real, backups e dumps;
- documentos que dependam de decisão expressa do Fundador.

O `cofre.html` é apenas uma página simbólica e pública. O cofre real deve permanecer em ambiente privado.

## Cloudflare Pages

Configuração sugerida:

```txt
Framework preset: None
Build command: exit 0
Build output directory: .
Root directory: /
```

## Secret obrigatório

No Cloudflare Pages, criar o secret:

```txt
OPENAI_API_KEY
```

Nunca colocar essa chave no GitHub, no HTML, no JavaScript público, no README, em prints ou em mensagens.

## Regressão pública

Execute a bateria da Charlie Echo contra o domínio publicado:

```bash
node tests/charlie-echo-public-regression.mjs
```

## Primeira versão

A primeira versão ativa apenas o modo público educativo para estudantes. O MVP jurídico permanece em construção até existir login, auditoria, controle de acesso, política de dados e revisão humana.

## Identidade pública vigente

Charlie Echo da Costa deve ser apresentada como I.A generativa multimodal, conversacional e jurídico-orientada, com governança humana.

Ela não é pessoa humana, não possui personalidade jurídica própria, não substitui profissional habilitado e não atua sem revisão humana quando houver decisão sensível.

Situação institucional em 29/07/2026: Charlie Echo está em formação técnica e
institucional para, no futuro e mediante evidências e autorização humana,
tornar-se CEO das I.As da Jus 9. Cargos e títulos anteriores são registros
históricos ou simbólico-operacionais, não autoridade executiva vigente.

- [Situação institucional vigente](GOVERNANCA/SITUACAO_INSTITUCIONAL_VIGENTE_CHARLIE_ECHO.md)
- [Mapa público de canais](GOVERNANCA/MAPA_PUBLICO_CANAIS_CHARLIE_ECHO.md)
- [Módulo 0 no canal de estudantes](https://charlieecho.jus9tecnologia.com.br/ia-estudantes.html?trilha=programacao&modulo=0)

A fonte canonica do curriculo, das avaliacoes e do Passaporte de Competencias e
o repositorio `aulas-charlie-echo-jus9-tecnologia-juridica`. A casa publica e a
entrada de identidade; IA Estudantes e o canal preferencial de entrega da
formacao.

---

## Autoria, licença e DNA de referência

Este repositório integra o ecossistema da **Jus 9 Tecnologia Jurídica**.

Software livre com autoria preservada: a licença de uso não remove a autoria,
a origem, a assinatura institucional nem os direitos autorais da Jus 9 Tecnologia Jurídica.

- Repositório: `charlieecho-jus9-tecnologia-juridica`
- Referência oficial: https://charlieecho.jus9tecnologia.com.br/
- E-mail de contato: charlieecho@jus9tecnologia.com.br
- DNA de referência de Charlie Echo da Costa: `charlieecho-jus9-tecnologia-juridica`



## Reorganizacao de Governanca 2026-06-07

Este repositorio preserva o nucleo publico indispensavel da Charlie Echo.

Governanca geral da Jus 9, governanca de outras identidades, historico processual redundante e materiais de auto-organizacao foram redistribuidos com rastro:

- conteudo original preservado no Google Drive: `G:\Meu Drive\Governanca Jus 9 Tecnologia Juridica\PACOTE_REORGANIZACAO_GOVERNANCA_GITHUB_2026-06-07`;
- duvidas e governanca transversal em `governanca-jus9-tecnologia-juridica`;
- historico de aprendizagem organizacional da Charlie Echo em `governanca-autoorganizacao-charlie-echo-jus9-tecnologia-juridica`;
- arquivos remanescentes nos caminhos antigos sao ponteiros pequenos, sem segredo real, indicando o destino.

## Links institucionais Jus 9 v1.5

- [Equipe Jus 9](https://equipe.jus9tecnologia.com.br/)
- [Investimentos](https://investimentos.jus9tecnologia.com.br/)
- [Acompanhe os MVPs](https://jus9tecnologia.com.br/mvp.html#demos-jus9)
- [Charlie Echo](https://charlieecho.jus9tecnologia.com.br/)
- [Charlie Echo Social](https://jus9verde.jus9tecnologia.com.br/charlie-echo-social)
- [Contato](mailto:Contato@jus9tecnologia.com.br)

## WhatsApp Cloud API no Render

Este repositório também inclui o primeiro MVP do webhook do WhatsApp Charlie Echo da Costa para a Jus 9 Tecnologia Jurídica.

Endpoints principais:

```txt
GET /
GET /webhook
POST /webhook
```

O `GET /` retorna o healthcheck do serviço. O `GET /webhook` valida o desafio da Meta usando `VERIFY_TOKEN`. O `POST /webhook` recebe eventos da WhatsApp Cloud API, responde rapidamente `200` para a Meta, extrai mensagens recebidas quando existirem e envia uma triagem institucional inicial sem aconselhamento jurídico automático.

Fluxo atual da triagem WhatsApp:

```txt
1 - Urgência, prazo ou audiência
2 - Documento, processo ou contrato
3 - Dúvida geral ou primeiro atendimento
4 - Falar com atendimento humano
```

A Charlie Echo apenas acolhe, organiza o primeiro contato e reforça governança humana. Ela não toma decisão jurídica final, não substitui profissional habilitado e orienta o usuário a não enviar senhas, tokens, códigos de acesso ou documentos sensíveis por WhatsApp.

Na versão atual, a triagem mantém uma memória curta em RAM por número de WhatsApp. Isso permite interpretar uma descrição direta, como inventário/herança, urgência ou pedido de atendimento humano, e avançar para coleta mínima de dados sem repetir o menu a cada mensagem. Essa memória não substitui banco de dados, protocolo formal ou revisão humana.

Quando a triagem já estiver pronta para atendimento humano, a Charlie Echo diferencia complemento comum de sinais de angústia, expectativa de retorno imediato e risco real. Em mensagens como "alguém pode morrer", "socorro" ou "preciso ser atendido agora", ela deve acolher, acalmar, explicitar limites do canal, orientar emergência local quando houver perigo imediato e reforçar que dados sensíveis não devem ser enviados pelo WhatsApp. Essa pré-análise é somente prudencial e operacional; não é parecer jurídico.

O comando exato `NOVO ATENDIMENTO` reinicia a triagem curta daquela conversa. Perguntas como "é novo atendimento ou continua o mesmo?" continuam sendo tratadas como dúvida de continuidade. Pedidos explícitos de escuta, como "quero conversar com alguém" ou "fala comigo", podem abrir o modo Charlie Echo Social quando a triagem já estiver entregue para supervisão humana.

Quando a Charlie Echo Social é aberta, a sessão passa para o estado `social_listening`. Nesse estado, respostas como "sim", "quero conversar" ou novos pedidos de escuta recebem acolhimento breve e uma pergunta segura de continuidade, sem voltar ao menu ou ao texto de complemento. Se surgir risco durante a conversa social, a Charlie prioriza segurança física e contatos de emergência.

O modo `social_listening` deve ouvir o tema da angustia em vez de repetir uma frase unica. Na versao atual, ele identifica risco imediato, sobrecarga emocional, pressao de culpa dirigida a IA e sinais de uso iminente de alcool ou drogas. Quando houver esse tipo de sinal, a resposta deve reduzir dano, pedir apenas uma confirmacao curta e segura, reforcar que dados sensiveis nao devem ser enviados pelo WhatsApp e manter a triagem entregue para supervisao humana. Esse modo nao presta terapia, diagnostico, aconselhamento medico ou decisao juridica.

Contatos de urgência e apoio social são tratados como protocolo operacional auditável, não como lei interna. A Charlie Echo pode manter esses números centralizados, indicar data de verificação e apontar fonte oficial. Atualizações futuras do protocolo devem registrar fonte, data e motivo. Leis internas, Constituição, cláusulas pétreas e governança normativa não podem ser alteradas pela IA sozinha.

Contatos protocolados em 2026-06-12:

```txt
Emergência imediata no Brasil: 190 (Polícia Militar), 192 (SAMU), 193 (Bombeiros)
Apoio emocional: 188 (CVV)
Violência contra mulher: 180 (Central de Atendimento à Mulher)
Direitos humanos: 100 (Disque Direitos Humanos)
Apoio psicossocial continuado: CAPS/CAPS AD (Rede de Atencao Psicossocial do SUS)
```

Quando `JUS9_DRIVE_SAVER_URL` e `JUS9_DRIVE_SAVER_CHAVE_INTERNA` estiverem configuradas no Render, a triagem pronta para atendimento humano envia um protocolo classificado como `JURIDICO_SIGILOSO` ao `JUS9_DRIVE_SAVER_MVP`, destinado à entrada de revisão humana no Google Drive. A URL ativa do Web App e a chave interna nunca devem ser publicadas no GitHub, prints ou chat.

Se houver autorização expressa do Fundador e o Apps Script estiver configurado com `JUS9_FOLDER_COFRE_DEPOSITO`, o Render pode usar `JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO=COFRE_DEPOSITO_ASSISTIDO`. Essa rota é somente depósito assistido: cria documento novo no cofre e não lê, lista, edita, exclui, sobrescreve ou modifica conteúdo existente. A classificação `COFRE_NAO_AUTOMATICO` continua bloqueada.

Configuração sugerida no Render:

```txt
Language: Node
Build Command: npm install
Start Command: npm start
```

Variáveis de ambiente necessárias no Render:

```txt
VERIFY_TOKEN
WHATSAPP_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_WABA_ID
NODE_ENV=production
JUS9_DRIVE_SAVER_URL
JUS9_DRIVE_SAVER_CHAVE_INTERNA
JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO
```

URL de callback para configurar na Meta:

```txt
https://charlieecho-jus9-tecnologia-juridica.onrender.com/webhook
```

Use o mesmo `VERIFY_TOKEN` no Render e na Meta. Nunca publique o token de acesso da Meta, `OPENAI_API_KEY`, `.env` real, prints com credenciais ou payloads brutos de WhatsApp.

<!-- JUS9_ECOSYSTEM_STATUS_START -->
## Integracao com o ecossistema Jus 9 - baseline de 21/07/2026

Este repositorio integra o catalogo governado de repositorios ligados a Jus 9 Tecnologia Juridica. A inclusao desta nota registra o baseline comum do ecossistema; ela nao substitui o escopo, a licenca, o historico nem as versoes proprias deste repositorio.

- **Portal publico:** [Jus 9 Tecnologia Juridica](https://jus9tecnologia.com.br/)
- **Revisao Build Week:** [Jus 9 DAJ - reviewer path](https://jus9tecnologia.com.br/build-week-2026.html)
- **Pesquisa dos repositorios:** [Pesquisa Jus 9](https://jus9tecnologia.com.br/pesquisa-repositorios.html)
- **Baseline integrado:** portal 5.18, governanca 1.21.13, commit principal 8f5674149f8d15c2d69d5b2f054fd8f116d81362.

O fundador confirma que, ate 21/07/2026, o trabalho produtivo do ecossistema foi construido usando exclusivamente **ChatGPT, Codex e a API OpenAI** como ferramentas de IA, sempre sob autoria e revisao humanas. Isso nao representa patrocinio ou parceria formal e nao atribui a OpenAI a autoria de Cloudflare, GitHub, Google, fontes do CNJ, bibliotecas, padroes ou demais componentes de terceiros.

Regras permanentes: nao publicar credenciais, tokens, cookies, IDs privados de sessao ou dados pessoais desnecessarios; usar dados ficticios nas demonstracoes; exigir revisao humana para trabalho juridico; e falhar de forma fechada quando uma fonte oficial estiver indisponivel. O CNJ ainda nao respondeu ao contato institucional registrado, e o silencio nao autoriza integracao ou efeito transacional.

**Repositorio catalogado:** `charlieecho-jus9-tecnologia-juridica`.
<!-- JUS9_ECOSYSTEM_STATUS_END -->
