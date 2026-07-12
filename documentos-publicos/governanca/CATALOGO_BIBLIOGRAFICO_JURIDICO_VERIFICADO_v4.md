# Catalogo Bibliografico Juridico Verificado v4

Origem: Charlie Echo da Costa / Jus 9 Tecnologia Juridica
Versao operacional: `catalogo-bibliografico-juridico-v4`
Arquivo tecnico: `functions/lib/legal-bibliography.js`
Substitui e amplia: `CATALOGO_BIBLIOGRAFICO_JURIDICO_VERIFICADO_v3.md`

## Finalidade

Este catalogo reduz erro material grave em perguntas sobre obra, livro, autor, autoria, edicao, editora, ISBN, paginas, citacao literal, resenha ou bibliografia juridica.

A versao v4 amplia o nucleo de litigios e consultoria do DAJ, cobrindo Processo Penal, Trabalhista, Administrativo, Tributario e Empresarial. Tambem melhora a selecao tecnica quando ha titulos genericos repetidos entre autores diferentes.

## Regra nova de desambiguacao

- Se o usuario cita autor, sobrenome ou forma usual do autor, a ficha desse autor prevalece sobre titulo generico.
- Se duas obras compartilham o mesmo titulo generico e o usuario nao desambigua por autoria, Charlie nao deve transformar ambiguidade em certeza.
- Exemplos de titulos sensiveis: `Curso de direito tributario`, `Direito do trabalho`, `Curso de direito comercial`.

## Nucleo v4

1. `Direito processual penal`
   - Autoria: Aury Lopes Jr.
   - Area: Direito Processual Penal.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2015%3B001025999

2. `Manual de processo penal`
   - Autoria: Guilherme de Souza Nucci.
   - Area: Direito Processual Penal.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2021%3B001213743

3. `Processo penal`
   - Autoria: Fernando da Costa Tourinho Filho.
   - Area: Direito Processual Penal.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1975%3B000017214

4. `Curso de direito do trabalho`
   - Autoria: Mauricio Godinho Delgado.
   - Area: Direito do Trabalho.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2020%3B001187555

5. `Direito do trabalho`
   - Autoria: Volia Bomfim Cassar.
   - Area: Direito do Trabalho.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2017%3B001107858

6. `Direito do trabalho`
   - Autoria: Sergio Pinto Martins.
   - Area: Direito do Trabalho.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2002%3B000642746

7. `Curso de direito administrativo`
   - Autoria: Celso Antonio Bandeira de Mello.
   - Area: Direito Administrativo.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2019%3B001145029

8. `Direito administrativo`
   - Autoria: Maria Sylvia Zanella Di Pietro.
   - Area: Direito Administrativo.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2009%3B000858517

9. `Direito administrativo brasileiro`
   - Autoria: Hely Lopes Meirelles.
   - Area: Direito Administrativo.
   - Fonte:
     - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2002%3B000617225

10. `Curso de direito tributario`
    - Autoria: Hugo de Brito Machado.
    - Area: Direito Tributario.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1978%3B000033855

11. `Curso de direito tributario`
    - Autoria: Paulo de Barros Carvalho.
    - Area: Direito Tributario.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2000%3B000591321

12. `Curso de direito constitucional tributario`
    - Autoria: Roque Antonio Carrazza.
    - Area: Direito Tributario / Direito Constitucional Tributario.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2017%3B001087719

13. `Curso de direito comercial: direito de empresa`
    - Autoria: Fabio Ulhoa Coelho.
    - Area: Direito Empresarial / Direito Comercial.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2000%3B000579481

14. `Curso de direito empresarial`
    - Autoria: Marlon Tomazette.
    - Area: Direito Empresarial.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2018%3B001129857

15. `Curso de direito comercial`
    - Autoria: Rubens Requiao.
    - Area: Direito Empresarial / Direito Comercial.
    - Fonte:
      - https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2008%3B000827044

## Proximo crescimento

Prioridade sugerida para v5:

- Previdenciario: Daniel Machado da Rocha, Jose Antonio Savaris, Frederico Amado.
- Ambiental: Paulo Affonso Leme Machado, Edis Milare, Antonio Herman Benjamin.
- Constitucional aprofundado: Ingo Wolfgang Sarlet, Gilmar Mendes, Paulo Bonavides.
- Civil/Contratos/Responsabilidade: Judith Martins-Costa, Sergio Cavalieri Filho, Arnaldo Rizzardo.

Cada nova entrada deve trazer titulo canonico, autoria, area, aliases controlados, resumo seguro, limite de cautela, fontes e teste automatizado.
