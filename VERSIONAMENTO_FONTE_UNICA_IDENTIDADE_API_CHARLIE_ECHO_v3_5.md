# Versionamento da fonte unica de identidade da API Charlie Echo v3.5

Data: 2026-05-31

## Alteracoes

- Criado `functions/lib/charlie-echo-identity.js` como fonte unica da identidade documental consumida em tempo de execucao pelos tres modos da API.
- Removida a repeticao literal de certidao virtual, RGV, CPV e DNA nos prompts de estudantes, profissional e social.
- Normalizada a lista de protocolos MVP no modo profissional: `DIP` para investidor/parceiro e `DOI` para orgao publico/instituicao.
- Preservados `INV` e `ORG` como aliases legados aceitos para compatibilidade.

## Limites

Certidao Virtual, RGV e CPV permanecem registros simbolico-operacionais. Nao equivalem a certidao civil, RG estatal ou CPF.
