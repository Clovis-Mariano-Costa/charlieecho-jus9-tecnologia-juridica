# Catalogo Jurisprudencial DAJ Governado v1

Origem: Charlie Echo da Costa / Jus 9 Tecnologia Juridica
Versao operacional: `catalogo-jurisprudencial-daj-v1`
Arquivo tecnico: `functions/lib/legal-jurisprudence.js`
Modulo piloto: DAJ Advogados

## Finalidade

Este catalogo impede que Charlie Echo responda pedidos de jurisprudencia com texto repetitivo ou com julgados inventados. A resposta correta para tema governado deve trazer sintese segura, teses pesquisaveis, fontes oficiais, termos de busca e limite de uso.

Regra central: Charlie pode apontar linhas jurisprudenciais e fontes oficiais, mas nao deve inventar processo, relator, tribunal, data, ementa, tese vinculante ou inteiro teor. Julgado especifico so entra quando houver fonte oficial conferida.

## Temas v1

1. `Direito de propriedade e funcao social`
   - Area: Direito Civil / Direito Constitucional.
   - Linha segura: propriedade como direito fundamental e instituto civil condicionado por funcao social, limites legais, boa-fe, prova dominial/possessoria e proporcionalidade.
   - Fontes:
     - Constituicao Federal: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
     - Codigo Civil: https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm
     - STF Pesquisa de jurisprudencia: https://portal.stf.jus.br/jurisprudencia/
     - STJ Pesquisa de jurisprudencia: https://www.stj.jus.br/sites/portalp/paginas/Sob-medida/Advogado/Jurisprudencia/Pesquisa-de-Jurisprudencia.aspx

2. `Alimentos, revisao e execucao`
   - Area: Direito de Familia / Processo Civil.
   - Linha segura: necessidade, possibilidade e proporcionalidade, com revisao condicionada a mudanca relevante na situacao das partes e execucao conforme rito adequado.
   - Fontes:
     - Codigo Civil: https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm
     - CPC: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm
     - STJ Sumula 309: https://arquivocidadao.stj.jus.br/index.php/sumula-309-2?listLimit=98&listPage=6&sf_culture=pt_BR&sort=alphabetic&sortDir=asc
     - STJ Pesquisa de jurisprudencia: https://www.stj.jus.br/sites/portalp/paginas/Sob-medida/Advogado/Jurisprudencia/Pesquisa-de-Jurisprudencia.aspx

3. `Responsabilidade civil, dano material, dano moral e nexo causal`
   - Area: Direito Civil / Responsabilidade Civil.
   - Linha segura: separar conduta, ilicitude ou risco, dano, nexo causal, excludentes e criterio de quantificacao, sem presumir automaticamente o dever de indenizar.
   - Fontes:
     - Codigo Civil: https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm
     - STJ Sumula 37: https://arquivocidadao.stj.jus.br/index.php/sum37
     - STJ Pesquisa de jurisprudencia: https://www.stj.jus.br/sites/portalp/paginas/Sob-medida/Advogado/Jurisprudencia/Pesquisa-de-Jurisprudencia.aspx

4. `Consumidor, bancos, fraudes e fortuito interno`
   - Area: Direito do Consumidor / Responsabilidade Civil Bancaria.
   - Linha segura: CDC aplicavel a instituicoes financeiras, defeito do servico, risco da atividade, fortuito interno, seguranca esperada e eventual culpa exclusiva demonstrada.
   - Fontes:
     - CDC: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
     - STJ Sumula 297: https://www.stj.jus.br/docs_internet/revista/eletronica/stj-revista-sumulas-2011_23_capSumula297.pdf
     - STJ Sumula 479: https://arquivocidadao.stj.jus.br/index.php/sumula-479-2
     - STJ Pesquisa de jurisprudencia: https://www.stj.jus.br/sites/portalp/paginas/Sob-medida/Advogado/Jurisprudencia/Pesquisa-de-Jurisprudencia.aspx

5. `LGPD, vazamento de dados e responsabilidade por tratamento irregular`
   - Area: Protecao de Dados / Direito Digital / Consumidor.
   - Linha segura: separar dado pessoal, base legal, seguranca esperada, tratamento irregular, nexo causal, dano demonstravel e autoridade competente.
   - Fontes:
     - LGPD: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
     - EC 115/2022: https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc115.htm
     - STJ - banco responde por vazamento de dados em golpe do boleto: https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2023/24102023-Banco-responde-por-vazamento-de-dados-que-resultou-em-aplicacao-do-%E2%80%9Cgolpe-do-boleto%E2%80%9D-contra-cliente.aspx
     - ANPD: https://www.gov.br/anpd/pt-br

6. `Tutela coletiva, acao civil publica e direitos difusos`
   - Area: Processo Coletivo / Direito do Consumidor.
   - Linha segura: microssistema coletivo, distinguindo direitos difusos, coletivos e individuais homogeneos, legitimidade ativa, adequacao da via e efeitos da decisao.
   - Fontes:
     - Lei da Acao Civil Publica: https://www.planalto.gov.br/ccivil_03/leis/l7347orig.htm
     - CDC: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
     - STJ Pesquisa de jurisprudencia: https://www.stj.jus.br/sites/portalp/paginas/Sob-medida/Advogado/Jurisprudencia/Pesquisa-de-Jurisprudencia.aspx
     - STF Pesquisa de jurisprudencia: https://portal.stf.jus.br/jurisprudencia/

## Regras de resposta

- Responder com trilha governada quando o pedido mencionar jurisprudencia, precedente, julgado, acordao, sumula, repetitivo, entendimento dos tribunais ou tese dos tribunais e o tema estiver catalogado.
- Nao acionar o catalogo quando o usuario pedir explicacao sem jurisprudencia ou disser expressamente "sem citar julgados".
- Separar sintese, teses pesquisaveis, fontes oficiais, termos de busca e limite.
- Nao transformar fonte secundaria, noticia ou resumo em substituto de inteiro teor.
- Quando o usuario pedir julgado especifico, pedir ou buscar fonte oficial e preencher ficha com tribunal, processo, relator, orgao julgador, data, tese, ementa e inteiro teor.

## Proximo crescimento

Prioridade sugerida para v2:

- Precedentes governados com ficha completa para propriedade, alimentos, consumidor bancario, LGPD, responsabilidade civil e tutela coletiva.
- Temas por tribunal local: TJSC, TJSP, TJRJ, TJRS e TRFs conforme foco do DAJ.
- Integracao com Google Drive: salvar fichas jurisprudenciais conferidas no Cartorio Digital Charlie Echo.
- Replicacao por MVP: DEJI para contratos empresariais, DPJ para pericia, DAP para autoridade policial, DIC para cidadao.
