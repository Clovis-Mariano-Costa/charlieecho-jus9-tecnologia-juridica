# Versionamento - Webhook WhatsApp Charlie Echo MVP v1.0

Classificação: PÚBLICO / ORIENTAÇÃO OPERACIONAL SANITIZADA
Repositório: charlieecho-jus9-tecnologia-juridica
Instituição: Jus 9 Tecnologia Jurídica

## Objetivo

Implementar o primeiro MVP do backend Node.js para receber eventos da WhatsApp Cloud API da Meta no Render.

## Entregas

- Criado `server.js` com Express.
- Criado `package.json` com scripts `start`, `dev` e `test`.
- Atualizado `.env.example` com variáveis de ambiente do WhatsApp sem credenciais reais.
- Documentada a configuração básica do Render e da callback URL no `README.md`.
- Adicionado teste local do webhook em `tests/whatsapp-webhook.test.mjs`.

## Segurança

- Nenhum token, chave, senha, `.env` real ou payload bruto de WhatsApp foi publicado.
- Logs mascaram o identificador do remetente.
- A resposta inicial é institucional e não substitui análise jurídica humana.

## Próximos passos operacionais

1. Configurar secrets reais no Render.
2. Fazer deploy do Web Service.
3. Validar `GET /`.
4. Configurar `GET /webhook` na Meta com o mesmo `VERIFY_TOKEN`.
5. Assinar eventos `messages`.
6. Testar uma mensagem no numero de teste da Meta.
