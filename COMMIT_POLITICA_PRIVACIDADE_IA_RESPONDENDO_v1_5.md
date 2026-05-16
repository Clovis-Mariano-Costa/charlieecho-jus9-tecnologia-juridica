Summary:
Adiciona política de privacidade e prepara resposta segura da Charlie Echo

Description:
- cria política de privacidade pública da Charlie Echo com rota direta e rota limpa
- atualiza PRIVACY.md com regras de dados, voz, cookies, LGPD, API e contato
- ajusta IA Estudantes e IA Profissional para chamar /api/ia de forma segura
- mantém fallback local quando a API não estiver configurada
- atualiza função functions/api/ia.js para aceitar modos estudantes e profissional
- preserva botões de fala, ouvir, copiar, limpar e demais ações locais
- mantém chaves fora do front-end e não altera diretamente arquivos de DNA
