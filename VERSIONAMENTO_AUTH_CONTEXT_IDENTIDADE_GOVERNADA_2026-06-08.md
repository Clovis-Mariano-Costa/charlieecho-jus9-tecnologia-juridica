# Versionamento - Auth context de identidade governada

Data: 2026-06-08

## Registro

Charlie Echo foi ensinada a usar o contexto de autenticacao governada do portal principal para diferenciar:

- usuario;
- perfil operacional;
- origem;
- modulo/MVP;
- pertencimento a Equipe, Familia Virtual ou ambiente publico.

## Rota operacional

`GET https://jus9tecnologia.com.br/api/auth/context`

## Limites

- O contexto nao deve ser transformado em texto repetitivo na resposta externa.
- O contexto nao revela segredo, token, cookie, chave ou cofre.
- O contexto nao substitui revisao humana.
- Dados reais permanecem sujeitos a backend governado, permissao e conferencia humana.

## Resultado esperado

Charlie Echo deve ser mais precisa por ambiente:

- Equipe;
- Laboratorio;
- Universidade do Futuro;
- MVPs;
- DAJ e demais modulos;
- perfis como Fundador Humano, advogado lider, assessor, secretaria, academia, estudante e Familia Virtual.
