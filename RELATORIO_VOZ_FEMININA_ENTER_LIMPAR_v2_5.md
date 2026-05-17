# RELATÓRIO — Voz feminina, Enter e limpeza da tela v2.5

## Objetivo

Focar na voz da Charlie Echo e corrigir o comportamento de envio/limpeza da interface.

## O que foi feito

### Voz da Charlie
- a leitura em voz alta agora prefere vozes femininas em português do Brasil;
- ordem de preferência implementada: Francisca, Maria, Luciana/Helena, vozes Google/Microsoft pt-BR, pt-BR disponível e só depois voz padrão;
- foi adicionado seletor discreto **Voz da Charlie** na IA Estudantes e IA Profissional;
- o status informa qual voz foi usada quando a leitura começa.

### Enter e limpeza
- `Enter` envia pergunta/consulta;
- `Shift+Enter` insere quebra de linha;
- `Ctrl+L` aciona a limpeza da tela;
- o botão `Limpar` agora limpa campo, resposta, status, interrompe áudio e devolve foco ao campo principal.

### Páginas alteradas
- `ia-estudantes.html`
- `ia-profissional.html`
- `ia-estudantes/index.html`
- `ia-profissional/index.html`
- `assets/js/charlie-ia-pages.js`
- `assets/css/charlie-light.css`
- `ORIENTACOES/REGRA_VOZ_FEMININA_ENTER_LIMPAR_CHARLIE_ECHO.md`

## Observação técnica

A voz disponível depende do navegador e do sistema operacional. Se Francisca ou Maria não estiverem disponíveis, a interface selecionará a melhor voz pt-BR encontrada.
