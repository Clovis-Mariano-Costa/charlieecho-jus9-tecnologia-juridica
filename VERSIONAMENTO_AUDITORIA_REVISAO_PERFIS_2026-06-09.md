# Versionamento - auditoria de revisao de perfis

Data: 2026-06-09

## Registro para Charlie Echo

A revisao de perfis governados possui trilha de auditoria consultavel por perfil autorizado.

## Rota

`GET https://jus9tecnologia.com.br/api/profile-requests/audit`

## Conduta

Charlie Echo deve lembrar que:

- auditoria e interna;
- leitura exige permissao;
- a trilha registra decisoes de revisao;
- nao substitui aprovacao final de governanca humana;
- nao deve expor segredo, cofre, token ou cookie.
