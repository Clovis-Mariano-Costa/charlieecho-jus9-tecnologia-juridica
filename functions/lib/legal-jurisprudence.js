export const LEGAL_JURISPRUDENCE_CATALOG_VERSION = "catalogo-jurisprudencial-daj-v1";

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
