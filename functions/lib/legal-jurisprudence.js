export const LEGAL_JURISPRUDENCE_CATALOG_VERSION = "catalogo-jurisprudencial-daj-v1";
export const LEGAL_JURISPRUDENCE_PRECEDENTS_VERSION = "fichas-jurisprudenciais-daj-v1";

export const LEGAL_JURISPRUDENCE_THEMES = Object.freeze([
  {
    id: "propriedade_funcao_social",
    theme: "Direito de propriedade e funcao social",
    area: "Direito Civil / Direito Constitucional",
    aliases: [
      "direito de propriedade",
      "propriedade funcao social",
      "funcao social da propriedade",
      "acao reivindicatoria propriedade",
      "uso da propriedade",
      "limitacao ao direito de propriedade"
    ],
    verifiedSummary:
      "A linha segura e tratar propriedade como direito fundamental e instituto civil condicionado por funcao social, limites legais, boa-fe, prova dominial/possessoria e proporcionalidade.",
    theses: [
      "A propriedade e protegida, mas seu exercicio deve observar funcao social, limites urbanisticos, ambientais, administrativos e direitos de terceiros.",
      "Em disputa possessoria ou reivindicatoria, a qualidade da prova documental, a posse, a cadeia de dominio, a boa-fe e a finalidade social/economica do bem costumam ser pontos decisivos.",
      "Restricoes ao uso da propriedade exigem base legal, finalidade legitima e analise de proporcionalidade, especialmente quando houver impacto ambiental, urbanistico ou coletivo."
    ],
    sources: [
      {
        label: "Constituicao Federal - propriedade e funcao social",
        url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm"
      },
      {
        label: "Codigo Civil - propriedade e art. 1.228",
        url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm"
      },
      {
        label: "STF - Pesquisa de jurisprudencia",
        url: "https://portal.stf.jus.br/jurisprudencia/"
      },
      {
        label: "STJ - Pesquisa de jurisprudencia",
        url: "https://www.stj.jus.br/sites/portalp/paginas/Sob-medida/Advogado/Jurisprudencia/Pesquisa-de-Jurisprudencia.aspx"
      }
    ],
    searchTerms: [
      "funcao social da propriedade",
      "direito de propriedade limitacoes",
      "acao reivindicatoria prova dominio",
      "propriedade boa-fe posse"
    ],
    caution:
      "Nao citar processo, relator, tema vinculante ou ementa sem conferir o inteiro teor no tribunal competente."
  },
  {
    id: "alimentos_revisao_execucao",
    theme: "Alimentos, revisao e execucao",
    area: "Direito de Familia / Processo Civil",
    aliases: [
      "revisao de alimentos",
      "pensao alimenticia",
      "alimentos",
      "execucao de alimentos",
      "prisao civil alimentos",
      "alimentos avoengos",
      "exoneracao de alimentos"
    ],
    verifiedSummary:
      "A linha segura parte de necessidade, possibilidade e proporcionalidade, com revisao condicionada a mudanca relevante na situacao das partes e execucao com rito adequado ao debito.",
    theses: [
      "Fixacao e revisao de alimentos exigem leitura concreta de necessidade do alimentando, possibilidade do alimentante e proporcionalidade.",
      "Revisao ou exoneracao normalmente depende de fato novo relevante, como mudanca de renda, necessidade, capacidade laboral, maioridade ou outra circunstancia demonstrada.",
      "Na execucao pelo rito da prisao, a referencia governada e a Sumula 309/STJ e o art. 528, paragrafo 7, do CPC: o debito atual abrange ate tres prestacoes anteriores ao ajuizamento e as que vencem no curso do processo."
    ],
    sources: [
      {
        label: "Codigo Civil - alimentos",
        url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm"
      },
      {
        label: "CPC - execucao de alimentos e art. 528",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm"
      },
      {
        label: "STJ - Sumula 309",
        url: "https://arquivocidadao.stj.jus.br/index.php/sumula-309-2?listLimit=98&listPage=6&sf_culture=pt_BR&sort=alphabetic&sortDir=asc"
      },
      {
        label: "STJ - Pesquisa de jurisprudencia",
        url: "https://www.stj.jus.br/sites/portalp/paginas/Sob-medida/Advogado/Jurisprudencia/Pesquisa-de-Jurisprudencia.aspx"
      }
    ],
    searchTerms: [
      "revisao de alimentos necessidade possibilidade proporcionalidade",
      "execucao de alimentos sumula 309",
      "prisao civil alimentos art 528",
      "exoneracao de alimentos fato novo"
    ],
    caution:
      "Em familia, menor, incapaz, segredo de justica ou dados reais, a resposta e apenas orientativa e exige revisao humana qualificada."
  },
  {
    id: "responsabilidade_civil_danos",
    theme: "Responsabilidade civil, dano material, dano moral e nexo causal",
    area: "Direito Civil / Responsabilidade Civil",
    aliases: [
      "responsabilidade civil",
      "dano moral",
      "dano material",
      "nexo causal",
      "ato ilicito",
      "indenizacao por dano moral",
      "indenizacao por dano material"
    ],
    verifiedSummary:
      "A linha segura separa conduta, ilicitude ou risco, dano, nexo causal, excludentes e criterio de quantificacao, sem presumir automaticamente o dever de indenizar.",
    theses: [
      "Responsabilidade civil comum exige conduta, dano e nexo causal; culpa, risco ou responsabilidade objetiva dependem da base legal e do caso concreto.",
      "Dano moral e dano material podem ser cumulados quando decorrentes do mesmo fato, conforme Sumula 37/STJ.",
      "A quantificacao deve observar extensao do dano, proporcionalidade, razoabilidade, prova disponivel, funcao compensatoria e vedacao de enriquecimento indevido."
    ],
    sources: [
      {
        label: "Codigo Civil - ato ilicito e responsabilidade civil",
        url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm"
      },
      {
        label: "STJ - Sumula 37",
        url: "https://arquivocidadao.stj.jus.br/index.php/sum37"
      },
      {
        label: "STJ - Pesquisa de jurisprudencia",
        url: "https://www.stj.jus.br/sites/portalp/paginas/Sob-medida/Advogado/Jurisprudencia/Pesquisa-de-Jurisprudencia.aspx"
      }
    ],
    searchTerms: [
      "responsabilidade civil nexo causal",
      "dano moral dano material sumula 37",
      "quantum indenizatorio razoabilidade proporcionalidade",
      "excludente de responsabilidade civil"
    ],
    caution:
      "Nao sugerir valor de indenizacao como certeza sem tribunal, fatos, prova, periodo e comparacao com precedentes conferidos."
  },
  {
    id: "consumidor_bancos_fraudes",
    theme: "Consumidor, bancos, fraudes e fortuito interno",
    area: "Direito do Consumidor / Responsabilidade Civil Bancaria",
    aliases: [
      "direito do consumidor banco",
      "consumidor bancos",
      "fraude bancaria",
      "golpe do boleto",
      "golpe da falsa central",
      "instituicao financeira consumidor",
      "fortuito interno banco",
      "sumula 479"
    ],
    verifiedSummary:
      "A linha segura reconhece a aplicacao do CDC a instituicoes financeiras e examina defeito do servico, risco da atividade, fortuito interno, seguranca esperada e eventual culpa exclusiva demonstrada.",
    theses: [
      "O CDC e aplicavel as instituicoes financeiras, conforme Sumula 297/STJ.",
      "Fraudes e delitos de terceiros no ambito de operacoes bancarias podem configurar fortuito interno, com responsabilidade objetiva da instituicao financeira, conforme Sumula 479/STJ.",
      "Em golpes digitais, a analise deve verificar falha de seguranca, operacao fora do perfil do cliente, tratamento de dados, vulnerabilidade do consumidor e eventual excludente comprovada."
    ],
    sources: [
      {
        label: "CDC - Lei 8.078/1990",
        url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
      },
      {
        label: "STJ - Sumula 297",
        url: "https://www.stj.jus.br/docs_internet/revista/eletronica/stj-revista-sumulas-2011_23_capSumula297.pdf"
      },
      {
        label: "STJ - Sumula 479",
        url: "https://arquivocidadao.stj.jus.br/index.php/sumula-479-2"
      },
      {
        label: "STJ - Pesquisa de jurisprudencia",
        url: "https://www.stj.jus.br/sites/portalp/paginas/Sob-medida/Advogado/Jurisprudencia/Pesquisa-de-Jurisprudencia.aspx"
      }
    ],
    searchTerms: [
      "sumula 479 fraude bancaria fortuito interno",
      "sumula 297 instituicao financeira consumidor",
      "golpe do boleto responsabilidade banco",
      "transacao fora do perfil consumidor banco"
    ],
    caution:
      "Nao afirmar procedencia automatica. Conferir prova da fraude, historico da conta, medidas de seguranca, comunicacao ao banco e entendimento do tribunal local."
  },
  {
    id: "lgpd_vazamento_dados",
    theme: "LGPD, vazamento de dados e responsabilidade por tratamento irregular",
    area: "Protecao de Dados / Direito Digital / Consumidor",
    aliases: [
      "lgpd jurisprudencia",
      "vazamento de dados",
      "protecao de dados pessoais",
      "tratamento irregular de dados",
      "dados pessoais bancarios",
      "responsabilidade por vazamento de dados",
      "dano moral lgpd"
    ],
    verifiedSummary:
      "A linha segura separa dado pessoal, base legal, seguranca esperada, tratamento irregular, nexo causal, dano demonstravel e autoridade competente, sem presumir dano moral automatico.",
    theses: [
      "Protecao de dados pessoais tem assento constitucional apos a EC 115/2022 e disciplina infraconstitucional na LGPD.",
      "Tratamento pode ser irregular quando nao oferece a seguranca esperada diante dos riscos, do modo de tratamento e das tecnicas disponiveis.",
      "Em vazamento, a analise prudente exige identificar tipo de dado, origem do tratamento, agente de tratamento, falha de seguranca, nexo causal e prova do dano."
    ],
    sources: [
      {
        label: "LGPD - Lei 13.709/2018",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
      },
      {
        label: "EC 115/2022 - protecao de dados pessoais",
        url: "https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc115.htm"
      },
      {
        label: "STJ - banco responde por vazamento de dados em golpe do boleto",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2023/24102023-Banco-responde-por-vazamento-de-dados-que-resultou-em-aplicacao-do-%E2%80%9Cgolpe-do-boleto%E2%80%9D-contra-cliente.aspx"
      },
      {
        label: "ANPD - portal oficial",
        url: "https://www.gov.br/anpd/pt-br"
      }
    ],
    searchTerms: [
      "LGPD tratamento irregular art 44",
      "vazamento de dados pessoais nexo causal",
      "dados pessoais bancarios golpe do boleto",
      "dano moral LGPD jurisprudencia"
    ],
    caution:
      "Nao prometer indenizacao automatica por vazamento. Conferir tribunal, natureza dos dados, prova do dano, nexo causal e eventual orientacao da ANPD."
  },
  {
    id: "tutela_coletiva_consumidor",
    theme: "Tutela coletiva, acao civil publica e direitos difusos/coletivos",
    area: "Processo Coletivo / Direito do Consumidor",
    aliases: [
      "tutela coletiva",
      "acao civil publica",
      "direitos difusos",
      "direitos coletivos",
      "interesses individuais homogeneos",
      "processo coletivo consumidor",
      "microssistema coletivo"
    ],
    verifiedSummary:
      "A linha segura usa o microssistema coletivo, distinguindo direitos difusos, coletivos e individuais homogeneos, legitimidade ativa, adequacao da via e efeitos da decisao.",
    theses: [
      "A acao civil publica protege interesses difusos, coletivos e outros bens juridicos indicados em lei, sem substituir automaticamente toda pretensao individual.",
      "No consumidor, o CDC organiza categorias de direitos difusos, coletivos e individuais homogeneos, relevantes para legitimidade, pedidos, prova e efeitos da coisa julgada.",
      "A estrategia deve definir grupo afetado, legitimado ativo, dano coletivo, tutela inibitoria/reparatoria, prova comum e relacao com acoes individuais."
    ],
    sources: [
      {
        label: "Lei da Acao Civil Publica - Lei 7.347/1985",
        url: "https://www.planalto.gov.br/ccivil_03/leis/l7347orig.htm"
      },
      {
        label: "CDC - tutela coletiva do consumidor",
        url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
      },
      {
        label: "STJ - Pesquisa de jurisprudencia",
        url: "https://www.stj.jus.br/sites/portalp/paginas/Sob-medida/Advogado/Jurisprudencia/Pesquisa-de-Jurisprudencia.aspx"
      },
      {
        label: "STF - Pesquisa de jurisprudencia",
        url: "https://portal.stf.jus.br/jurisprudencia/"
      }
    ],
    searchTerms: [
      "acao civil publica direitos difusos coletivos individuais homogeneos",
      "microssistema coletivo consumidor",
      "legitimidade ativa acao civil publica",
      "coisa julgada coletiva consumidor"
    ],
    caution:
      "Conferir legitimidade, competencia, pedido, extensao territorial/objetiva e risco de conflito com acoes individuais antes de uso real."
  }
]);

export const LEGAL_JURISPRUDENCE_PRECEDENTS = Object.freeze([
  {
    id: "resp_2052228_df_operacoes_fora_perfil",
    themeId: "consumidor_bancos_fraudes",
    theme: "Consumidor, bancos, fraudes e fortuito interno",
    title: "Banco deve identificar e impedir operacoes que destoam do perfil do cliente",
    court: "STJ",
    caseNumber: "REsp 2.052.228/DF",
    panel: "Terceira Turma",
    rapporteur: "Ministra Nancy Andrighi",
    sourceDate: "Noticia STJ de 30/10/2023",
    aliases: [
      "resp 2052228",
      "resp 2 052 228",
      "resp 2052228 df",
      "transacoes fora do perfil",
      "operacoes fora do perfil",
      "operacoes que destoam do perfil",
      "dever de identificar transacoes fora do perfil",
      "emprestimo por estelionatario",
      "idosa banco operacao fora do perfil"
    ],
    holding:
      "A ficha segura e que a instituicao financeira deve desenvolver mecanismos capazes de identificar e impedir movimentacoes incompativeis com o historico do consumidor; a falha pode configurar defeito do servico e responsabilidade objetiva.",
    useInDaj:
      "Util para tese de fraude bancaria, emprestimo nao reconhecido, transacao atipica, consumidor vulneravel e fortuito interno.",
    caution:
      "Conferir inteiro teor, historico de operacoes, comunicacoes ao banco, perfil do consumidor e eventual excludente antes de citar em peca real.",
    sources: [
      {
        label: "STJ - noticia oficial do REsp 2.052.228",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2023/30102023-Para-evitar-fraudes--banco-tem-o-dever-de-identificar-e-impedir-transacoes-que-destoam-do-perfil-do-cliente.aspx"
      },
      {
        label: "CDC - Lei 8.078/1990",
        url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
      },
      {
        label: "STJ - Sumula 479",
        url: "https://arquivocidadao.stj.jus.br/index.php/sumula-479-2"
      }
    ]
  },
  {
    id: "resp_2077278_sp_golpe_boleto_vazamento",
    themeId: "lgpd_vazamento_dados",
    theme: "LGPD, vazamento de dados e responsabilidade por tratamento irregular",
    title: "Banco responde por vazamento de dados que viabiliza golpe do boleto",
    court: "STJ",
    caseNumber: "REsp 2.077.278/SP",
    panel: "Terceira Turma",
    rapporteur: "Ministra Nancy Andrighi",
    sourceDate: "Noticia STJ de 24/10/2023; julgado em 03/10/2023 e DJe 09/10/2023 conforme Pesquisa Pronta do STJ",
    aliases: [
      "resp 2077278",
      "resp 2 077 278",
      "resp 2077278 sp",
      "golpe do boleto",
      "vazamento de dados bancarios",
      "dados pessoais bancarios",
      "tratamento irregular dados bancarios",
      "boleto falso dados bancarios",
      "lgpd golpe do boleto"
    ],
    holding:
      "A ficha segura e que o banco pode responder por vazamento de dados sigilosos vinculados a operacao bancaria usados no golpe do boleto; dado publico isolado nao basta, e o nexo com o tratamento bancario deve ser demonstrado.",
    useInDaj:
      "Util para LGPD, consumidor bancario, boleto falso, tratamento irregular, origem dos dados, nexo causal e artigo 44 da LGPD.",
    caution:
      "Nao presumir dano ou responsabilidade automatica. Separar dados publicos de dados bancarios sigilosos e conferir prova do nexo causal.",
    sources: [
      {
        label: "STJ - noticia oficial do REsp 2.077.278",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2023/24102023-Banco-responde-por-vazamento-de-dados-que-resultou-em-aplicacao-do-%E2%80%9Cgolpe-do-boleto%E2%80%9D-contra-cliente.aspx"
      },
      {
        label: "STJ - Pesquisa Pronta sobre vazamento de dados de instituicao financeira",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2023/07122023-Pesquisa-Pronta-destaca-responsabilidade-por-vazamento-de-dados-de-instituicao-financeira-.aspx"
      },
      {
        label: "LGPD - Lei 13.709/2018",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
      }
    ]
  },
  {
    id: "resp_2222059_resp_2229519_falsa_central",
    themeId: "consumidor_bancos_fraudes",
    theme: "Consumidor, bancos, fraudes e fortuito interno",
    title: "Bancos e instituicoes de pagamento podem responder por falhas que viabilizam golpe da falsa central",
    court: "STJ",
    caseNumber: "REsp 2.222.059 e REsp 2.229.519",
    panel: "Terceira Turma",
    rapporteur: "Ministro Ricardo Villas Boas Cueva",
    sourceDate: "Noticia STJ de 21/10/2025",
    aliases: [
      "resp 2222059",
      "resp 2 222 059",
      "resp 2229519",
      "resp 2 229 519",
      "golpe da falsa central",
      "falsa central",
      "instituicoes de pagamento",
      "instituicao de pagamento",
      "falha que viabiliza falsa central"
    ],
    holding:
      "A ficha segura e que bancos e instituicoes de pagamento podem responder quando falhas de seguranca, protecao de dados ou identificacao de operacoes suspeitas permitem o golpe da falsa central.",
    useInDaj:
      "Util para fraudes digitais, engenharia social, transacao fora do padrao, instituicao de pagamento, CDC e dever de seguranca.",
    caution:
      "Verificar se houve defeito do servico e se o consumidor assumiu conscientemente risco anormal; a responsabilidade depende da prova do caso.",
    sources: [
      {
        label: "STJ - noticia oficial sobre REsp 2.222.059 e REsp 2.229.519",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2025/21102025-Bancos-e-instituicoes-de-pagamento-devem-indenizar-clientes-por-falhas-que-viabilizam-golpe-da-falsa-central.aspx"
      },
      {
        label: "CDC - Lei 8.078/1990",
        url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
      },
      {
        label: "STJ - Sumula 479",
        url: "https://arquivocidadao.stj.jus.br/index.php/sumula-479-2"
      }
    ]
  },
  {
    id: "resp_2220333_falha_seguranca_culpa_concorrente",
    themeId: "consumidor_bancos_fraudes",
    theme: "Consumidor, bancos, fraudes e fortuito interno",
    title: "Falha de seguranca bancaria pode afastar alegacao de culpa concorrente do consumidor",
    court: "STJ",
    caseNumber: "REsp 2.220.333",
    panel: "Terceira Turma",
    rapporteur: "Ministro Ricardo Villas Boas Cueva",
    sourceDate: "Noticia STJ de 13/11/2025",
    aliases: [
      "resp 2220333",
      "resp 2 220 333",
      "culpa concorrente golpe banco",
      "falha de seguranca banco culpa concorrente",
      "mao fantasma",
      "acesso remoto",
      "golpe acesso remoto banco"
    ],
    holding:
      "A ficha segura e que, havendo falha de seguranca bancaria na validacao de operacoes suspeitas, nao se presume culpa concorrente do consumidor sem prova de assuncao consciente de risco.",
    useInDaj:
      "Util para impugnar defesa generica de culpa exclusiva ou concorrente quando ha transacao atipica e falha de seguranca bancaria.",
    caution:
      "Conferir a conduta concreta do consumidor, alertas recebidos, padrao das operacoes e medidas de autenticacao antes de usar.",
    sources: [
      {
        label: "STJ - noticia oficial do REsp 2.220.333",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2025/13112025-Falha-de-seguranca-do-banco-afasta-alegacao-de-culpa-concorrente-do-consumidor-em-caso-de-golpe.aspx"
      },
      {
        label: "CDC - Lei 8.078/1990",
        url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
      }
    ]
  },
  {
    id: "resp_2001086_cdc_capital_giro",
    themeId: "consumidor_bancos_fraudes",
    theme: "Consumidor, bancos, fraudes e fortuito interno",
    title: "CDC nao se aplica automaticamente a emprestimo para capital de giro",
    court: "STJ",
    caseNumber: "REsp 2.001.086",
    panel: "Terceira Turma",
    rapporteur: "Ministra Nancy Andrighi",
    sourceDate: "Noticia STJ de 16/02/2023",
    aliases: [
      "resp 2001086",
      "resp 2 001 086",
      "capital de giro",
      "cdc nao se aplica capital de giro",
      "emprestimo para atividade empresarial",
      "credito para atividade produtiva",
      "vulnerabilidade capital de giro"
    ],
    holding:
      "A ficha segura e que o CDC nao incide automaticamente sobre emprestimo destinado a capital de giro ou atividade empresarial, salvo demonstracao de vulnerabilidade e enquadramento juridico adequado.",
    useInDaj:
      "Util para triagem de contratos bancarios empresariais, distincao entre destinatario final e insumo produtivo, e prova de vulnerabilidade.",
    caution:
      "Nao afastar CDC sem examinar porte, vulnerabilidade tecnica/economica/informacional, finalidade do credito e provas contratuais.",
    sources: [
      {
        label: "STJ - noticia oficial do REsp 2.001.086",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2023/16022023-CDC-nao-se-aplica-a-contratos-de-emprestimo-para-capital-de-giro.aspx"
      },
      {
        label: "CDC - Lei 8.078/1990",
        url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
      }
    ]
  },
  {
    id: "resp_2029511_passagem_forcada_possuidor",
    themeId: "propriedade_funcao_social",
    theme: "Direito de propriedade e funcao social",
    title: "Possuidor de imovel encravado tem direito a passagem forcada",
    court: "STJ",
    caseNumber: "REsp 2.029.511",
    panel: "Terceira Turma",
    rapporteur: "Ministra Nancy Andrighi",
    sourceDate: "Noticia STJ de 06/06/2023",
    aliases: [
      "resp 2029511",
      "resp 2 029 511",
      "passagem forcada possuidor",
      "imovel encravado",
      "funcao social propriedade posse",
      "funcao social da posse",
      "passagem forcada imovel encravado"
    ],
    holding:
      "A ficha segura e que o possuidor de imovel encravado pode pleitear passagem forcada, com leitura do artigo 1.285 do Codigo Civil orientada pela funcao social e economica da propriedade e da posse.",
    useInDaj:
      "Util para propriedade, posse, passagem forcada, vizinhanca, abuso no exercicio do direito e funcao social.",
    caution:
      "Conferir encravamento real, rota menos onerosa, indenizacao, posse qualificada e peculiaridades locais antes de usar.",
    sources: [
      {
        label: "STJ - noticia oficial do REsp 2.029.511",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2023/06062023-Possuidor-de-imovel-encravado-tem-direito-a-passagem-forcada.aspx"
      },
      {
        label: "Codigo Civil - art. 1.285",
        url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm"
      }
    ]
  },
  {
    id: "stj_alimentos_prisao_sem_risco_subsistencia",
    themeId: "alimentos_revisao_execucao",
    theme: "Alimentos, revisao e execucao",
    title: "Prisao de devedor de alimentos pode ser revogada se ausente risco a subsistencia da alimentanda",
    court: "STJ",
    caseNumber: "Processo em segredo de justica",
    panel: "Terceira Turma",
    rapporteur: "Ministro Marco Aurelio Bellizze",
    sourceDate: "Noticia STJ de 26/10/2023",
    aliases: [
      "prisao devedor alimentos falta risco subsistencia",
      "prisao de devedor de alimentos por falta de risco a subsistencia",
      "prisao de devedor de alimentos falta de risco a subsistencia",
      "falta de risco a subsistencia da alimentanda",
      "revoga prisao alimentos risco subsistencia",
      "alimentanda maior formada direito socia empresa",
      "execucao de alimentos sem risco subsistencia",
      "prisao civil alimentos risco subsistencia"
    ],
    holding:
      "A ficha segura e que a prisao civil por alimentos exige necessidade atual ligada a subsistencia; se ausente esse risco, pode ser afastada, sem impedir que a execucao pode prosseguir pelo rito expropriatorio.",
    useInDaj:
      "Util para avaliar proporcionalidade da prisao civil, maioridade, autonomia economica, subsistencia e alternativa de expropriacao.",
    caution:
      "O processo tramita em segredo de justica. Nao inventar numero; citar apenas a noticia oficial ou buscar precedente conferido equivalente.",
    sources: [
      {
        label: "STJ - noticia oficial sobre prisao civil por alimentos e subsistencia",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2023/26102023-Terceira-Turma-revoga-prisao-de-devedor-de-alimentos-por-falta-de-risco-a-subsistencia-da-alimentanda.aspx"
      },
      {
        label: "CPC - execucao de alimentos e art. 528",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm"
      }
    ]
  },
  {
    id: "stj_alimentos_penhora_prestacoes_vencidas",
    themeId: "alimentos_revisao_execucao",
    theme: "Alimentos, revisao e execucao",
    title: "Execucao de alimentos pelo rito da penhora permite incluir prestacoes vencidas no curso do processo",
    court: "STJ",
    caseNumber: "Processo em segredo de justica",
    panel: "Quarta Turma",
    rapporteur: "Ministro Antonio Carlos Ferreira",
    sourceDate: "Noticia STJ de 27/10/2023",
    aliases: [
      "rito da penhora prestacoes vencidas no curso",
      "execucao de alimentos rito da penhora parcelas vencidas",
      "prestacoes vencidas no curso do processo alimentos",
      "alimentos penhora parcelas vencidas no curso",
      "execucao alimentos penhora prestacoes futuras"
    ],
    holding:
      "A ficha segura e que, no rito da penhora, a execucao de alimentos pode incluir prestacoes vencidas durante o processo, em leitura sistematica que evita nova acao ou uso desnecessario do rito da prisao.",
    useInDaj:
      "Util para atualizacao de debito alimentar, economia processual, rito expropriatorio e distincao entre penhora e prisao.",
    caution:
      "O processo tramita em segredo de justica. Nao inventar numero; conferir atualizacao do entendimento antes de citar.",
    sources: [
      {
        label: "STJ - noticia oficial sobre execucao de alimentos pelo rito da penhora",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2023/27102023-Execucao-de-alimentos-pelo-rito-da-penhora-permite-inclusao-de-prestacoes-vencidas-no-curso-do-processo.aspx"
      },
      {
        label: "CPC - execucao de alimentos e art. 528",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm"
      }
    ]
  },
  {
    id: "resp_1955899_execucao_sentenca_coletiva_associacao",
    themeId: "tutela_coletiva_consumidor",
    theme: "Tutela coletiva, acao civil publica e direitos difusos",
    title: "Execucao de sentenca coletiva por associacao autora e subsidiaria e condicionada",
    court: "STJ",
    caseNumber: "REsp 1.955.899",
    panel: "Terceira Turma",
    rapporteur: "Ministra Nancy Andrighi",
    sourceDate: "Noticia STJ de 17/08/2022",
    aliases: [
      "resp 1955899",
      "resp 1 955 899",
      "execucao sentenca coletiva associacao",
      "execucao de sentenca coletiva pela associacao autora",
      "direitos individuais homogeneos associacao autora",
      "fluid recovery",
      "artigo 100 cdc",
      "art 100 cdc"
    ],
    holding:
      "A ficha segura e que a associacao autora da acao civil publica pode promover cumprimento coletivo de sentenca de direitos individuais homogeneos, mas sua legitimidade e subsidiaria e condicionada ao artigo 100 do CDC.",
    useInDaj:
      "Util para tutela coletiva do consumidor, execucao coletiva, habilitacao de beneficiarios, fluid recovery e legitimidade subsidiaria.",
    caution:
      "Conferir legitimidade ativa, estatuto, abrangencia subjetiva, numero de habilitados e compatibilidade com a gravidade do dano.",
    sources: [
      {
        label: "STJ - noticia oficial do REsp 1.955.899",
        url: "https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/17082022-Execucao-de-sentenca-coletiva-de-direitos-individuais-homogeneos-pela-associacao-autora-e-sujeita-a-condicoes.aspx"
      },
      {
        label: "CDC - tutela coletiva do consumidor",
        url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"
      }
    ]
  }
]);

export function normalizeJurisprudenceText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasJurisprudenceIntent(value) {
  const q = normalizeJurisprudenceText(value);
  if (/\b(sem citar jurisprudencia|sem jurisprudencia|sem citar julgado|sem citar julgados|sem julgado|sem julgados|sem acordao|sem acordaos|sem precedente|sem precedentes)\b/.test(q)) return false;
  return /\b(jurisprudencia|precedente|precedentes|julgado|julgados|acordao|acordaos|entendimento dos tribunais|tese dos tribunais|sumula|sumulas|repetitivo|repetitivos|tema repetitivo|pesquisa jurisprudencial)\b/.test(q);
}

export function findVerifiedLegalJurisprudenceTheme(value) {
  const q = normalizeJurisprudenceText(value);
  if (!q || !hasJurisprudenceIntent(q)) return null;

  const matches = [];

  LEGAL_JURISPRUDENCE_THEMES.forEach((entry, entryIndex) => {
    const candidates = [entry.theme, ...(entry.aliases || [])]
      .map(normalizeJurisprudenceText)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    const matchedCandidate = candidates.find((candidate) => q.includes(candidate));
    if (!matchedCandidate) return;

    matches.push({
      entry,
      entryIndex,
      candidateLength: matchedCandidate.length
    });
  });

  if (!matches.length) return null;

  matches.sort((a, b) =>
    (b.candidateLength - a.candidateLength) ||
    (a.entryIndex - b.entryIndex)
  );

  return matches[0].entry;
}

function hasSpecificPrecedentSignal(value) {
  const q = normalizeJurisprudenceText(value);
  if (!q) return false;
  if (!hasJurisprudenceIntent(q) && !/\b(resp|aresp|rhc|hc|agint|agrg|eresp|sumula|tema|ementa|inteiro teor|relator|relatora|processo|acordao|ficha)\b/.test(q)) return false;
  return true;
}

export function findVerifiedLegalJurisprudencePrecedent(value) {
  const q = normalizeJurisprudenceText(value);
  if (!q || !hasSpecificPrecedentSignal(q)) return null;

  const matches = [];

  LEGAL_JURISPRUDENCE_PRECEDENTS.forEach((entry, entryIndex) => {
    const candidates = [
      entry.caseNumber,
      entry.title,
      entry.rapporteur,
      ...(entry.aliases || [])
    ]
      .map(normalizeJurisprudenceText)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    const matchedCandidate = candidates.find((candidate) => q.includes(candidate));
    if (!matchedCandidate) return;

    matches.push({
      entry,
      entryIndex,
      candidateLength: matchedCandidate.length
    });
  });

  if (!matches.length) return null;

  matches.sort((a, b) =>
    (b.candidateLength - a.candidateLength) ||
    (a.entryIndex - b.entryIndex)
  );

  return matches[0].entry;
}

export function buildVerifiedLegalJurisprudencePrecedentAnswer(entry) {
  if (!entry) return "";

  const sourceLines = (entry.sources || []).map((source) => `- ${source.label}: ${source.url}`);

  return [
    `Encontrei uma ficha jurisprudencial governada (${LEGAL_JURISPRUDENCE_PRECEDENTS_VERSION}).`,
    "",
    `Tema DAJ: ${entry.theme}.`,
    `Ficha: ${entry.title}.`,
    `Tribunal: ${entry.court}.`,
    `Processo/referencia: ${entry.caseNumber}.`,
    `Orgao julgador: ${entry.panel}.`,
    `Relatoria: ${entry.rapporteur}.`,
    `Fonte-base: ${entry.sourceDate}.`,
    "",
    `Tese governada: ${entry.holding}`,
    "",
    `Uso no DAJ: ${entry.useInDaj}`,
    "",
    "Fontes oficiais para conferencia:",
    ...sourceLines,
    "",
    `Limite: ${entry.caution}`,
    "",
    "Proximo passo: posso transformar esta ficha em argumento de peticao, checklist probatorio ou quadro comparativo, mantendo revisao humana antes de uso real."
  ].join("\n");
}

export function buildVerifiedLegalJurisprudencePrecedentContext(entry) {
  if (!entry) return "";

  const sources = (entry.sources || [])
    .map((source) => `${source.label} ${source.url}`)
    .join(" ; ");

  return [
    "[FICHA JURISPRUDENCIAL DAJ GOVERNADA]",
    `Versao: ${LEGAL_JURISPRUDENCE_PRECEDENTS_VERSION}.`,
    `Tema DAJ: ${entry.theme}.`,
    `Ficha: ${entry.title}.`,
    `Tribunal: ${entry.court}.`,
    `Processo/referencia: ${entry.caseNumber}.`,
    `Orgao julgador: ${entry.panel}.`,
    `Relatoria: ${entry.rapporteur}.`,
    `Fonte-base: ${entry.sourceDate}.`,
    `Tese governada: ${entry.holding}`,
    `Uso no DAJ: ${entry.useInDaj}`,
    `Limite: ${entry.caution}`,
    `Fontes: ${sources}`
  ].join("\n");
}

export function buildVerifiedLegalJurisprudenceAnswer(entry) {
  if (!entry) return "";

  const thesisLines = (entry.theses || []).map((item, index) => `${index + 1}. ${item}`);
  const sourceLines = (entry.sources || []).map((source) => `- ${source.label}: ${source.url}`);
  const searchTermLines = (entry.searchTerms || []).map((term) => `- ${term}`);

  return [
    `Encontrei uma trilha jurisprudencial governada (${LEGAL_JURISPRUDENCE_CATALOG_VERSION}).`,
    "",
    `Tema: ${entry.theme}.`,
    `Area: ${entry.area}.`,
    "",
    `Sintese segura: ${entry.verifiedSummary}`,
    "",
    "Teses pesquisaveis, sem inventar julgado:",
    ...thesisLines,
    "",
    "Fontes oficiais para conferencia:",
    ...sourceLines,
    "",
    "Termos de busca sugeridos:",
    ...searchTermLines,
    "",
    `Limite: ${entry.caution}`,
    "",
    "Proximo passo: posso montar uma ficha de jurisprudencia com tribunal, processo, relator, orgao julgador, data, tese, ementa e inteiro teor quando voce trouxer um julgado ou pedir conferencia especifica."
  ].join("\n");
}

export function buildVerifiedLegalJurisprudenceContext(entry) {
  if (!entry) return "";

  const sources = (entry.sources || [])
    .map((source) => `${source.label} ${source.url}`)
    .join(" ; ");
  const theses = (entry.theses || []).join(" | ");

  return [
    "[CATALOGO JURISPRUDENCIAL DAJ GOVERNADO]",
    `Versao: ${LEGAL_JURISPRUDENCE_CATALOG_VERSION}.`,
    `Tema: ${entry.theme}.`,
    `Area: ${entry.area}.`,
    `Sintese segura: ${entry.verifiedSummary}`,
    `Teses pesquisaveis: ${theses}`,
    `Limite: ${entry.caution}`,
    `Fontes: ${sources}`
  ].join("\n");
}
