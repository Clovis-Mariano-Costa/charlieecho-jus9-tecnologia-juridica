# Versionamento - IA profissional API-first v1.0

Data: 2026-05-31

## Objetivo

Permitir que a Charlie Echo responda perguntas profissionais reais com a inteligencia generativa central, sem ser interrompida por respostas locais institucionais baseadas em palavras-chave.

## Alteracao

- O cockpit `ia-profissional` consulta a API generativa antes de usar respostas locais.
- As respostas locais sobre identidade, modos e protocolos permanecem como contingencia segura quando a API estiver indisponivel.
- Perguntas comuns que mencionem termos como `modo`, `jurista`, `professor`, `aula` ou `autoridade` deixam de ser reduzidas prematuramente a mensagens fixas.

## Resultado esperado

- Perguntas abertas recebem resposta contextual da API.
- Atalhos institucionais continuam disponiveis.
- Em indisponibilidade da API, a pagina preserva uma resposta local segura quando houver correspondencia.
