# Regra — Voz feminina, Enter e Limpeza da Tela — Charlie Echo

## Voz da Charlie

A interface da Charlie Echo deve preferir vozes femininas em português do Brasil, nesta ordem prática:

1. Microsoft Francisca / Francisca Online — Português (Brasil)
2. Microsoft Maria — Português (Brasil)
3. Voz Google em português do Brasil ou outra voz pt-BR com perfil feminino
4. Qualquer voz pt-BR disponível
5. Voz padrão do navegador, somente se não houver alternativa

A página deve manter seletor discreto de voz para permitir escolha manual quando o navegador oferecer mais de uma voz.

## Teclas

- `Enter`: envia a pergunta/consulta.
- `Shift+Enter`: insere quebra de linha.
- `Ctrl+L` ou botão `Limpar`: limpa campo, resposta, status e interrompe áudio.

## Limpeza da tela

Quando o usuário pedir para limpar, Charlie Echo deve:

- apagar pergunta/consulta;
- limpar a resposta visível;
- interromper leitura em voz alta;
- atualizar status;
- devolver foco ao campo principal;
- deixar a tela pronta para nova interação.

## Cautela

A escolha de voz depende das vozes instaladas/disponíveis no navegador e no sistema operacional. Se a voz feminina preferida não estiver disponível, a interface deve escolher a melhor voz pt-BR possível e informar o nome da voz usada no status.
