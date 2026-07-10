# Versionamento - Governanca Operacional DAJ + Drive v1.0

Data: 2026-07-10
Classificacao: INTERNO / GOVERNANCA / EXECUCAO OPERACIONAL
Repositorio: charlieecho-jus9-tecnologia-juridica

## Decisao do Fundador

O alvo principal passa a ser a governanca geral da Charlie Echo, aplicada primeiro ao DAJ Advogados. Depois de aprovada no DAJ, a mesma logica deve ser replicada para os demais MVPs e modulos.

Google Drive / Cartorio Digital Charlie Echo passa a ser tratado como memoria operacional oficial para registros, pacotes, salvamentos e auditorias. GitHub permanece como trilha de codigo, versionamento publico/sanitizado e rastreabilidade. O ambiente local e temporario.

Prioridade de execucao:

1. resposta inteligente da Charlie Echo;
2. Drive Saver / miniBackend / memoria operacional;
3. documentacao e auditoria para investidores e parceiros;
4. replicacao para todos os MVPs.

Charlie Echo pode salvar automaticamente documentos, inclusive PDFs, quando a classificacao governada e o Drive Saver/backend permitirem. COFRE_NAO_AUTOMATICO continua bloqueado.

## O que foi implementado

Foi adicionada a camada `GOVERNANCA OPERACIONAL 1.0 - ORQUESTRA CHARLIE ECHO / DAJ` na API publica da Charlie Echo.

A API agora calcula uma decisao de governanca por requisicao, com:

- ordem normativa: Prioritario > Principios > Constituicao > Leis internas > Regimentos > Protocolos;
- MVP alvo;
- identificacao do DAJ como piloto quando cabivel;
- operacao detectada;
- prioridade de resposta inteligente;
- memoria oficial no Google Drive / Cartorio Digital;
- permissao de salvamento automatico e PDF;
- regra de link publico somente com `downloadUrl` real retornado pelo backend.

Essa decisao e enviada ao modelo como contexto operacional e tambem retornada no JSON em `governance`, para auditoria e integracao com frontend/Drive Saver.

## Regras ajustadas

Charlie Echo nao deve mais interpretar "sem credencial direta no Drive" como proibicao de agir. A regra correta e:

- nao pedir senha, token, chave, `.env` ou credencial no chat;
- nao usar credencial direta do Fundador no frontend;
- usar Drive Saver, miniBackend, conector ou backend autenticado quando disponivel;
- salvar automaticamente quando houver permissao e classificacao adequada;
- gerar link publico apenas quando a classificacao for PUBLICO e o backend retornar URL real;
- salvar INTERNO ou JURIDICO_SIGILOSO sem link publico;
- bloquear COFRE_NAO_AUTOMATICO.

## Correcoes contra travamento

Foram reforcadas rotas para impedir que a Charlie Echo caia no texto fixo de pesquisa quando o pedido for:

- explicacao juridica com fontes;
- minuta ou peca com download;
- salvamento no Cartorio Digital;
- acao corretiva no Drive Saver;
- analise governada de upload/anexo.

O caso "Fale sobre o direito de propriedade citando fontes" agora chama o modelo e deve gerar resposta inteligente, sem cair no protocolo fixo de doutrina/jurisprudencia.

## Testes executados

Comando:

```bash
npm test
```

Resultado:

- 44 testes executados;
- 44 aprovados;
- 0 falhas.

Coberturas relevantes:

- download de minuta nao cai em pesquisa guiada;
- erro de digitação `donwload` continua entendido;
- pesquisa explicita de jurisprudencia continua usando trilha segura;
- explicacao juridica com fontes chama o modelo;
- minuta demonstrativa publica salva automaticamente no Drive Saver;
- payload do Drive Saver registra a memoria operacional oficial;
- upload governado continua aceito para peca completa;
- a pergunta atual prevalece sobre memoria contaminada;
- acoes corretivas do Drive Saver vencem antes de pesquisa juridica.

## Cronograma mao na massa

### Pacote 1 - DAJ + Governanca Operacional

Status: implementado e testado localmente.

Entregas:

- camada de governanca operacional na API;
- DAJ como piloto;
- Drive como memoria oficial;
- salvamento automatico permitido por classificacao;
- metadados de auditoria no JSON;
- testes de regressao.

### Pacote 2 - DAJ Upload + Analise da Charlie

Prazo sugerido: 1 a 2 dias de trabalho.

Entregas:

- fluxo "Enviar DAJ para analise da Charlie Echo";
- leitura de texto extraido de PDF/DOCX/TXT;
- resposta tecnica com sumario, riscos, documentos faltantes, tese inicial e proximos passos;
- opcao de salvar relatorio no Drive;
- PDF de analise quando o conteudo for medio/grande;
- classificacao automatica PUBLICO/INTERNO/JURIDICO_SIGILOSO.

### Pacote 3 - Auditoria para investidores e parceiros

Prazo sugerido: 1 dia apos Pacote 2.

Entregas:

- documento executivo do modelo de governanca;
- trilha de seguranca e LGPD;
- mapa DAJ como piloto replicavel;
- indicadores minimos de qualidade;
- riscos conhecidos e mitigacoes;
- checklist de demonstracao.

### Pacote 4 - Replicacao para MVPs

Prazo sugerido: 3 a 5 dias apos DAJ aprovado.

Entregas:

- matriz de MVPs;
- regimento curto por modulo;
- tabela de caixas de personalidade;
- intencoes principais por ambiente;
- regras de salvamento no Drive por modulo;
- testes de pelo menos 3 casos por MVP.

### Pacote 5 - Observabilidade e melhoria continua

Prazo sugerido: iniciar junto do Pacote 4.

Entregas:

- auditId visivel quando o Drive Saver retornar;
- registro de operacao por MVP;
- contador de respostas por tipo;
- fila de revisao humana;
- lista de ajustes sugeridos pela Charlie quando detectar caixa/protocolo ruim.

## Proximo passo tecnico recomendado

Avancar para o Pacote 2: consolidar o fluxo DAJ Upload + Analise da Charlie Echo no frontend e na API, usando a mesma decisao de governanca retornada em `governance`.

Critério de aceite:

- usuario envia DAJ/anexo;
- Charlie analisa sem pedir dados ja presentes no upload;
- resposta nao vira protocolo fixo;
- quando cabivel, salva relatorio no Drive;
- se for sigiloso, salva sem link publico;
- se for demonstrativo/publico, pode retornar link real de download quando o backend fornecer.

