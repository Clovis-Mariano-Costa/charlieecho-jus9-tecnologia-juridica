# Catalogo Bibliografico Juridico Verificado v2

Origem: Charlie Echo da Costa / Jus 9 Tecnologia Juridica
Versao operacional: `catalogo-bibliografico-juridico-v2`
Arquivo tecnico: `functions/lib/legal-bibliography.js`
Substitui e amplia: `CATALOGO_BIBLIOGRAFICO_JURIDICO_VERIFICADO_v1.md`

## Finalidade

Este catalogo reduz alucinacao bibliografica da Charlie Echo em perguntas sobre obra, livro, autor, autoria, edicao, editora, ISBN, paginas, citacao literal, resenha ou bibliografia.

Quando uma obra estiver no catalogo, Charlie responde pela ficha verificada. Quando nao estiver, ela entra em modo conferencia e nao transforma plausibilidade em certeza.

## Regras

- Nao afirmar autoria, edicao, editora, ano, pagina, citacao literal ou conteudo interno sem fonte conferida.
- Separar resumo seguro de informacao que depende do exemplar.
- Preferir LexML, bibliotecas oficiais/universitarias, catalogo da editora, WorldCat, Google Scholar com cautela, BDTD, CAPES e SciELO.
- Em Direito, erro de autoria de obra e erro material grave.
- O catalogo e expansivel por commits pequenos, com fonte e teste de regressao.

## Nucleo internacional e dogmatico inicial

1. `A moderna teoria do fato punivel`
   - Autoria: Juarez Cirino dos Santos.
   - Area: Direito Penal / teoria do delito.
   - Fontes:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2000%3B000578592
     - https://www3.tjrj.jus.br/sophia_web/acervo/detalhe/19139

2. `Teoria pura do direito`
   - Autoria: Hans Kelsen.
   - Area: Teoria do Direito / positivismo juridico.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1998%3B000199876

3. `A luta pelo direito`
   - Autoria: Rudolf von Ihering.
   - Area: Teoria do Direito / filosofia juridica.
   - Fontes:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2005%3B000857702
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2004%3B000728241

4. `Dos delitos e das penas`
   - Autoria: Cesare Beccaria.
   - Area: Direito Penal / criminologia classica.
   - Fontes:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1937%3B000170552
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2006%3B000859343

## Nucleo brasileiro por areas

5. `Curso de direito constitucional positivo`
   - Autoria: Jose Afonso da Silva.
   - Area: Direito Constitucional.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2000%3B000563561

6. `Curso de direito civil brasileiro`
   - Autoria: Maria Helena Diniz.
   - Area: Direito Civil.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1997%3B000184787

7. `Instituicoes de direito civil`
   - Autoria: Caio Mario da Silva Pereira.
   - Area: Direito Civil.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2017%3B001085986

8. `Tratado de direito penal`
   - Autoria: Cezar Roberto Bitencourt.
   - Area: Direito Penal.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2015%3B001054890

9. `Curso de direito processual civil`
   - Autoria: Fredie Didier Jr.
   - Area: Direito Processual Civil.
   - Fontes:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2021%3B001188090
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2006%3B000850010

10. `Manual de direito processual civil`
   - Autoria: Daniel Amorim Assumpcao Neves.
   - Area: Direito Processual Civil.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2016%3B001079152

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
