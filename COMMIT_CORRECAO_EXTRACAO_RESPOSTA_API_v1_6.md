Summary:
Corrige extração da resposta da API da Charlie Echo

Description:
- ajusta o front-end para reconhecer múltiplos formatos de resposta da API
- corrige a extração de texto retornado pela Responses API no backend
- melhora mensagens de erro quando a API responde sem texto reconhecido
- mantém chamadas seguras sem expor OPENAI_API_KEY no navegador
- preserva botões de fala, ouvir, copiar, limpar e demais ações locais
- mantém suporte aos modos estudantes e profissional
