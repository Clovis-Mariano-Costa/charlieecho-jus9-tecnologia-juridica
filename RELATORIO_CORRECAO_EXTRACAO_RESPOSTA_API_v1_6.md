# RELATÓRIO — Correção de extração da resposta da API v1.6

## Problema observado

A tela da IA Estudantes exibia:

> Resposta recebida da Charlie Echo.

mas a área de resposta mostrava:

> Não foi possível extrair a resposta da IA neste momento.

Isso indicava que a requisição chegava à API, mas o código não extraía corretamente o texto retornado pela OpenAI/API.

## Correção aplicada

### Front-end
Arquivo alterado:

- `assets/js/charlie-ia-pages.js`

A função de chamada da API agora aceita vários formatos de resposta:

- `answer`
- `resposta`
- `response`
- `output_text`
- `text`
- `content`
- `message`
- `choices[0].message.content`
- `choices[0].text`
- `output[].content[].text`

Também passou a mostrar erro mais claro quando a API responde sem texto reconhecido.

### Backend/API
Arquivo alterado:

- `functions/api/ia.js`

A função agora extrai texto de forma mais robusta do retorno da Responses API, incluindo `output_text` e conteúdo dentro de `output[].content[]`.

Também foi ajustado o modelo padrão para `gpt-4o-mini`, mantendo a possibilidade de sobrescrever por variáveis:

- `JUS9_MODEL_DEFAULT`
- `JUS9_MODEL_ESTUDANTES`
- `JUS9_MODEL_PROFISSIONAL`

## Resultado esperado

Após publicar este pacote e aguardar o deploy do Cloudflare Pages:

1. abrir `https://charlieecho.jus9tecnologia.com.br/ia-estudantes.html`;
2. digitar uma pergunta;
3. clicar em `Perguntar`;
4. a resposta textual deve aparecer na área `Resposta`.

Se ainda falhar, a mensagem deverá mostrar erro mais específico, ajudando a identificar se o problema está no modelo, na rota, no backend, na chave ou no retorno da API.
