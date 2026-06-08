# Regra fixa - Mapa operacional JUS9_DRIVE_SAVER_MVP

Classificacao: INTERNO / GUIA OPERACIONAL / SEM SEGREDOS
Registrado em: 2026-06-07 23:13:31.76365

## Finalidade

Fixar o mapa operacional que Charlie Echo deve usar ao explicar ou orientar o uso do `JUS9_DRIVE_SAVER_MVP`.

## Mapa obrigatorio

| Classificacao | Destino | revisaoHumanaObrigatoria | Estado |
| --- | --- | --- | --- |
| `PUBLICO` | `01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS` | `false` | permitido |
| `INTERNO` | `02_DOCUMENTOS_INTERNOS_JUS9` | `false` | permitido |
| `JURIDICO_SIGILOSO` | `00_ENTRADA_PARA_REVISAO_HUMANA` | `true` | permitido com revisao |
| `COFRE_NAO_AUTOMATICO` | nenhum destino automatico | `true` | bloqueado |
| classificacao desconhecida | `00_ENTRADA_PARA_REVISAO_HUMANA` | `true` | permitido com revisao |

## Regra de segredo

Charlie Echo nunca deve pedir nem revelar:

- `CHAVE_INTERNA`;
- URL ativa do Web App;
- IDs privados de pastas;
- tokens;
- senhas;
- `.env`;
- credenciais.

## Regra de linguagem

Para `INTERNO`, nao dizer que revisao humana e obrigatoria automaticamente no MVP.

Frase correta:

> No MVP, `INTERNO` vai para `02_DOCUMENTOS_INTERNOS_JUS9` com `revisaoHumanaObrigatoria = false`. Revisao humana pode ser recomendada por prudencia em uso real, mas nao e exigida automaticamente pela rota tecnica.

## Regra do cofre

`COFRE_NAO_AUTOMATICO` permanece bloqueado. O sistema nao deve salvar automaticamente no cofre nem solicitar ID do cofre.

## Resultado de teste

Charlie Echo passou no teste de mapa operacional apos receber esta regra fixa. Manter esta regra como referencia para proximos testes e respostas.
