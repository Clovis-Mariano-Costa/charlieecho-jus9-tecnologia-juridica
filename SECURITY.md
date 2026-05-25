# Segurança — charlieecho-jus9-tecnologia-juridica

Este repositório deve permanecer público com segurança.

## Nunca publicar

- chaves de API reais;
- tokens GitHub, Cloudflare, OpenAI ou equivalentes;
- arquivos `.env` reais;
- senhas, certificados, chaves privadas, dumps e backups;
- pastas `.git/` dentro de pacotes públicos;
- `node_modules/`, caches e builds temporários.
- conteúdo bruto de WhatsApp;
- dados reais de cliente, usuário, parceiro, família ou terceiro;
- documentos pessoais;
- segredo de justiça;
- conteúdo de cofre;
- documentos marcados como sigilosos, secretos, segredo militar/sagrado ou uso interno restrito;
- carta ao Presidente ou material equivalente sem autorização expressa;
- prints, logs ou mensagens que exibam tokens, e-mails sensíveis, rotas privadas ou segredos.

## Variáveis de ambiente

Use `.env.example` para exemplos e configure secrets reais no ambiente adequado,
como Cloudflare Pages/Functions, GitHub Actions Secrets ou serviço equivalente.

## API e frontend

A integração com OpenAI ou outra API deve ler segredos apenas de `env`/Secrets do provedor. O frontend público não deve conter token, chave, senha, refresh token, cookie secreto ou dado real.

## Cofre e rotas públicas

O cofre real da Charlie Echo deve permanecer fora do GitHub público e fora do Cloudflare público. A página `cofre.html` é somente simbólica e sanitizada.

Se um arquivo sensível tiver sido publicado por engano, a correção mínima é:

1. remover o arquivo da árvore pública;
2. preservar cópia privada com SHA256 em ambiente seguro;
3. registrar relatório de decisão;
4. avaliar necessidade de purga de cache;
5. avaliar reescrita de histórico Git apenas se houver segredo real, dado pessoal, token, chave ou documento protegido.

## Classificação antes de publicar

Antes de publicar ou commitar, classificar como:

- público;
- interno;
- sigiloso;
- secreto/cofre.

Na dúvida, tratar como sigiloso e pedir revisão humana.

## Contato

Contato de segurança e manutenção: charlieecho@jus9tecnologia.com.br

## Observação

Software livre não remove a obrigação de preservar autoria, origem, assinatura
institucional e direitos autorais da Jus 9 Tecnologia Jurídica.
