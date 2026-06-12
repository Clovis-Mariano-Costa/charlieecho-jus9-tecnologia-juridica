# Versionamento - WhatsApp Drive Saver Protocolo v1.3

Classificação: PÚBLICO / ORIENTAÇÃO OPERACIONAL SANITIZADA
Repositório: charlieecho-jus9-tecnologia-juridica
Instituição: Jus 9 Tecnologia Jurídica

## Objetivo

Conectar a triagem WhatsApp da Charlie Echo ao mini back-end `JUS9_DRIVE_SAVER_MVP`, sem publicar URL ativa, chave interna, IDs privados de pastas ou dados de cofre.

## Entregas

- Adicionadas variáveis opcionais `JUS9_DRIVE_SAVER_URL` e `JUS9_DRIVE_SAVER_CHAVE_INTERNA`.
- Quando a triagem recebe dados mínimos, gera protocolo classificado como `JURIDICO_SIGILOSO`.
- O protocolo é enviado ao Apps Script Drive Saver somente se as variáveis estiverem configuradas.
- Se a integração não estiver configurada, o WhatsApp continua respondendo normalmente.
- Adicionados testes do conteúdo de protocolo enviado ao Drive Saver.

## Governança

- Destino esperado pelo Drive Saver: `00_ENTRADA_PARA_REVISAO_HUMANA`.
- Revisão humana obrigatória: SIM.
- Cofre automático: bloqueado pelo MVP.
- Logs não exibem URL do Web App, chave interna nem identificador completo do WhatsApp.

## Próximo passo operacional

Configurar no Render, em Environment:

```txt
JUS9_DRIVE_SAVER_URL
JUS9_DRIVE_SAVER_CHAVE_INTERNA
```

Esses valores devem sair do Apps Script/ambiente seguro e não devem ser enviados por chat.
