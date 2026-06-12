# Versionamento - Triagem WhatsApp Interpretativa v1.2

Classificação: PÚBLICO / ORIENTAÇÃO OPERACIONAL SANITIZADA
Repositório: charlieecho-jus9-tecnologia-juridica
Instituição: Jus 9 Tecnologia Jurídica

## Objetivo

Melhorar a triagem WhatsApp para evitar repetição de menu e interpretar melhor mensagens naturais de primeiro atendimento.

## Problema observado

Em teste real, a Charlie Echo:

- tratava mensagem com saudação e caso concreto como simples menu;
- repetia a mesma resposta quando o usuário digitava `1` mais de uma vez;
- não reconhecia dados mínimos já enviados;
- confundia pedido de atendimento humano ou caso grave com rota genérica/documental.

## Entregas

- Adicionada memória curta em RAM por número de WhatsApp, sem banco de dados.
- Criada rota interpretativa para inventário/herança.
- Melhorada prioridade de urgência, atendimento humano e gravidade.
- Adicionada confirmação de dados mínimos recebidos.
- Adicionados testes que reproduzem fluxo realista de triagem.

## Segurança

- A memória curta não grava conteúdo bruto da conversa, apenas intenção, estágio e timestamp.
- Logs seguem mascarando identificadores.
- A resposta reforça que a Charlie Echo não toma decisão jurídica final.
- Casos com prazo, audiência, risco ou gravidade seguem encaminhados para revisão humana qualificada.

## Limite atual

Esta versão ainda não cria protocolo persistente, não aciona humano automaticamente e não usa banco de dados. O próximo passo recomendado é memória operacional governada com registro mínimo, retenção definida e canal claro de atendimento humano.
