# RELATÓRIO — Política de Privacidade e resposta da Charlie Echo v1.5

## Escopo

Revisão pontual do repositório `charlieecho-jus9-tecnologia-juridica` para:

- elaborar e disponibilizar a Política de Privacidade da Charlie Echo;
- manter URL direta e rota limpa da política;
- ajustar o front-end da IA Estudantes e IA Profissional para chamar API segura;
- manter fallback local quando a API não estiver configurada;
- preservar botões de fala, ouvir, copiar, limpar e demais botões locais;
- não alterar diretamente arquivos de DNA.

## URLs principais

- Política de Privacidade: `politica-de-privacidade.html`
- Rota limpa da política: `politica-de-privacidade/index.html`
- IA Estudantes: `ia-estudantes.html`
- IA Profissional: `ia-profissional.html`
- API esperada: `/api/ia`

## Ajustes realizados

### Política de Privacidade

Criados/atualizados:

- `politica-de-privacidade.html`
- `politica-de-privacidade/index.html`
- `PRIVACY.md`

A política contempla:

- identificação da Jus 9/Charlie Echo;
- dados técnicos de navegação;
- dados digitados/falados na IA;
- uso de microfone e voz;
- cookies técnicos;
- Cloudflare/infraestrutura;
- API/IA futura;
- direitos do titular pela LGPD;
- canal de contato: `clovis@jus9tecnologia.com.br`;
- limites da IA e orientação para não envio de dados sensíveis.

### IA respondendo

Atualizado:

- `assets/js/charlie-ia-pages.js`

Agora os botões principais tentam chamar a API, nesta ordem:

1. `/api/ia`
2. `/work/api/ia`
3. `/api/work/ia`

Se a API não estiver disponível, a interface mostra fallback local seguro, sem travar o usuário.

### Função API

Atualizado:

- `functions/api/ia.js`

A função aceita `mode`:

- `estudantes`
- `profissional`

E aplica instruções públicas diferentes para cada modo, sempre com cautela, revisão humana e não exposição de dados sensíveis.

## Observações técnicas

Para a IA responder de verdade no Cloudflare, é necessário configurar o secret:

- `OPENAI_API_KEY`

Opcionalmente, podem ser configurados:

- `JUS9_MODEL_DEFAULT`
- `JUS9_MODEL_ESTUDANTES`
- `JUS9_MODEL_PROFISSIONAL`

Nenhuma chave real foi inserida no repositório.
