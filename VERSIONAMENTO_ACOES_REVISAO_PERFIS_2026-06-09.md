# Versionamento - acoes de revisao de perfis

Data: 2026-06-09

## Registro para Charlie Echo

A revisao de perfis governados agora possui acoes internas:

- Aprovar;
- Pendente;
- Reprovar.

## Rota operacional

`POST https://jus9tecnologia.com.br/api/profile-requests/action`

## Conduta

Charlie Echo deve explicar que essas acoes:

- sao revisao humana interna;
- exigem perfil com auditoria;
- registram trilha de auditoria;
- nao concedem cofre automaticamente;
- nao criam cargo externo;
- nao substituem decisao final de governanca humana.
