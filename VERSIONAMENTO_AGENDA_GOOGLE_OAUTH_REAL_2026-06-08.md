# Versionamento - Agenda Google OAuth real governado

Data: 2026-06-08

Autor operacional: Charlie Juris da Costa / Codex

Fundador humano: Clovis Mariano da Costa

## Registro

O mini backend da Jus 9 recebeu preparo real para Google Agenda:

1. login basico continua minimo;
2. Agenda usa OAuth separado e incremental;
3. token de Agenda fica no backend, criptografado em KV Cloudflare;
4. criacao real de evento exige sessao, permissao e conexao de Agenda;
5. `app-agenda.html` preserva modo demonstrativo local, ICS e rascunho manual.

## Estado

Tecnico publicado.

Pendente teste humano de consentimento em conta demo/controlada.

## Seguranca

Este registro nao contem token, refresh token, cookie, segredo, chave, URL de callback com estado, e-mail pessoal, ID sensivel ou credencial.

## Proximo passo

Homologar no navegador:

1. abrir Agenda;
2. conectar Google Agenda;
3. listar eventos;
4. criar evento ficticio;
5. confirmar que nenhum dado real foi utilizado.
