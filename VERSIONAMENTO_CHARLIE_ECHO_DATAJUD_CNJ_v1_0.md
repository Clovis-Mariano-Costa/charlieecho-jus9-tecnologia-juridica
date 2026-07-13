# Versionamento - Charlie Echo DataJud/CNJ v1.0

ID: CHARLIE-ECHO-DATAJUD-CNJ-v1.0  
Versao: 1.0.0  
Data: 2026-07-12  
Autor: Codex / Jus 9 Tecnologia Juridica  
Responsavel pela revisao: Fundador / equipe Jus 9  
Status: implementado em homologacao tecnica  
Classificacao: INTERNO_PUBLICAVEL  
Hash: a calcular na release aprovada

## Objetivo

Ensinar a Charlie Echo a reconhecer consultas processuais com numero CNJ e acionar o gateway governado CNJ/DataJud do portal Jus 9, em vez de responder com protocolo generico ou substituir a consulta por texto local.

## Escopo

- Detectar numero processual CNJ de 20 digitos, com ou sem mascara.
- Identificar intencao de consulta CNJ/DataJud, andamento, movimentacoes, capa ou metadados processuais.
- Inferir dica simples de tribunal quando o usuario informar sigla ou alguns estados comuns.
- Chamar o gateway `JUS9_TRIBUNAIS_GATEWAY_URL` com token interno `JUS9_TRIBUNAIS_GATEWAY_TOKEN`.
- Formatar resposta publica com metadados seguros, fonte, tribunal, numero, classe, assuntos, orgao julgador e movimentacoes publicas.
- Responder com pendencia governada quando o token ou gateway nao estiver configurado.

## Limites

- Nao realiza peticionamento.
- Nao promete inteiro teor, certidao, prazo fatal ou acesso a processo sigiloso.
- Nao usa credencial no frontend.
- Nao substitui o DataJud por resposta local quando a consulta real estiver pendente.
- Dados processuais reais continuam exigindo conferencia no tribunal competente e revisao humana.

## Variaveis

- `JUS9_TRIBUNAIS_GATEWAY_URL`
- `JUS9_TRIBUNAIS_GATEWAY_TOKEN`

## Testes

- `tests/ia-intent.test.mjs` cobre consulta pendente sem token e consulta bem-sucedida via gateway mockado.
- `tests/charlie-echo-public-regression.mjs` e `scripts/audit-charlie-modules-quality.mjs` verificam presenca dos sentinelas de governanca.

## Proxima etapa

Configurar secrets reais no provedor seguro, validar consulta DataJud em producao e replicar o padrao para conectores de tribunais que tenham APIs oficiais proprias.
