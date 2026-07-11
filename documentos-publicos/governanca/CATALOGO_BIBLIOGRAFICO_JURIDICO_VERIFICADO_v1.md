# Catalogo Bibliografico Juridico Verificado v1

Origem: Charlie Echo da Costa / Jus 9 Tecnologia Juridica
Versao operacional: `catalogo-bibliografico-juridico-v1`
Arquivo tecnico: `functions/lib/legal-bibliography.js`

## Finalidade

Este catalogo reduz alucinacao bibliografica da Charlie Echo em perguntas sobre obra, livro, autor, autoria, edicao, editora, ISBN, paginas, citacao literal, resenha ou bibliografia.

A regra central e simples: quando uma obra estiver no catalogo, a Charlie responde pela ficha verificada; quando nao estiver, entra em modo conferencia e nao transforma plausibilidade em certeza.

## Regras

- Nao afirmar autoria, edicao, editora, ano, pagina, citacao literal ou conteudo interno sem fonte conferida.
- Separar resumo seguro de informacao que depende do exemplar.
- Preferir LexML, bibliotecas oficiais/universitarias, catalogo da editora, WorldCat, Google Scholar com cautela, BDTD, CAPES e SciELO.
- Em Direito, erro de autoria de obra e erro material grave.
- O catalogo e expansivel por commits pequenos, com fonte e teste de regressao.

## Nucleo v1

1. `A moderna teoria do fato punivel`
   - Autoria: Juarez Cirino dos Santos.
   - Area: Direito Penal / teoria do delito.
   - Observacao: "A nova teoria do fato punivel" deve ser tratada como possivel variacao imprecisa do titulo.
   - Fontes:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2000%3B000578592
     - https://www3.tjrj.jus.br/sophia_web/acervo/detalhe/19139

2. `Teoria pura do direito`
   - Autoria: Hans Kelsen.
   - Area: Teoria do Direito / positivismo juridico.
   - Observacao: existem multiplas edicoes e traducoes; edicao/pagina exigem exemplar.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1998%3B000199876

3. `A luta pelo direito`
   - Autoria: Rudolf von Ihering.
   - Area: Teoria do Direito / filosofia juridica.
   - Observacao: catalogos podem registrar Ihering, Jhering ou von Ihering.
   - Fontes:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2005%3B000857702
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2004%3B000728241

4. `Dos delitos e das penas`
   - Autoria: Cesare Beccaria.
   - Area: Direito Penal / criminologia classica.
   - Observacao: existem muitas edicoes e traducoes; pagina e traducao exigem fonte do exemplar.
   - Fontes:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1937%3B000170552
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2006%3B000859343

## Proximo crescimento

Cada nova entrada deve trazer:

- titulo canonico;
- autoria;
- area;
- aliases controlados;
- resumo seguro;
- limite de cautela;
- fontes;
- teste automatizado impedindo chamada ao modelo quando a obra estiver catalogada.
