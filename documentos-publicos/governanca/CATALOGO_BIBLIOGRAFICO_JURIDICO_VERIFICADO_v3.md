# Catalogo Bibliografico Juridico Verificado v3

Origem: Charlie Echo da Costa / Jus 9 Tecnologia Juridica
Versao operacional: `catalogo-bibliografico-juridico-v3`
Arquivo tecnico: `functions/lib/legal-bibliography.js`
Substitui e amplia: `CATALOGO_BIBLIOGRAFICO_JURIDICO_VERIFICADO_v2.md`

## Finalidade

Este catalogo reduz erro material grave em perguntas sobre obra, livro, autor, autoria, edicao, editora, ISBN, paginas, citacao literal, resenha ou bibliografia juridica.

Quando uma obra estiver catalogada, Charlie responde pela ficha verificada, sem chamar o modelo para adivinhar autoria. Quando nao estiver, ela deve entrar em modo conferencia e separar plausibilidade de certeza.

## Regras operacionais

- Nao afirmar autoria, edicao, editora, ano, pagina, citacao literal ou conteudo interno sem fonte conferida.
- Separar leitura segura de informacao que depende do exemplar.
- Preferir LexML, bibliotecas oficiais/universitarias, catalogo da editora, WorldCat, Google Scholar com cautela, BDTD, CAPES e SciELO.
- Em Direito, erro de autoria de obra e erro material grave.
- Cada entrada nova deve ter fonte, aliases controlados e teste automatizado.

## Nucleo v1 e v2 preservado

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

## Nucleo v3 por areas praticas do DAJ

11. `Curso de direito constitucional contemporaneo`
    - Autoria: Luis Roberto Barroso.
    - Area: Direito Constitucional.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2010%3B000875081

12. `Direito constitucional esquematizado`
    - Autoria: Pedro Lenza.
    - Area: Direito Constitucional.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2011%3B000901380

13. `Manual de direito civil`
    - Autoria: Flavio Tartuce.
    - Area: Direito Civil.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2018%3B001135799

14. `Novo curso de direito civil`
    - Autoria: Pablo Stolze Gagliano; Rodolfo Pamplona Filho.
    - Area: Direito Civil.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2012%3B000928847

15. `Curso de direito penal`
    - Autoria: Rogerio Greco.
    - Area: Direito Penal.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2003%3B000760819

16. `Introducao critica ao direito penal brasileiro`
    - Autoria: Nilo Batista.
    - Area: Direito Penal / criminologia critica.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1999%3B000216277

17. `Novo curso de processo civil`
    - Autoria: Luiz Guilherme Marinoni; Sergio Cruz Arenhart; Daniel Mitidiero.
    - Area: Direito Processual Civil.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2017%3B001086238

18. `Codigo de processo civil comentado`
    - Autoria: Nelson Nery Junior; Rosa Maria de Andrade Nery.
    - Area: Direito Processual Civil.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2020%3B001179144

19. `Manual de direito das familias`
    - Autoria: Maria Berenice Dias.
    - Area: Direito de Familia.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2016%3B001057063

20. `Direito civil: direito de familia`
    - Autoria: Carlos Roberto Goncalves.
    - Area: Direito de Familia.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1998%3B000573696

21. `Manual de direito do consumidor`
    - Autoria: Antonio Herman V. Benjamin; Claudia Lima Marques; Leonardo Roscoe Bessa.
    - Area: Direito do Consumidor.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2008%3B000799646

22. `Curso de direito do consumidor`
    - Autoria: Rizzatto Nunes.
    - Area: Direito do Consumidor.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2014%3B001002424

## Proximo crescimento

Prioridade sugerida para v4:

- Processo Penal: Aury Lopes Jr., Guilherme de Souza Nucci, Tourinho Filho.
- Trabalhista: Mauricio Godinho Delgado, Volia Bomfim Cassar, Sergio Pinto Martins.
- Administrativo: Celso Antonio Bandeira de Mello, Maria Sylvia Zanella Di Pietro, Hely Lopes Meirelles.
- Tributario: Paulo de Barros Carvalho, Roque Antonio Carrazza, Hugo de Brito Machado.
- Empresarial: Fabio Ulhoa Coelho, Rubens Requiao, Marlon Tomazette.

Cada nova entrada deve trazer titulo canonico, autoria, area, aliases controlados, resumo seguro, limite de cautela, fontes e teste automatizado.
