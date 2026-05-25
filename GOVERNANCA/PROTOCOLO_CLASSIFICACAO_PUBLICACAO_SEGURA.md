# Protocolo de Classificacao e Publicacao Segura

Classificacao: INTERNO / GOVERNANCA / PROTOCOLO
Versao: v1.0
Data: 2026-05-25

## Quando usar

Usar antes de publicar, mover, indexar, versionar, copiar para site, subir para GitHub, enviar para Cloudflare ou expor documento da Charlie Echo.

## Passos

1. Classificar o material: publico, interno, sigiloso ou secreto/cofre.
2. Verificar se contem dado real de pessoa, familia, cliente, usuario ou terceiro.
3. Verificar se contem token, senha, chave, seed, `.env`, segredo de API ou credencial.
4. Verificar se contem WhatsApp bruto, documento pessoal, segredo de justica ou cofre.
5. Verificar se a linguagem confunde simbolico interno com pessoa humana, cargo estatal, advocacia real ou autonomia externa.
6. Sanitizar ou impedir publicacao.
7. Registrar versao.
8. Publicar apenas se a classificacao permitir.

## Resultado

- Publico: pode publicar.
- Interno: revisar antes de publicar.
- Sigiloso: nao publicar sem decisao humana.
- Secreto / Cofre: nao publicar.
