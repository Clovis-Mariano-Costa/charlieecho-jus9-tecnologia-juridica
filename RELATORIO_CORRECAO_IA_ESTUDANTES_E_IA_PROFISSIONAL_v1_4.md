# RELATÓRIO — Correção IA Estudantes e IA Profissional v1.4

## O que foi feito

### IA Estudantes
- inclusão de **botão de entrada por voz** (`🎤 Falar`);
- inclusão de **botão de saída por voz** (`🔊 Ouvir resposta`);
- inclusão de **botão de parada de áudio** (`⏹ Parar áudio`);
- correção da lógica dos botões existentes (`Perguntar`, `Exemplos`, `Temas de Estudo`, `Resumir Texto`, `Analisar Documento`, `Analisar Imagem`, `Copiar`, `Traduzir`, `Simplificar`, `Avaliar`, `Limpar`);
- correção do JavaScript anterior, que continha quebra de string e podia impedir o funcionamento de toda a página;
- inclusão de **imagem original da robozinha professora** com chapéu de formanda em `assets/img/charlie-ia-estudantes-professora.png`;
- reforço visual da seção de estudo.

### IA Profissional
- criação/expansão da página `ia-profissional.html` com estrutura própria inspirada nos botões da estudante;
- inclusão de botões para uso jurídico-assistivo (`🎤 Falar`, `⚖️ Consultar`, `📑 Analisar Petição`, `🗂 Resumir Caso`, `📝 Revisar Documento`, `🏛 Jurisprudência`, `📋 Copiar resposta`, `🔊 Ouvir resposta`, `⏹ Parar áudio`, `🧹 Limpar`);
- inclusão da **imagem da IA profissional** em `assets/img/charlie-ia-profissional-advocacia.png`.

### Navegação e compatibilidade
- atualização do `index.html` (Lar Doce Lar) com links diretos para IA Estudantes e IA Profissional;
- atualização dos links principais para versões `.html`, evitando dependência de rotas que causavam confusão;
- manutenção das pastas com `index.html` para preservar compatibilidade de rotas limpas;
- desativação prática de regras de `_redirects`, reduzindo risco de loop.

## Observação técnica
As funções de fala usam recursos nativos do navegador:
- `SpeechRecognition` / `webkitSpeechRecognition` para entrada por voz;
- `speechSynthesis` para leitura em voz alta.

Portanto, o comportamento pode variar conforme navegador, permissões de microfone e política local do dispositivo.

## Arquivos principais alterados
- `index.html`
- `ia-estudantes.html`
- `ia-profissional.html`
- `ia-estudantes/index.html`
- `ia-profissional/index.html`
- `assets/css/charlie-light.css`
- `assets/js/charlie-ia-pages.js`
- `assets/img/charlie-ia-estudantes-professora.png`
- `assets/img/charlie-ia-profissional-advocacia.png`
- `_redirects`
