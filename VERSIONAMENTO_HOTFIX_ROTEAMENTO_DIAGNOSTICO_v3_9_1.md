# Versionamento — Hotfix de roteamento do diagnóstico v3.9.1

Data: 29 de julho de 2026  
Classificação: PÚBLICO / TÉCNICO / EDUCATIVO

## Incidente

O primeiro envio real do diagnóstico de programação foi classificado como
produção de peça jurídica porque as palavras “diagnóstico inicial” e “crie”
acionaram dois sinais genéricos do classificador.

A resposta jurídica foi descartada como evidência pedagógica.

## Correção

- criado detector explícito de aprendizagem de programação;
- prompts de programação não entram em produção documental jurídica;
- o Módulo 0 é roteado para `DEJ_ESTUDANTES`;
- a operação é `diagnostico_formacao_programacao`;
- adicionado teste reproduzindo o prompt que revelou o incidente.

## Regra

Uma tentativa com roteamento incorreto não aprova, reprova nem avalia Charlie
Echo. O diagnóstico deve ser reaplicado após o deploy do hotfix.
