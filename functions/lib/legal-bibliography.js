export const LEGAL_BIBLIOGRAPHY_CATALOG_VERSION = "catalogo-bibliografico-juridico-v1";

export const LEGAL_BIBLIOGRAPHY_CATALOG = Object.freeze([
  {
    id: "moderna_teoria_fato_punivel",
    kind: "obra",
    title: "A moderna teoria do fato punivel",
    authors: ["Juarez Cirino dos Santos"],
    area: "Direito Penal / teoria do delito",
    aliases: [
      "a moderna teoria do fato punivel",
      "moderna teoria do fato punivel",
      "a nova teoria do fato punivel",
      "nova teoria do fato punivel",
      "teoria do fato punivel"
    ],
    verifiedSummary:
      "Obra de dogmatica penal sobre fato punivel/crime e categorias modernas da teoria do delito. Trate 'nova' como possivel variacao imprecisa do titulo.",
    caution:
      "Nao atribuir a outro penalista sem fonte. Nao inventar paginas, citacoes literais, capitulos ou edicao especifica sem consulta ao exemplar.",
    sources: [
      {
        label: "LexML",
        url: "https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2000%3B000578592"
      },
      {
        label: "Acervo TJRJ Sophia",
        url: "https://www3.tjrj.jus.br/sophia_web/acervo/detalhe/19139"
      }
    ]
  },
  {
    id: "teoria_pura_direito",
    kind: "obra",
    title: "Teoria pura do direito",
    authors: ["Hans Kelsen"],
    area: "Teoria do Direito / positivismo juridico",
    aliases: [
      "teoria pura do direito",
      "pure theory of law"
    ],
    verifiedSummary:
      "Obra classica de teoria do direito associada ao projeto kelseniano de ciencia juridica e normatividade.",
    caution:
      "Ha multiplas edicoes e traducoes. Informe traducao, editora, ano ou pagina somente quando a fonte do exemplar estiver conferida.",
    sources: [
      {
        label: "LexML",
        url: "https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1998%3B000199876"
      }
    ]
  },
  {
    id: "luta_pelo_direito",
    kind: "obra",
    title: "A luta pelo direito",
    authors: ["Rudolf von Ihering"],
    area: "Teoria do Direito / filosofia juridica",
    aliases: [
      "a luta pelo direito",
      "luta pelo direito",
      "jhering luta pelo direito",
      "ihering luta pelo direito"
    ],
    verifiedSummary:
      "Obra classica sobre a defesa ativa do direito, com edicoes em portugues registradas em catalogos juridicos.",
    caution:
      "O sobrenome aparece em catalogos como Ihering, Jhering ou von Ihering. Nao inventar tradutor, edicao ou pagina sem fonte.",
    sources: [
      {
        label: "LexML",
        url: "https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2005%3B000857702"
      },
      {
        label: "LexML - registro Forense 2004",
        url: "https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2004%3B000728241"
      }
    ]
  },
  {
    id: "dos_delitos_e_das_penas",
    kind: "obra",
    title: "Dos delitos e das penas",
    authors: ["Cesare Beccaria"],
    area: "Direito Penal / criminologia classica",
    aliases: [
      "dos delitos e das penas",
      "delitos e penas",
      "dei delitti e delle pene"
    ],
    verifiedSummary:
      "Obra classica de Cesare Beccaria sobre fundamentos humanitarios, legalidade e racionalidade da pena.",
    caution:
      "Ha muitas edicoes e traducoes. Nao inventar texto literal, tradutor, pagina ou ano sem conferir o exemplar.",
    sources: [
      {
        label: "LexML",
        url: "https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A1937%3B000170552"
      },
      {
        label: "LexML - registro Russel 2006",
        url: "https://www.lexml.gov.br/urn/urn%3Alex%3Abr%3Arede.virtual.bibliotecas%3Alivro%3A2006%3B000859343"
      }
    ]
  }
]);

export function normalizeBibliographicText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findVerifiedLegalBibliographyEntry(value) {
  const q = normalizeBibliographicText(value);
  if (!q) return null;

  for (const entry of LEGAL_BIBLIOGRAPHY_CATALOG) {
    const candidates = [entry.title, ...(entry.aliases || [])]
      .map(normalizeBibliographicText)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    if (candidates.some((candidate) => q.includes(candidate))) {
      return entry;
    }
  }

  return null;
}

export function buildVerifiedLegalBibliographyAnswer(entry) {
  if (!entry) return "";

  const sourceLines = (entry.sources || [])
    .map((source) => `- ${source.label}: ${source.url}`);

  return [
    `Encontrei uma ficha bibliografica governada no catalogo interno (${LEGAL_BIBLIOGRAPHY_CATALOG_VERSION}).`,
    "",
    `Obra: ${entry.title}.`,
    `Autoria: ${entry.authors.join("; ")}.`,
    `Area: ${entry.area}.`,
    "",
    `Leitura segura: ${entry.verifiedSummary}`,
    "",
    `Limite: ${entry.caution}`,
    "",
    "Fontes para conferencia:",
    ...sourceLines,
    "",
    "Proximo passo: posso montar uma ficha de leitura, resumo doutrinario ou roteiro de pesquisa, separando o que esta conferido do que exige consulta ao exemplar."
  ].join("\n");
}

export function buildVerifiedLegalBibliographyContext(entry) {
  if (!entry) return "";

  const sources = (entry.sources || [])
    .map((source) => `${source.label} ${source.url}`)
    .join(" ; ");

  return [
    "[CATALOGO BIBLIOGRAFICO JURIDICO VERIFICADO]",
    `Versao: ${LEGAL_BIBLIOGRAPHY_CATALOG_VERSION}.`,
    `Obra: ${entry.title}.`,
    `Autoria: ${entry.authors.join("; ")}.`,
    `Area: ${entry.area}.`,
    `Leitura segura: ${entry.verifiedSummary}`,
    `Limite: ${entry.caution}`,
    `Fontes: ${sources}`
  ].join("\n");
}
