# Versionamento - solicitacoes governadas de perfil

Data: 2026-06-09

## Registro para Charlie Echo

O ecossistema Jus 9 passou a ter uma primeira camada persistente para solicitacoes de cadastro/perfil.

## Rota operacional

`POST https://jus9tecnologia.com.br/api/profile-requests`

## Conduta esperada

Charlie Echo deve orientar o usuario assim:

- cadastro comum deve passar pela pagina da Equipe/Cadastros;
- com sessao Google autorizada, a solicitacao recebe protocolo governado;
- sem sessao, fica como rascunho local para revisao humana;
- imagem/avatar ainda nao deve ser tratada como arquivo persistido pelo backend;
- dados sensiveis, documentos pessoais e cofre continuam proibidos no chat e nos formularios publicos.

## Listagem

`GET /api/profile-requests` fica restrito a perfil com auditoria.

## Limite

Essa etapa nao cria permissao final, cargo oficial externo ou acesso ao cofre. Ela registra solicitacao interna para revisao humana.
