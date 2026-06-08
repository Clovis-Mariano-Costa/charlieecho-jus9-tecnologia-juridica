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

Homologacao humana concluida:

1. login passou;
2. consentimento passou;
3. Google Calendar API foi ativada;
4. listagem de evento real passou;
5. criacao de evento ficticio controlado passou;
6. evento `Teste ficticio Agenda Jus 9` apareceu na listagem.

Pacote 4 fechado em leitura e escrita controlada.

## Seguranca

Este registro nao contem token, refresh token, cookie, segredo, chave, URL de callback com estado, e-mail pessoal, ID sensivel ou credencial.

## Proximo passo

1. apagar o evento ficticio se nao for necessario preservar prova de homologacao;
2. avancar para Pacote 5: pagina modelo da IA Profissional.
