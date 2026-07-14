import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const { onRequestPost } = await import("../functions/api/ia.js");
const { findVerifiedLegalBibliographyEntry } = await import("../functions/lib/legal-bibliography.js");
const {
  findVerifiedLegalJurisprudencePrecedent,
  findVerifiedLegalJurisprudenceTheme
} = await import("../functions/lib/legal-jurisprudence.js");

async function postIa(message, env = {}, options = {}) {
  const internalToken = String(env.JUS9_CHARLIE_INTERNAL_TOKEN || "test-charlie-internal-token");
  const requestHeaders = { "Content-Type": "application/json" };
  if (options.authorized !== false) requestHeaders.Authorization = `Bearer ${internalToken}`;
  return onRequestPost({
    env: { ...env, JUS9_CHARLIE_INTERNAL_TOKEN: internalToken },
    request: new Request("https://charlieecho.test/api/ia", {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        message,
        mode: "profissional",
        requestId: options.requestId || "test-request-id",
        ...(options.route ? { route: options.route } : {})
      })
    })
  });
}

test("document download requests do not fall into guided legal research", async () => {
  const response = await postIa("minuta de peticao revisao de alimentos. Quero um link para download");
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.ok, false);
  assert.equal(body.governance.targetMvp, "DAJ_ADVOGADOS");
  assert.equal(body.governance.driveMemory.official, true);
  assert.doesNotMatch(String(body.answer || body.error || ""), /Para pesquisar/i);
  assert.doesNotMatch(String(body.answer || body.error || ""), /Fontes recomendadas/i);
});

test("structured name lookup never calls OpenAI or creates a legal draft", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("structured lookup must not call external fetch");
  };
  try {
    const response = await postIa(
      "Consulte processo por nome da parte no DAJ",
      { OPENAI_API_KEY: "test-key" },
      { route: { operation: "consulta_processual_por_nome", searchType: "nome" } }
    );
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(calls, 0);
    assert.equal(body.governance.operation, "consulta_processual_por_nome");
    assert.equal(body.structuredLookup.generativeModelCalled, false);
    assert.equal(body.structuredLookup.inventedResults, false);
    assert.match(body.answer, /endpoint autenticado \/api\/judicial\/parties\/search/i);
    assert.doesNotMatch(body.answer, /minuta|peticao demonstrativa|excelentissimo/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("structured CPF lookup inferred from message fails closed without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("structured lookup must not call external fetch");
  };
  try {
    const response = await postIa("Pesquise processos pelo CPF no DAJ", { OPENAI_API_KEY: "test-key" });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(calls, 0);
    assert.equal(body.governance.operation, "consulta_processual_por_cpf");
    assert.match(body.answer, /aguardando orientacao oficial/i);
    assert.doesNotMatch(body.answer, /minuta|peticao demonstrativa|resultado 1/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("governed DAJ analysis route reaches OpenAI instead of structured DAJ lookup", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: [
        "Sintese fiel dos fatos: o relato ambiental ficticio requer apuracao sem presumir autoria ou enquadramento.",
        "Riscos e urgencias: nao ha prazo confirmado; o sigilo informado deve ser preservado.",
        "Documentos faltantes: identificacao do fato, local, data e eventuais registros oficiais.",
        "Perguntas objetivas: houve comunicacao a autoridade ambiental e existe documento comprobatorio?",
        "Proximos atos: a equipe deve conferir os fatos; a Charlie pode organizar documentos e fontes.",
        "Fontes a consultar: legislacao ambiental vigente e bases oficiais, sem inventar citacao.",
        "Limites: nao e possivel concluir autoria, tipificacao ou prazo com os dados atuais."
      ].join("\n\n")
    });
  };

  try {
    const message = [
      "[ANALISE DAJ GOVERNADA]",
      "Analise o DAJ abaixo, lido agora do cadastro oficial governado da Jus 9.",
      "Identificador: DAJ-2026-0001",
      "Area informada: Ambiental",
      "Resumo do caso: relato ficticio de possivel dano a ave.",
      "Entregue fontes oficiais a consultar, sem inventar citacao."
    ].join("\n");
    const response = await postIa(
      message,
      { OPENAI_API_KEY: "test-key", JUS9_MODEL_DEFAULT: "test-model" },
      {
        route: {
          id: "daj_analise_governada",
          apiFirst: true,
          useRoomMemory: false,
          allowLocalFallback: false,
          dajId: "DAJ-2026-0001"
        }
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(body.governance.operation, "analise_daj_governada");
    assert.match(body.answer, /relato ambiental ficticio/i);
    assert.doesNotMatch(body.answer, /consulta por DAJ deve ser executada|indice estruturado/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("incomplete governed DAJ route cannot bypass structured lookup guard", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("invalid governed route must not call OpenAI");
  };

  try {
    const response = await postIa(
      [
        "[ANALISE DAJ GOVERNADA]",
        "Analise o DAJ e entregue fontes a consultar.",
        "Identificador: DAJ-2026-0001"
      ].join("\n"),
      { OPENAI_API_KEY: "test-key" },
      {
        route: {
          id: "daj_analise_governada",
          apiFirst: true,
          useRoomMemory: false,
          allowLocalFallback: true,
          dajId: "DAJ-2026-0001"
        }
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(calls, 0);
    assert.equal(body.governance.operation, "consulta_daj_por_id");
    assert.match(body.answer, /indice estruturado e autenticado/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("document download typo donwload does not fall into guided legal research", async () => {
  const response = await postIa("quero link para donwload de uma minuta de pensao alimenticia");
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.ok, false);
  assert.doesNotMatch(String(body.answer || body.error || ""), /Para pesquisar/i);
  assert.doesNotMatch(String(body.answer || body.error || ""), /Fontes recomendadas/i);
});

test("cataloged jurisprudence research uses governed DAJ thesis instead of generic protocol", async () => {
  const response = await postIa("pesquise jurisprudencia sobre revisao de alimentos");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.governance.targetMvp, "DAJ_ADVOGADOS");
  assert.equal(body.governance.operation, "jurisprudencia_governada_daj");
  assert.equal(body.governance.driveMemory.official, true);
  assert.match(body.answer, /catalogo-jurisprudencial-daj-v1/i);
  assert.match(body.answer, /Alimentos, revisao e execucao/i);
  assert.match(body.answer, /Sumula 309/i);
  assert.doesNotMatch(body.answer, /Para pesquisar/i);
  assert.doesNotMatch(body.answer, /Jurisprudencia - trilha segura/i);
});

test("legal explanation with sources calls the model instead of guided protocol", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    assert.match(String(url), /api\.openai\.com/);
    const payload = JSON.parse(String(options.body || "{}"));
    assert.match(payload.input, /\[GOVERNANCA OPERACIONAL ATIVA\]/);
    assert.match(payload.input, /\[PERGUNTA ATUAL\]\nFale sobre o direito de propriedade citando fontes/i);
    return Response.json({
      output_text: "O direito de propriedade envolve usar, gozar, dispor e reivindicar o bem, com funcao social e limites legais. Fontes para conferencia: Constituicao Federal, Codigo Civil e jurisprudencia oficial."
    });
  };

  try {
    const response = await postIa(
      "Fale sobre o direito de propriedade citando fontes",
      { OPENAI_API_KEY: "test-key", JUS9_MODEL_DEFAULT: "test-model" }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(body.governance.targetMvp, "DAJ_ADVOGADOS");
    assert.equal(body.governance.operation, "resposta_inteligente");
    assert.match(body.answer, /direito de propriedade/i);
    assert.doesNotMatch(body.answer, /Para pesquisar doutrina e jurisprudencia/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("DataJud process search without gateway token returns governed pending answer without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("DataJud search without token should not call external fetch");
  };

  try {
    const response = await postIa("consulte no CNJ/DataJud o processo 0000000-00.2024.8.24.0000");
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls, 0);
    assert.equal(body.governance.operation, "consulta_datajud_cnj");
    assert.equal(body.dataJudStatus, "pendente");
    assert.match(body.answer, /CNJ\/DataJud/i);
    assert.match(body.answer, /JUS9_TRIBUNAIS_GATEWAY_TOKEN/i);
    assert.doesNotMatch(body.answer, /Para pesquisar doutrina e jurisprudencia|Fontes recomendadas/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("DataJud process search calls governed tribunal gateway and formats metadata", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    assert.equal(String(url), "https://jus9tecnologia.com.br/api/tribunais/datajud/search");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["X-Jus9-Internal-Token"], "gateway-test-token");
    const payload = JSON.parse(String(options.body || "{}"));
    assert.equal(payload.numeroProcesso, "00000000020248240000");
    assert.equal(payload.tribunal, "TJSC");
    assert.equal(payload.size, 5);

    return Response.json({
      ok: true,
      source: "CNJ/DataJud",
      tribunal: "TJSC",
      alias: "api_publica_tjsc",
      tribunalName: "Tribunal de Justica de Santa Catarina",
      numeroProcesso: "00000000020248240000",
      total: 1,
      results: [
        {
          classe: { codigo: 7, nome: "Procedimento Comum Civel" },
          grau: "G1",
          nivelSigilo: 0,
          assuntos: [{ codigo: 999, nome: "Obrigacoes" }],
          orgaoJulgador: { nome: "1a Vara Civel" },
          movimentos: [
            { codigo: 26, nome: "Distribuicao", dataHora: "2024-01-10T12:00:00" },
            { codigo: 51, nome: "Conclusos para decisao", dataHora: "2024-01-12T12:00:00" }
          ]
        }
      ]
    });
  };

  try {
    const response = await postIa(
      "Consulte no TJSC pelo CNJ/DataJud o processo 0000000-00.2024.8.24.0000",
      { JUS9_TRIBUNAIS_GATEWAY_TOKEN: "gateway-test-token" }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(body.governance.operation, "consulta_datajud_cnj");
    assert.equal(body.dataJudStatus, "consultado");
    assert.match(body.answer, /Consulta CNJ\/DataJud realizada/i);
    assert.match(body.answer, /Tribunal de Justica de Santa Catarina/i);
    assert.match(body.answer, /Procedimento Comum Civel/i);
    assert.match(body.answer, /Distribuicao/i);
    assert.doesNotMatch(body.answer, /Para pesquisar doutrina e jurisprudencia|Fontes recomendadas/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("doctrinal citation without theme asks for minimum research scope", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called without minimum citation topic");
  };

  try {
    const response = await postIa("forneca citacao com doutrina e pagina");
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls, 0);
    assert.equal(body.governance.operation, "pesquisa_citacao_precisa_recorte");
    assert.match(body.answer, /preciso de um recorte minimo/i);
    assert.match(body.answer, /tema juridico|obra ou autor|PDF\/DOCX/i);
    assert.doesNotMatch(body.answer, /Aqui estao algumas opcoes de fontes/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("doctrinal citation with theme requires active web search and visible consulted source", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    assert.match(String(url), /api\.openai\.com\/v1\/chat\/completions/);
    const payload = JSON.parse(String(options.body || "{}"));
    assert.equal(payload.model, "test-search-model");
    assert.deepEqual(payload.web_search_options, {});
    assert.equal(payload.messages?.[0]?.role, "system");
    assert.equal(payload.messages?.[1]?.role, "user");
    assert.match(payload.messages[0].content, /BUSCA WEB JURIDICA ATIVA/i);
    assert.match(payload.messages[1].content, /\[PESQUISA JURIDICA ATIVA OBRIGATORIA\]/);
    assert.match(payload.messages[1].content, /direito propriedade/i);
    return Response.json({
      choices: [
        {
          message: {
            content: "Sobre direito de propriedade, a fonte localizada permite trabalhar a funcao social como limite constitucional ao uso individual do bem. Ha apenas indicativo aproximado de pagina neste retorno.",
            annotations: [
              {
                type: "url_citation",
                url_citation: {
                  title: "BDTD - busca sobre direito de propriedade",
                  url: "https://bdtd.ibict.br/vufind/Search/Results?lookfor=direito%20de%20propriedade"
                }
              }
            ]
          }
        }
      ]
    });
  };

  try {
    const response = await postIa(
      "forneca citacao com doutrina e pagina sobre direito de propriedade",
      { OPENAI_API_KEY: "test-key", JUS9_MODEL_CHAT_SEARCH: "test-search-model", JUS9_MODEL_DEFAULT: "test-model" }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(body.governance.operation, "pesquisa_citacao_doutrinaria_ativa");
    assert.match(body.answer, /direito de propriedade/i);
    assert.match(body.answer, /Fontes consultadas pela busca/i);
    assert.match(body.answer, /Limite de pagina/i);
    assert.match(body.answer, /pagina aproximada.*nao deve ser tratada como pagina verificavel/i);
    assert.match(body.answer, /https:\/\/bdtd\.ibict\.br/i);
    assert.doesNotMatch(body.answer, /Aqui estao algumas opcoes de fontes/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("known bibliographic work corrects authorship instead of hallucinating author", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called for verified bibliographic correction");
  };

  try {
    const response = await postIa("Conhece a obra: A nova teoria do fato punivel?");
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls, 0);
    assert.match(body.answer, /Juarez Cirino dos Santos/i);
    assert.match(body.answer, /A moderna teoria do fato punivel/i);
    assert.match(body.answer, /catalogo interno/i);
    assert.match(body.answer, /LexML/i);
    assert.doesNotMatch(body.answer, /Geraldo Prado/i);

    const portalWrappedResponse = await postIa([
      "Contexto publico demonstrativo da Jus 9 Tecnologia Juridica.",
      "[REGRA BIBLIOGRAFICA DE NAO ALUCINACAO]",
      "Caso especifico verificado: A moderna teoria do fato punivel, de Juarez Cirino dos Santos.",
      "Pergunta do usuario: Conhece a obra: A nova teoria do fato punivel?"
    ].join("\n"));
    const portalWrappedBody = await portalWrappedResponse.json();

    assert.equal(portalWrappedResponse.status, 200);
    assert.equal(portalWrappedBody.ok, true);
    assert.equal(calls, 0);
    assert.match(portalWrappedBody.answer, /Juarez Cirino dos Santos/i);
    assert.doesNotMatch(portalWrappedBody.answer, /Geraldo Prado/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verified legal bibliography catalog answers classic works without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called for cataloged bibliography");
  };

  try {
    const kelsenResponse = await postIa("Quem escreveu Teoria pura do direito?");
    const kelsenBody = await kelsenResponse.json();

    assert.equal(kelsenResponse.status, 200);
    assert.equal(kelsenBody.ok, true);
    assert.match(kelsenBody.answer, /Hans Kelsen/i);
    assert.match(kelsenBody.answer, /Teoria pura do direito/i);
    assert.match(kelsenBody.answer, /LexML/i);

    const beccariaResponse = await postIa("Conhece a obra Dos delitos e das penas?");
    const beccariaBody = await beccariaResponse.json();

    assert.equal(beccariaResponse.status, 200);
    assert.equal(beccariaBody.ok, true);
    assert.match(beccariaBody.answer, /Cesare Beccaria/i);
    assert.match(beccariaBody.answer, /Dos delitos e das penas/i);
    assert.match(beccariaBody.answer, /catalogo interno/i);
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verified Brazilian legal bibliography catalog covers core areas without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called for cataloged Brazilian bibliography");
  };

  try {
    const cases = [
      {
        question: "Quem escreveu Curso de direito constitucional positivo?",
        author: /Jose Afonso da Silva/i,
        title: /Curso de direito constitucional positivo/i
      },
      {
        question: "Conhece o Curso de direito civil brasileiro?",
        author: /Maria Helena Diniz/i,
        title: /Curso de direito civil brasileiro/i
      },
      {
        question: "Qual a autoria de Instituicoes de direito civil?",
        author: /Caio Mario da Silva Pereira/i,
        title: /Instituicoes de direito civil/i
      },
      {
        question: "Quem e o autor do Tratado de direito penal?",
        author: /Cezar Roberto Bitencourt/i,
        title: /Tratado de direito penal/i
      },
      {
        question: "Conhece o Curso de direito processual civil do Fredie Didier?",
        author: /Fredie Didier Jr\./i,
        title: /Curso de direito processual civil/i
      },
      {
        question: "Quem escreveu Manual de direito processual civil?",
        author: /Daniel Amorim Assumpcao Neves/i,
        title: /Manual de direito processual civil/i
      }
    ];

    for (const item of cases) {
      const response = await postIa(item.question);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.ok, true);
      assert.match(body.answer, item.author);
      assert.match(body.answer, item.title);
      assert.match(body.answer, /catalogo-bibliografico-juridico-v6/i);
      assert.match(body.answer, /LexML/i);
    }

    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verified legal bibliography catalog preserves v3 practical DAJ areas without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called for cataloged practical bibliography");
  };

  try {
    const cases = [
      {
        question: "Quem escreveu Curso de direito constitucional contemporaneo?",
        author: /Luis Roberto Barroso/i,
        title: /Curso de direito constitucional contemporaneo/i
      },
      {
        question: "Conhece Direito constitucional esquematizado?",
        author: /Pedro Lenza/i,
        title: /Direito constitucional esquematizado/i
      },
      {
        question: "Quem escreveu Manual de direito civil?",
        author: /Flavio Tartuce/i,
        title: /Manual de direito civil/i
      },
      {
        question: "Qual a autoria do Novo curso de direito civil?",
        author: /Pablo Stolze Gagliano/i,
        title: /Novo curso de direito civil/i
      },
      {
        question: "Conhece o Curso de direito penal de Rogerio Greco?",
        author: /Rogerio Greco/i,
        title: /Curso de direito penal/i
      },
      {
        question: "Quem escreveu Introducao critica ao direito penal brasileiro?",
        author: /Nilo Batista/i,
        title: /Introducao critica ao direito penal brasileiro/i
      },
      {
        question: "Quem escreveu Novo curso de processo civil?",
        author: /Luiz Guilherme Marinoni/i,
        title: /Novo curso de processo civil/i
      },
      {
        question: "Conhece Codigo de processo civil comentado de Nelson Nery?",
        author: /Nelson Nery Junior/i,
        title: /Codigo de processo civil comentado/i
      },
      {
        question: "Quem escreveu Manual de direito das familias?",
        author: /Maria Berenice Dias/i,
        title: /Manual de direito das familias/i
      },
      {
        question: "Qual a autoria de Direito civil: direito de familia?",
        author: /Carlos Roberto Goncalves/i,
        title: /Direito civil: direito de familia/i
      },
      {
        question: "Conhece Manual de direito do consumidor?",
        author: /Antonio Herman V\. Benjamin/i,
        title: /Manual de direito do consumidor/i
      },
      {
        question: "Quem escreveu Curso de direito do consumidor?",
        author: /Rizzatto Nunes/i,
        title: /Curso de direito do consumidor/i
      }
    ];

    for (const item of cases) {
      const response = await postIa(item.question);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.ok, true);
      assert.match(body.answer, item.author);
      assert.match(body.answer, item.title);
      assert.match(body.answer, /catalogo-bibliografico-juridico-v6/i);
      assert.match(body.answer, /LexML/i);
    }

    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("bibliographic selector prefers author-specific matches and avoids ambiguous generic titles", () => {
  assert.equal(
    findVerifiedLegalBibliographyEntry("Conhece Curso de direito tributario de Paulo de Barros Carvalho?")?.authors[0],
    "Paulo de Barros Carvalho"
  );
  assert.equal(
    findVerifiedLegalBibliographyEntry("Conhece Curso de direito tributario de Hugo de Brito Machado?")?.authors[0],
    "Hugo de Brito Machado"
  );
  assert.equal(
    findVerifiedLegalBibliographyEntry("Conhece Direito do trabalho de Sergio Pinto Martins?")?.authors[0],
    "Sergio Pinto Martins"
  );
  assert.equal(
    findVerifiedLegalBibliographyEntry("Conhece Direito do trabalho de Volia Bomfim Cassar?")?.authors[0],
    "Volia Bomfim Cassar"
  );
  assert.equal(
    findVerifiedLegalBibliographyEntry("Conhece Curso de direito constitucional de Gilmar Mendes?")?.authors[0],
    "Gilmar Ferreira Mendes"
  );
  assert.equal(
    findVerifiedLegalBibliographyEntry("Conhece Curso de direito constitucional de Paulo Bonavides?")?.authors[0],
    "Paulo Bonavides"
  );
  assert.equal(
    findVerifiedLegalBibliographyEntry("Quem escreveu Curso de direito tributario?"),
    null
  );
  assert.equal(
    findVerifiedLegalBibliographyEntry("Quem escreveu Direito do trabalho?"),
    null
  );
  assert.equal(
    findVerifiedLegalBibliographyEntry("Quem escreveu Curso de direito constitucional?"),
    null
  );
  assert.equal(
    findVerifiedLegalBibliographyEntry("Quem escreveu Contratos?"),
    null
  );
});

test("verified legal bibliography catalog v4 covers litigation-adjacent areas without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called for cataloged v4 bibliography");
  };

  try {
    const cases = [
      {
        question: "Quem escreveu Direito processual penal de Aury Lopes Jr?",
        author: /Aury Lopes Jr\./i,
        title: /Direito processual penal/i
      },
      {
        question: "Conhece Manual de processo penal de Guilherme de Souza Nucci?",
        author: /Guilherme de Souza Nucci/i,
        title: /Manual de processo penal/i
      },
      {
        question: "Quem escreveu Processo penal de Tourinho Filho?",
        author: /Fernando da Costa Tourinho Filho/i,
        title: /Processo penal/i
      },
      {
        question: "Conhece o Curso de direito do trabalho de Mauricio Godinho Delgado?",
        author: /Mauricio Godinho Delgado/i,
        title: /Curso de direito do trabalho/i
      },
      {
        question: "Quem escreveu Direito do trabalho de Volia Bomfim Cassar?",
        author: /Volia Bomfim Cassar/i,
        title: /Direito do trabalho/i
      },
      {
        question: "Quem escreveu Direito do trabalho de Sergio Pinto Martins?",
        author: /Sergio Pinto Martins/i,
        title: /Direito do trabalho/i
      },
      {
        question: "Quem escreveu Curso de direito administrativo de Celso Antonio Bandeira de Mello?",
        author: /Celso Antonio Bandeira de Mello/i,
        title: /Curso de direito administrativo/i
      },
      {
        question: "Conhece Direito administrativo de Maria Sylvia Zanella Di Pietro?",
        author: /Maria Sylvia Zanella Di Pietro/i,
        title: /Direito administrativo/i
      },
      {
        question: "Quem escreveu Direito administrativo brasileiro?",
        author: /Hely Lopes Meirelles/i,
        title: /Direito administrativo brasileiro/i
      },
      {
        question: "Quem escreveu Curso de direito tributario de Hugo de Brito Machado?",
        author: /Hugo de Brito Machado/i,
        title: /Curso de direito tributario/i
      },
      {
        question: "Conhece Curso de direito tributario de Paulo de Barros Carvalho?",
        author: /Paulo de Barros Carvalho/i,
        title: /Curso de direito tributario/i
      },
      {
        question: "Quem escreveu Curso de direito constitucional tributario?",
        author: /Roque Antonio Carrazza/i,
        title: /Curso de direito constitucional tributario/i
      },
      {
        question: "Conhece Curso de direito comercial de Fabio Ulhoa Coelho?",
        author: /Fabio Ulhoa Coelho/i,
        title: /Curso de direito comercial/i
      },
      {
        question: "Quem escreveu Curso de direito empresarial de Marlon Tomazette?",
        author: /Marlon Tomazette/i,
        title: /Curso de direito empresarial/i
      },
      {
        question: "Conhece Curso de direito comercial de Rubens Requiao?",
        author: /Rubens Requiao/i,
        title: /Curso de direito comercial/i
      }
    ];

    for (const item of cases) {
      const response = await postIa(item.question);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.ok, true);
      assert.match(body.answer, item.author);
      assert.match(body.answer, item.title);
      assert.match(body.answer, /catalogo-bibliografico-juridico-v6/i);
      assert.match(body.answer, /LexML/i);
    }

    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verified legal bibliography catalog v5 covers previdenciario ambiental constitutional and civil depth without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called for cataloged v5 bibliography");
  };

  try {
    const cases = [
      {
        question: "Quem escreveu Curso de direito e processo previdenciario?",
        author: /Frederico Amado/i,
        title: /Curso de direito e processo previdenciario/i
      },
      {
        question: "Conhece Direito processual previdenciario de Savaris?",
        author: /Jose Antonio Savaris/i,
        title: /Direito processual previdenciario/i
      },
      {
        question: "Quem escreveu Comentarios a Lei de beneficios da previdencia social?",
        author: /Daniel Machado da Rocha/i,
        title: /Comentarios a Lei de beneficios da previdencia social/i
      },
      {
        question: "Conhece Direito ambiental brasileiro?",
        author: /Paulo Affonso Leme Machado/i,
        title: /Direito ambiental brasileiro/i
      },
      {
        question: "Quem escreveu Direito do ambiente de Edis Milare?",
        author: /Edis Milare/i,
        title: /Direito do ambiente/i
      },
      {
        question: "Conhece Manual de direito ambiental de Romeu Thome?",
        author: /Romeu Thome/i,
        title: /Manual de direito ambiental/i
      },
      {
        question: "Quem escreveu A eficacia dos direitos fundamentais?",
        author: /Ingo Wolfgang Sarlet/i,
        title: /A eficacia dos direitos fundamentais/i
      },
      {
        question: "Conhece Curso de direito constitucional de Gilmar Mendes?",
        author: /Gilmar Ferreira Mendes/i,
        title: /Curso de direito constitucional/i
      },
      {
        question: "Quem escreveu Curso de direito constitucional de Paulo Bonavides?",
        author: /Paulo Bonavides/i,
        title: /Curso de direito constitucional/i
      },
      {
        question: "Quem escreveu A boa-fe no direito privado?",
        author: /Judith Martins-Costa/i,
        title: /A boa-fe no direito privado/i
      },
      {
        question: "Conhece Programa de responsabilidade civil de Cavalieri?",
        author: /Sergio Cavalieri Filho/i,
        title: /Programa de responsabilidade civil/i
      },
      {
        question: "Quem escreveu Contratos de Arnaldo Rizzardo?",
        author: /Arnaldo Rizzardo/i,
        title: /Contratos/i
      }
    ];

    for (const item of cases) {
      const response = await postIa(item.question);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.ok, true);
      assert.match(body.answer, item.author);
      assert.match(body.answer, item.title);
      assert.match(body.answer, /catalogo-bibliografico-juridico-v6/i);
      assert.match(body.answer, /LexML/i);
    }

    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verified legal bibliography catalog v6 covers collective evidence data and digital law without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called for cataloged v6 bibliography");
  };

  try {
    const cases = [
      {
        question: "Quem escreveu A defesa dos interesses difusos em juizo?",
        author: /Hugo Nigro Mazzilli/i,
        title: /A defesa dos interesses difusos em juizo/i,
        source: /LexML/i
      },
      {
        question: "Conhece Acesso a ordem juridica justa de Kazuo Watanabe?",
        author: /Kazuo Watanabe/i,
        title: /Acesso a ordem juridica justa/i,
        source: /LexML/i
      },
      {
        question: "Conhece Codigo brasileiro de defesa do consumidor comentado pelos autores do anteprojeto?",
        author: /Ada Pellegrini Grinover/i,
        title: /Codigo brasileiro de defesa do consumidor comentado pelos autores do anteprojeto/i,
        source: /GEN Juridico/i
      },
      {
        question: "Quem escreveu A prova de Michele Taruffo?",
        author: /Michele Taruffo/i,
        title: /A prova/i,
        source: /LexML/i
      },
      {
        question: "Conhece Prova e verdade no direito?",
        author: /Jordi Ferrer Beltran/i,
        title: /Prova e verdade no direito/i,
        source: /LexML/i
      },
      {
        question: "Quem escreveu Argumentacao juridica e teoria do direito?",
        author: /Neil MacCormick/i,
        title: /Argumentacao juridica e teoria do direito/i,
        source: /LexML/i
      },
      {
        question: "Quem escreveu Protecao de dados pessoais: a funcao e os limites do consentimento?",
        author: /Bruno Ricardo Bioni/i,
        title: /Protecao de dados pessoais: a funcao e os limites do consentimento/i,
        source: /LexML/i
      },
      {
        question: "Conhece Da privacidade a protecao de dados pessoais?",
        author: /Danilo Doneda/i,
        title: /Da privacidade a protecao de dados pessoais/i,
        source: /LexML/i
      },
      {
        question: "Quem escreveu Privacidade, protecao de dados e defesa do consumidor?",
        author: /Laura Schertel Mendes/i,
        title: /Privacidade, protecao de dados e defesa do consumidor/i,
        source: /LexML/i
      },
      {
        question: "Quem escreveu Advocacia digital?",
        author: /Patricia Peck Pinheiro/i,
        title: /Advocacia digital/i,
        source: /LexML/i
      },
      {
        question: "Conhece Inteligencia artificial como oportunidade para a regulacao juridica?",
        author: /Wolfgang Hoffmann-Riem/i,
        title: /Inteligencia artificial como oportunidade para a regulacao juridica/i,
        source: /LexML - Direito Publico/i
      },
      {
        question: "Quem escreveu Discriminacao algoritmica?",
        author: /Laura Schertel Mendes/i,
        title: /Discriminacao algoritmica: conceito, fundamento legal e tipologia/i,
        source: /LexML - Direito Publico/i
      }
    ];

    for (const item of cases) {
      const response = await postIa(item.question);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.ok, true);
      assert.match(body.answer, item.author);
      assert.match(body.answer, item.title);
      assert.match(body.answer, /catalogo-bibliografico-juridico-v6/i);
      assert.match(body.answer, item.source);
    }

    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("jurisprudence selector covers governed DAJ themes and avoids generic titles", () => {
  assert.equal(
    findVerifiedLegalJurisprudenceTheme("pesquise jurisprudencia sobre revisao de alimentos")?.id,
    "alimentos_revisao_execucao"
  );
  assert.equal(
    findVerifiedLegalJurisprudenceTheme("quero julgados sobre golpe do boleto e banco")?.id,
    "consumidor_bancos_fraudes"
  );
  assert.equal(
    findVerifiedLegalJurisprudenceTheme("fale sobre direito de propriedade citando fontes"),
    null
  );
  assert.equal(
    findVerifiedLegalJurisprudenceTheme("explique responsabilidade civil sem citar julgados"),
    null
  );
});

test("jurisprudence precedent selector covers verified DAJ fiches", () => {
  assert.equal(
    findVerifiedLegalJurisprudencePrecedent("Conhece o REsp 2.052.228 sobre transacoes fora do perfil?")?.id,
    "resp_2052228_df_operacoes_fora_perfil"
  );
  assert.equal(
    findVerifiedLegalJurisprudencePrecedent("quero julgado do golpe do boleto com vazamento de dados bancarios")?.id,
    "resp_2077278_sp_golpe_boleto_vazamento"
  );
  assert.equal(
    findVerifiedLegalJurisprudencePrecedent("julgado passagem forcada possuidor imovel encravado")?.id,
    "resp_2029511_passagem_forcada_possuidor"
  );
  assert.equal(
    findVerifiedLegalJurisprudencePrecedent("explique responsabilidade civil sem citar julgados"),
    null
  );
});

test("verified DAJ jurisprudence catalog v1 covers priority themes without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called for cataloged DAJ jurisprudence");
  };

  try {
    const cases = [
      {
        question: "Pesquise jurisprudencia sobre direito de propriedade e funcao social",
        theme: /Direito de propriedade e funcao social/i,
        expected: [/Constituicao Federal/i, /STF - Pesquisa de jurisprudencia/i]
      },
      {
        question: "Pesquise jurisprudencia sobre revisao de alimentos",
        theme: /Alimentos, revisao e execucao/i,
        expected: [/CPC - execucao de alimentos/i, /STJ - Sumula 309/i]
      },
      {
        question: "Liste julgados sobre responsabilidade civil e dano moral",
        theme: /Responsabilidade civil, dano material, dano moral e nexo causal/i,
        expected: [/Codigo Civil/i, /STJ - Sumula 37/i]
      },
      {
        question: "Quero precedentes sobre fraude bancaria e fortuito interno",
        theme: /Consumidor, bancos, fraudes e fortuito interno/i,
        expected: [/STJ - Sumula 297/i, /STJ - Sumula 479/i]
      },
      {
        question: "Pesquise jurisprudencia de LGPD sobre vazamento de dados",
        theme: /LGPD, vazamento de dados e responsabilidade por tratamento irregular/i,
        expected: [/LGPD - Lei 13\.709/i, /ANPD - portal oficial/i]
      },
      {
        question: "Quero jurisprudencia sobre tutela coletiva e acao civil publica",
        theme: /Tutela coletiva, acao civil publica e direitos difusos/i,
        expected: [/Lei da Acao Civil Publica/i, /CDC - tutela coletiva/i]
      }
    ];

    for (const item of cases) {
      const response = await postIa(item.question);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.ok, true);
      assert.equal(body.governance.operation, "jurisprudencia_governada_daj");
      assert.match(body.answer, /catalogo-jurisprudencial-daj-v1/i);
      assert.match(body.answer, item.theme);
      assert.match(body.answer, /Teses pesquisaveis, sem inventar julgado/i);
      assert.match(body.answer, /Fontes oficiais para conferencia/i);
      assert.doesNotMatch(body.answer, /Para pesquisar/i);
      assert.doesNotMatch(body.answer, /Jurisprudencia - trilha segura/i);
      for (const expected of item.expected) {
        assert.match(body.answer, expected);
      }
    }

    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verified DAJ jurisprudence precedent fiches v1 cover specific STJ cases without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called for verified DAJ jurisprudence fiches");
  };

  try {
    const cases = [
      {
        question: "Ficha jurisprudencial do REsp 2.052.228 sobre transacoes fora do perfil",
        expected: [/fichas-jurisprudenciais-daj-v1/i, /REsp 2\.052\.228\/DF/i, /Nancy Andrighi/i, /perfil do cliente|fora do perfil/i]
      },
      {
        question: "Ficha do REsp 2.077.278 sobre golpe do boleto e vazamento de dados",
        expected: [/REsp 2\.077\.278\/SP/i, /LGPD|artigo 44/i, /Nancy Andrighi/i]
      },
      {
        question: "Quero precedente do golpe da falsa central em instituicao de pagamento",
        expected: [/REsp 2\.222\.059/i, /instituicoes de pagamento/i, /Villas Boas Cueva/i]
      },
      {
        question: "Julgado REsp 2.029.511 passagem forcada possuidor imovel encravado",
        expected: [/REsp 2\.029\.511/i, /passagem forcada/i, /funcao social/i]
      },
      {
        question: "Julgado sobre prisao de devedor de alimentos por falta de risco a subsistencia",
        expected: [/Processo em segredo de justica/i, /Marco Aurelio Bellizze/i, /execucao pode prosseguir/i]
      },
      {
        question: "Conhece o REsp 1.955.899 sobre execucao de sentenca coletiva por associacao?",
        expected: [/REsp 1\.955\.899/i, /artigo 100 do CDC|CDC/i, /subsidiaria/i]
      },
      {
        question: "CDC se aplica a emprestimo para capital de giro? cite o REsp 2.001.086",
        expected: [/REsp 2\.001\.086/i, /capital de giro/i, /CDC nao se aplica|CDC nao incide/i]
      }
    ];

    for (const item of cases) {
      const response = await postIa(item.question);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.ok, true);
      assert.equal(body.governance.operation, "jurisprudencia_governada_daj");
      assert.match(body.answer, /fichas-jurisprudenciais-daj-v1/i);
      assert.doesNotMatch(body.answer, /Para pesquisar/i);
      assert.doesNotMatch(body.answer, /Jurisprudencia - trilha segura/i);
      for (const expected of item.expected) {
        assert.match(body.answer, expected);
      }
    }

    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verified DAJ jurisprudence work product builds petition argument without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("OpenAI should not be called for verified DAJ jurisprudence work product");
  };

  try {
    const response = await postIa("Monte um argumento de peticao com o REsp 2.077.278 sobre golpe do boleto.");
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.governance.operation, "jurisprudencia_operacional_daj");
    assert.match(body.answer, /produtos-jurisprudenciais-daj-v1/i);
    assert.match(body.answer, /Argumento de peticao/i);
    assert.match(body.answer, /REsp 2\.077\.278\/SP/i);
    assert.match(body.answer, /artigo 44 da LGPD|tratamento irregular|nexo causal/i);
    assert.match(body.answer, /Nao e citacao literal/i);
    assert.doesNotMatch(body.answer, /Para pesquisar/i);
    assert.equal(body.artifact.kind, "jurisprudence-work-product");
    assert.equal(body.artifact.driveDecision.classificacao, "PUBLICO");
    assert.equal(body.artifact.shouldSaveToDrive, false);
    assert.equal(body.artifact.criarLinkDownload, false);
    assert.equal(body.driveSaver, null);
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("public API answers but refuses Drive side effects without internal proxy authorization", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return Response.json({ ok: true });
  };

  try {
    const response = await postIa(
      "Monte checklist probatorio do REsp 2.077.278 sobre golpe do boleto e gere link de download em PDF.",
      {
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      },
      { authorized: false }
    );
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.artifact.shouldSaveToDrive, true);
    assert.equal(body.driveSaver.reason, "authorization_required");
    assert.equal(calls, 0);
    assert.match(body.answer, /sessao nao possui permissao governada de escrita/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verified DAJ jurisprudence work product saves public download through Drive Saver", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    assert.equal(String(url), "https://drive-saver.test/exec");
    const payload = JSON.parse(String(options.body || "{}"));

    assert.equal(payload.chaveInterna, "internal-test-key");
    assert.equal(payload.classificacao, "PUBLICO");
    assert.equal(payload.tipoDocumento, "PRODUTO_JURISPRUDENCIAL_DAJ_CHARLIE_ECHO");
    assert.equal(payload.criarLinkDownload, true);
    assert.equal(payload.idempotencyKey, "test-request-id:salvar:jurisprudence-work-product");
    assert.match(payload.titulo, /Produto jurisprudencial DAJ/i);
    assert.match(payload.conteudo, /Checklist probatorio/i);
    assert.match(payload.conteudo, /REsp 2\.077\.278\/SP/i);
    assert.match(payload.conteudo, /dados bancarios|nexo causal/i);

    return Response.json({
      ok: true,
      mensagem: "Produto jurisprudencial salvo.",
      fileId: "drive-juris-123",
      viewUrl: "https://docs.google.com/document/d/drive-juris-123/edit",
      downloadUrl: "https://docs.google.com/document/d/drive-juris-123/export?format=pdf",
      linkPublicoCriado: true,
      classificacaoFinal: "PUBLICO",
      pastaDestino: "01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS",
      revisaoHumanaObrigatoria: false
    });
  };

  try {
    const response = await postIa(
      "Monte checklist probatorio do REsp 2.077.278 sobre golpe do boleto e gere link de download em PDF.",
      {
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.governance.operation, "jurisprudencia_operacional_daj");
    assert.equal(calls.length, 1);
    assert.match(body.answer, /Arquivo salvo no Cartorio Digital Charlie Echo/i);
    assert.match(body.answer, /Link de download: https:\/\/docs\.google\.com\/document\/d\/drive-juris-123\/export\?format=pdf/i);
    assert.equal(body.artifact.kind, "jurisprudence-work-product");
    assert.equal(body.artifact.driveDecision.classificacao, "PUBLICO");
    assert.equal(body.artifact.shouldSaveToDrive, true);
    assert.equal(body.artifact.criarLinkDownload, true);
    assert.equal(body.driveSaver.downloadUrl, "https://docs.google.com/document/d/drive-juris-123/export?format=pdf");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("download prompt forbids empty link promises", async () => {
  const apiHandler = await fs.readFile(new URL("../functions/api/ia.js", import.meta.url), "utf8");

  assert.match(apiHandler, /nao prometa "vou disponibilizar"/i);
  assert.match(apiHandler, /Drive Saver estiver configurado/i);
  assert.match(apiHandler, /link real/i);
});

test("user memory and MVP instrument sync saves to Drive Saver without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    assert.equal(String(url), "https://drive-saver.test/exec");
    const payload = JSON.parse(String(options.body || "{}"));

    assert.equal(payload.chaveInterna, "internal-test-key");
    assert.equal(payload.classificacao, "INTERNO");
    assert.equal(payload.tipoDocumento, "MEMORIA_USUARIO_INSTRUMENTO_CHARLIE_ECHO");
    assert.equal(payload.criarLinkDownload, false);
    assert.match(payload.titulo, /Memoria de usuario e instrumento MVP/i);
    assert.match(payload.conteudo, /\[MEMORIA DO USUARIO CONFIGURAVEL\]/i);
    assert.match(payload.conteudo, /\[PAINEL DO INSTRUMENTO MVP\]/i);
    assert.match(payload.conteudo, /senha: \[REDACTED\]/i);
    assert.doesNotMatch(payload.conteudo, /ultra-secreta/i);

    return Response.json({
      ok: true,
      mensagem: "Memoria registrada.",
      fileId: "memory-config-123",
      viewUrl: "https://docs.google.com/document/d/memory-config-123/edit",
      linkPublicoCriado: false,
      classificacaoFinal: "INTERNO",
      pastaDestino: "02_MEMORIA_OPERACIONAL_INTERNA",
      revisaoHumanaObrigatoria: false
    });
  };

  try {
    const response = await postIa(
      [
        "OPERACAO_INTERNA: SINCRONIZAR_MEMORIA_USUARIO_INSTRUMENTO",
        "[SINCRONIZAR_MEMORIA_USUARIO_INSTRUMENTO]",
        "MVP: DAJ",
        "[MEMORIA DO USUARIO CONFIGURAVEL]",
        "Como chamar o usuario: Clovis.",
        "senha: ultra-secreta",
        "[PAINEL DO INSTRUMENTO MVP]",
        "Instrumento: DAJ - IA Profissional Jurista."
      ].join("\n"),
      {
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(body.governance.operation, "memoria_usuario_instrumento");
    assert.equal(body.artifact.kind, "user-memory-instrument-config");
    assert.equal(body.artifact.driveDecision.classificacao, "INTERNO");
    assert.equal(body.artifact.shouldSaveToDrive, true);
    assert.equal(body.artifact.criarLinkDownload, false);
    assert.match(body.answer, /Memoria de usuario e instrumento do MVP registrada/i);
    assert.equal(body.driveSaver.viewUrl, "https://docs.google.com/document/d/memory-config-123/edit");
    assert.equal(body.driveSaver.downloadUrl, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("document download post-processing removes hallucinated links", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: [
        "Vou preparar a minuta e fornecer um link para download.",
        "",
        "Estrutura da minuta: fatos, fundamentos, pedidos e documentos.",
        "Agora, vou gerar o link para voce. Um momento, por favor.",
        "https://example.com/minuta-revisao-alimentos.pdf"
      ].join("\n")
    });
  };

  try {
    const response = await postIa(
      "minuta de peticao revisao de alimentos. Quero um link para download",
      { OPENAI_API_KEY: "test-key", JUS9_MODEL_DEFAULT: "test-model" }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.answer, /ACAO REVISIONAL DE ALIMENTOS/i);
    assert.match(body.answer, /Dos fatos/i);
    assert.match(body.answer, /Dos pedidos/i);
    assert.match(body.answer, /botoes da pagina/i);
    assert.doesNotMatch(body.answer, /example\.com|Um momento|vou gerar o link/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("document download post-processing avoids asking for real party data", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: [
        "Posso preparar a minuta.",
        "Por favor, me informe os detalhes: nome das partes, valores propostos e frequencia dos pagamentos.",
        "Apos receber essas informacoes, elaborarei a minuta."
      ].join("\n")
    });
  };

  try {
    const response = await postIa(
      "quero link para donwload de uma minuta de pensao alimenticia",
      { OPENAI_API_KEY: "test-key", JUS9_MODEL_DEFAULT: "test-model" }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.answer, /ACAO DE ALIMENTOS/i);
    assert.match(body.answer, /\[NOME DA PARTE\]/i);
    assert.doesNotMatch(body.answer, /me informe os detalhes|nome das partes|valores propostos/i);
    assert.match(body.answer, /botoes da pagina/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("document download post-processing replaces promise-only draft answer", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: "Posso preparar uma minuta de pensao alimenticia para voce. O documento sera revisado antes de ser disponibilizado. Gostaria de alguma informacao especifica?"
    });
  };

  try {
    const response = await postIa(
      "quero link para donwload de uma minuta de pensao alimenticia",
      { OPENAI_API_KEY: "test-key", JUS9_MODEL_DEFAULT: "test-model" }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.answer, /ACAO DE ALIMENTOS/i);
    assert.match(body.answer, /Checklist de revisao humana/i);
    assert.doesNotMatch(body.answer, /Posso preparar|disponibilizado|alguma informacao especifica/i);
    assert.match(body.answer, /botoes da pagina/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("complete legal draft request returns full draft instead of promise", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: "Posso preparar uma peticao completa de revisao de alimentos. Primeiro preciso que voce informe os nomes das partes e valores."
    });
  };

  try {
    const response = await postIa(
      "faca uma peticao completa de revisao de alimentos",
      { OPENAI_API_KEY: "test-key", JUS9_MODEL_DEFAULT: "test-model" }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.answer, /ACAO REVISIONAL DE ALIMENTOS/i);
    assert.match(body.answer, /Dos fatos/i);
    assert.match(body.answer, /Do direito e dos fundamentos/i);
    assert.match(body.answer, /Dos pedidos/i);
    assert.match(body.answer, /Do valor da causa/i);
    assert.match(body.answer, /Checklist de revisao humana/i);
    assert.doesNotMatch(body.answer, /Primeiro preciso|nomes das partes|valores/i);
    assert.equal(body.artifact, null);
    assert.equal(body.driveSaver, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("complete legal draft request acknowledges governed upload context", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: "Vou analisar o anexo e preparar a peca depois."
    });
  };

  try {
    const message = [
      "[PERGUNTA ATUAL]",
      "redija uma peticao inicial completa de cobranca usando o anexo textual",
      "",
      "[ANEXOS DO USUARIO - UPLOAD LOCAL GOVERNADO]",
      "Os arquivos abaixo foram selecionados pelo usuario nesta tela. Use apenas o texto extraido quando houver.",
      "",
      "Anexo 1: contrato-ficticio.txt",
      "Tipo: text/plain | tamanho: 2 KB | leitura: texto extraido",
      "Observacao: Texto local extraido pelo navegador.",
      "Conteudo extraido:",
      "\"\"\"",
      "Contrato ficticio com atraso de pagamento em tres parcelas demonstrativas.",
      "\"\"\"",
      "",
      "Regra: para PDF, DOCX, imagem ou arquivo sem texto extraido, peca transcricao, OCR ou backend extrator antes de usar o conteudo como fato."
    ].join("\n");

    const response = await postIa(
      message,
      { OPENAI_API_KEY: "test-key", JUS9_MODEL_DEFAULT: "test-model" }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.answer, /Anexos governados considerados/i);
    assert.match(body.answer, /contrato-ficticio\.txt/i);
    assert.match(body.answer, /Usei somente o texto extraido como subsidio/i);
    assert.match(body.answer, /Contrato ficticio com atraso de pagamento em tres parcelas demonstrativas/i);
    assert.match(body.answer, /Fatos extraidos do anexo governado/i);
    assert.match(body.answer, /Minuta completa demonstrativa/i);
    assert.doesNotMatch(body.answer, /Vou analisar o anexo e preparar/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("complete legal draft reads loose governed attachment text", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: "Posso preparar depois de receber os dados."
    });
  };

  try {
    const message = [
      "[PERGUNTA ATUAL]",
      "redija uma peticao inicial completa usando somente o conteudo extraido do anexo",
      "",
      "[ANEXOS DO USUARIO - UPLOAD LOCAL GOVERNADO]",
      "Arquivo: fatos.txt",
      "Tipo: text/plain",
      "Conteudo extraido:",
      "Maria e Joao possuem um filho menor ficticio. Joao reduziu voluntariamente a contribuicao. Maria pede revisao dos alimentos com placeholders."
    ].join("\n");

    const response = await postIa(
      message,
      { OPENAI_API_KEY: "test-key", JUS9_MODEL_DEFAULT: "test-model" }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.answer, /fatos\.txt/i);
    assert.match(body.answer, /Usei somente o texto extraido como subsidio/i);
    assert.match(body.answer, /Maria e Joao possuem um filho menor ficticio/i);
    assert.match(body.answer, /Fatos extraidos do anexo governado/i);
    assert.doesNotMatch(body.answer, /Nao ha texto extraido suficiente/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("DAJ intake analysis creates governed report and saves it to Drive Saver", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("api.openai.com")) {
      return Response.json({
        output_text: "Vou analisar o DAJ e preparar um relatorio depois."
      });
    }

    assert.equal(String(url), "https://drive-saver.test/exec");
    const payload = JSON.parse(String(options.body || "{}"));
    assert.equal(payload.chaveInterna, "internal-test-key");
    assert.equal(payload.tipoDocumento, "RELATORIO_ANALISE_DAJ_CHARLIE_ECHO");
    assert.equal(payload.classificacao, "JURIDICO_SIGILOSO");
    assert.equal(payload.criarLinkDownload, false);
    assert.match(payload.origem, /Governanca Operacional DAJ_ADVOGADOS/i);
    assert.match(payload.conteudo, /Relatorio de analise DAJ - DAJ-2026-0004/i);
    assert.match(payload.conteudo, /Perguntas de retorno ao cliente/i);
    assert.match(payload.conteudo, /Proximos atos do DAJ/i);

    return Response.json({
      ok: true,
      mensagem: "Relatorio salvo.",
      fileId: "drive-daj-report-123",
      viewUrl: "https://docs.google.com/document/d/drive-daj-report-123/edit",
      downloadUrl: null,
      linkPublicoCriado: false,
      classificacaoFinal: "JURIDICO_SIGILOSO",
      pastaDestino: "00_ENTRADA_PARA_REVISAO_HUMANA",
      revisaoHumanaObrigatoria: true,
      cofreAutomatico: false
    });
  };

  try {
    const message = [
      "[PERGUNTA ATUAL]",
      "Leia o DAJ recem-criado a partir do atendimento inicial demonstrativo e faca uma analise da Charlie Echo.",
      "",
      "[ATENDIMENTO INICIAL DO DAJ - RASCUNHO LOCAL]",
      "DAJ previsto: DAJ-2026-0004.",
      "Origem: Atendimento inicial demonstrativo.",
      "Campos preenchidos/selecionados:",
      "- Nome completo: Cliente Ficticio",
      "- Contato principal: cliente.ficticio@example.com",
      "- Area aparente: Familia",
      "- Urgencia: Prazo proximo",
      "- Nivel de sigilo: Restrito",
      "- Relato livre do caso: Pessoa ficticia pede revisao de alimentos com documento pendente."
    ].join("\n");

    const response = await postIa(
      message,
      {
        OPENAI_API_KEY: "test-key",
        JUS9_MODEL_DEFAULT: "test-model",
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 2);
    assert.equal(body.governance.operation, "analise_daj_governada");
    assert.equal(body.governance.module.code, "DAJ");
    assert.equal(body.governance.module.independent, true);
    assert.equal(body.artifact.kind, "daj-analysis-report");
    assert.equal(body.artifact.driveDecision.classificacao, "JURIDICO_SIGILOSO");
    assert.equal(body.artifact.shouldSaveToDrive, true);
    assert.equal(body.artifact.criarLinkDownload, false);
    assert.match(body.answer, /Relatorio de analise DAJ - DAJ-2026-0004/i);
    assert.match(body.answer, /Arquivo salvo no Cartorio Digital Charlie Echo/i);
    assert.match(body.answer, /Abrir no Drive: https:\/\/docs\.google\.com\/document\/d\/drive-daj-report-123\/edit/i);
    assert.doesNotMatch(body.answer, /Mapa operacional do JUS9_DRIVE_SAVER_MVP/i);
    assert.doesNotMatch(body.answer, /Vou analisar o DAJ e preparar/i);
    assert.equal(body.driveSaver.viewUrl, "https://docs.google.com/document/d/drive-daj-report-123/edit");
    assert.equal(body.driveSaver.downloadUrl, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("public demonstrative document download autonomously saves to Drive Saver", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("api.openai.com")) {
      return Response.json({
        output_text: "Posso preparar uma minuta. Gostaria de alguma informacao especifica?"
      });
    }

    assert.equal(String(url), "https://drive-saver.test/exec");
    const payload = JSON.parse(String(options.body || "{}"));
    assert.equal(payload.chaveInterna, "internal-test-key");
    assert.equal(payload.classificacao, "PUBLICO");
    assert.equal(payload.criarLinkDownload, true);
    assert.match(payload.origem, /Governanca Operacional DAJ_ADVOGADOS/i);
    assert.match(payload.observacao, /Memoria operacional oficial: Google Drive \/ Cartorio Digital Charlie Echo/i);
    assert.match(payload.conteudo, /ACAO DE ALIMENTOS/i);

    return Response.json({
      ok: true,
      mensagem: "Documento salvo.",
      fileId: "drive-auto-123",
      viewUrl: "https://docs.google.com/document/d/drive-auto-123/edit",
      downloadUrl: "https://docs.google.com/document/d/drive-auto-123/export?format=pdf",
      linkPublicoCriado: true,
      classificacaoFinal: "PUBLICO",
      pastaDestino: "01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS",
      revisaoHumanaObrigatoria: false,
      cofreAutomatico: false
    });
  };

  try {
    const response = await postIa(
      "quero link para donwload de uma minuta de pensao alimenticia",
      {
        OPENAI_API_KEY: "test-key",
        JUS9_MODEL_DEFAULT: "test-model",
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 2);
    assert.match(body.answer, /Arquivo salvo no Cartorio Digital Charlie Echo/i);
    assert.match(body.answer, /Link de download: https:\/\/docs\.google\.com\/document\/d\/drive-auto-123\/export\?format=pdf/i);
    assert.equal(body.artifact.driveDecision.classificacao, "PUBLICO");
    assert.equal(body.artifact.shouldSaveToDrive, true);
    assert.equal(body.artifact.criarLinkDownload, true);
    assert.equal(body.artifact.governance.targetMvp, "DAJ_ADVOGADOS");
    assert.equal(body.artifact.governance.memoryDestination, "Google Drive / Cartorio Digital Charlie Echo");
    assert.equal(body.governance.driveMemory.automaticPdfAllowed, true);
    assert.equal(body.driveSaver.downloadUrl, "https://docs.google.com/document/d/drive-auto-123/export?format=pdf");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("local-only document download opt-out does not save to Drive Saver", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: "Posso preparar uma minuta. Gostaria de alguma informacao especifica?"
    });
  };

  try {
    const response = await postIa(
      "quero link para donwload de uma minuta de pensao alimenticia, sem salvar no Drive",
      {
        OPENAI_API_KEY: "test-key",
        JUS9_MODEL_DEFAULT: "test-model",
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 1);
    assert.match(body.answer, /botoes da pagina/i);
    assert.doesNotMatch(body.answer, /Arquivo salvo no Cartorio Digital Charlie Echo/i);
    assert.equal(body.artifact.driveDecision.classificacao, "PUBLICO");
    assert.equal(body.artifact.shouldSaveToDrive, false);
    assert.equal(body.artifact.criarLinkDownload, false);
    assert.equal(body.driveSaver, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("explicit Cartorio Digital save request sends demonstrative draft to Drive Saver", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("api.openai.com")) {
      return Response.json({
        output_text: "Posso preparar uma minuta. Gostaria de alguma informacao especifica?"
      });
    }

    assert.equal(String(url), "https://drive-saver.test/exec");
    const payload = JSON.parse(String(options.body || "{}"));
    assert.equal(payload.chaveInterna, "internal-test-key");
    assert.equal(payload.classificacao, "PUBLICO");
    assert.equal(payload.criarLinkDownload, true);
    assert.match(payload.conteudo, /ACAO DE ALIMENTOS/i);
    assert.match(payload.conteudo, /Checklist de revisao humana/i);

    return Response.json({
      ok: true,
      mensagem: "Documento salvo.",
      fileId: "drive-file-123",
      viewUrl: "https://docs.google.com/document/d/drive-file-123/edit",
      downloadUrl: "https://docs.google.com/document/d/drive-file-123/export?format=pdf",
      linkPublicoCriado: true,
      classificacaoFinal: "PUBLICO",
      pastaDestino: "01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS",
      revisaoHumanaObrigatoria: false,
      cofreAutomatico: false
    });
  };

  try {
    const response = await postIa(
      "salve esta minuta ficticia de pensao alimenticia no Cartorio Digital Charlie Echo e gere link de download",
      {
        OPENAI_API_KEY: "test-key",
        JUS9_MODEL_DEFAULT: "test-model",
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 2);
    assert.match(body.answer, /Arquivo salvo no Cartorio Digital Charlie Echo/i);
    assert.match(body.answer, /Link de download: https:\/\/docs\.google\.com\/document\/d\/drive-file-123\/export\?format=pdf/i);
    assert.equal(body.artifact.driveDecision.classificacao, "PUBLICO");
    assert.equal(body.artifact.shouldSaveToDrive, true);
    assert.equal(body.artifact.criarLinkDownload, true);
    assert.equal(body.driveSaver.downloadUrl, "https://docs.google.com/document/d/drive-file-123/export?format=pdf");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("portal save prompt with prior sigiloso answer is not corrective action", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("api.openai.com")) {
      return Response.json({
        output_text: [
          "Minuta demonstrativa - pensao alimenticia",
          "",
          "AO JUIZO DA VARA DE FAMILIA DA COMARCA DE [CIDADE/UF]",
          "",
          "Dos fatos, dos fundamentos e dos pedidos com placeholders.",
          "",
          "Checklist de revisao humana obrigatoria."
        ].join("\n")
      });
    }

    assert.equal(String(url), "https://drive-saver.test/exec");
    const payload = JSON.parse(String(options.body || "{}"));
    assert.equal(payload.chaveInterna, "internal-test-key");
    assert.equal(payload.classificacao, "JURIDICO_SIGILOSO");
    assert.equal(payload.criarLinkDownload, false);
    assert.match(payload.conteudo, /Minuta (?:completa )?demonstrativa/i);

    return Response.json({
      ok: true,
      mensagem: "Documento salvo.",
      fileId: "drive-portal-save-123",
      viewUrl: "https://docs.google.com/document/d/drive-portal-save-123/edit",
      downloadUrl: null,
      linkPublicoCriado: false,
      classificacaoFinal: "JURIDICO_SIGILOSO",
      pastaDestino: "00_ENTRADA_PARA_REVISAO_HUMANA",
      revisaoHumanaObrigatoria: true
    });
  };

  try {
    const response = await postIa(
      [
        "Salve esta minuta/documento no Cartorio Digital Charlie Echo e gere link de download se a classificacao governada permitir. Use a resposta anterior como conteudo-base, sem inventar dados reais.",
        "",
        "Pergunta anterior: quero link para donwload de uma minuta de pensao alimenticia",
        "",
        "Resposta anterior:",
        "Minuta demonstrativa - pensao alimenticia",
        "Minha classificacao automatica: JURIDICO_SIGILOSO. pedido juridico com possivel dado real, risco sensivel ou contexto insuficiente."
      ].join("\n"),
      {
        OPENAI_API_KEY: "test-key",
        JUS9_MODEL_DEFAULT: "test-model",
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 2);
    assert.equal(body.driveSaverAction ?? null, null);
    assert.equal(body.artifact.shouldSaveToDrive, true);
    assert.equal(body.artifact.criarLinkDownload, false);
    assert.equal(body.driveSaver.viewUrl, "https://docs.google.com/document/d/drive-portal-save-123/edit");
    assert.equal(body.driveSaver.downloadUrl, null);
    assert.doesNotMatch(body.answer, /preciso do link do Google Docs\/Drive|fileId/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ordinary explanation does not become document artifact or Drive save", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: "Responsabilidade social empresarial e o compromisso pratico da empresa com impactos sociais, ambientais, trabalhistas e comunitarios."
    });
  };

  try {
    const response = await postIa(
      "O que e responsabilidade social de uma empresa?",
      {
        OPENAI_API_KEY: "test-key",
        JUS9_MODEL_DEFAULT: "test-model",
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(body.artifact, null);
    assert.equal(body.driveSaver, null);
    assert.match(body.answer, /Responsabilidade social empresarial/i);
    assert.doesNotMatch(body.answer, /Minuta demonstrativa|Arquivo salvo no Cartorio Digital/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("current question wins over prior document download memory", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: "Responsabilidade social empresarial envolve dever de cuidado, coerencia institucional e reducao de danos no ambiente em que a empresa atua."
    });
  };

  try {
    const contaminatedMessage = [
      "[CONFIGURACOES DO USUARIO]",
      "Ambiente profissional juridico.",
      "",
      "[RESUMO EXECUTIVO DA SALA]",
      "Usuario pediu antes: faca uma minuta com link para download e salve no Drive.",
      "Charlie respondeu antes: Minuta demonstrativa - documento solicitado. Arquivo salvo no Cartorio Digital Charlie Echo.",
      "",
      "[HISTORICO RECENTE]",
      "Usuario: quero link para donwload de uma minuta de pensao alimenticia",
      "Charlie Echo: Minuta demonstrativa - documento solicitado",
      "",
      "[PERGUNTA ATUAL]",
      "Agora explique responsabilidade social empresarial."
    ].join("\n");

    const response = await postIa(
      contaminatedMessage,
      {
        OPENAI_API_KEY: "test-key",
        JUS9_MODEL_DEFAULT: "test-model",
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(body.artifact, null);
    assert.equal(body.driveSaver, null);
    assert.match(body.answer, /Responsabilidade social empresarial/i);
    assert.doesNotMatch(body.answer, /Minuta demonstrativa|Arquivo salvo no Cartorio Digital|botoes da pagina/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("problem and justification planning prompt is not routed as document download", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: "Problema e justificativa: organizar a dor do usuario, a evidencia do problema, o impacto esperado e os criterios de validacao do MVP."
    });
  };

  try {
    const response = await postIa(
      "Problema e Justificativa do MVP DAJ: me ajude a organizar.",
      {
        OPENAI_API_KEY: "test-key",
        JUS9_MODEL_DEFAULT: "test-model",
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.artifact, null);
    assert.equal(body.driveSaver, null);
    assert.match(body.answer, /Problema e justificativa/i);
    assert.doesNotMatch(body.answer, /Minuta demonstrativa|Arquivo salvo no Cartorio Digital/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("sigiloso classification question is not routed as Drive Saver corrective action", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    assert.match(String(url), /api\.openai\.com/);
    return Response.json({
      output_text: "Classifique como JURIDICO_SIGILOSO quando houver risco juridico, dado sensivel, documento reservado ou contexto insuficiente. Nao exponha o conteudo; registre apenas metadados seguros e encaminhe para revisao humana."
    });
  };

  try {
    const response = await postIa(
      "No DAJ, como devo classificar um documento sigiloso sem expor o cofre?",
      {
        OPENAI_API_KEY: "test-key",
        JUS9_MODEL_DEFAULT: "test-model",
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 1);
    assert.match(body.answer, /JURIDICO_SIGILOSO|revisao humana/i);
    assert.doesNotMatch(body.answer, /Consigo fazer a correcao governada|fileId|Drive Saver parece/i);
    assert.equal(body.driveSaver, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Drive Saver corrective action revokes public link without OpenAI", async () => {
  const originalFetch = globalThis.fetch;
  const fileId = "1WnIK_dAlLjD5dxo1JH5GaAP7Vt3TB9iwA93dic7Zck4";
  globalThis.fetch = async (url, options = {}) => {
    assert.equal(String(url), "https://drive-saver.test/exec");
    const payload = JSON.parse(String(options.body || "{}"));
    assert.equal(payload.chaveInterna, "internal-test-key");
    assert.equal(payload.acao, "RESTRINGIR_LINK_PUBLICO");
    assert.equal(payload.fileId, fileId);
    assert.match(payload.motivo, /Revogacao de link publico/i);

    return Response.json({
      ok: true,
      status: "LINK_PUBLICO_RESTRINGIDO",
      mensagem: "Link publico revogado.",
      fileId,
      viewUrl: `https://docs.google.com/document/d/${fileId}/edit`,
      auditId: "audit-123",
      auditUrl: "https://docs.google.com/document/d/audit-123/edit",
      acaoExecutada: "RESTRINGIR_LINK_PUBLICO"
    });
  };

  try {
    const response = await postIa(
      `revogue o link publico deste documento https://docs.google.com/document/d/${fileId}/edit`,
      {
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.answer, /Pronto\. Restringi o link publico/i);
    assert.match(body.answer, /AuditId: audit-123/i);
    assert.equal(body.driveSaverAction.acao, "RESTRINGIR_LINK_PUBLICO");
    assert.equal(body.driveSaver.auditId, "audit-123");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Drive Saver corrective action diagnoses older Apps Script response", async () => {
  const originalFetch = globalThis.fetch;
  const fileId = "1WnIK_dAlLjD5dxo1JH5GaAP7Vt3TB9iwA93dic7Zck4";
  globalThis.fetch = async () => Response.json({
    ok: false,
    mensagem: "Falha no salvamento governado.",
    erro: "Conteudo vazio."
  });

  try {
    const response = await postIa(
      `revogue o link publico deste documento https://docs.google.com/document/d/${fileId}/edit`,
      {
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.ok, false);
    assert.match(body.answer, /Apps Script do Drive Saver parece ainda estar na versao anterior/i);
    assert.equal(body.driveSaver.reason, "Conteudo vazio.");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Drive Saver corrective action ignores FILE_ID placeholder and uses the real link", async () => {
  const originalFetch = globalThis.fetch;
  const fileId = "1iobpq0KhwG2iHy9nsIlsw0w-CMOGK0cASoA3LsrMDYI";
  let calls = 0;
  globalThis.fetch = async (url, options = {}) => {
    calls += 1;
    assert.equal(String(url), "https://drive-saver.test/exec");
    const payload = JSON.parse(String(options.body || "{}"));
    assert.equal(payload.acao, "RESTRINGIR_LINK_PUBLICO");
    assert.equal(payload.fileId, fileId);

    return Response.json({
      ok: true,
      status: "LINK_PUBLICO_RESTRINGIDO",
      mensagem: "Link publico revogado.",
      fileId,
      viewUrl: `https://docs.google.com/document/d/${fileId}/edit`,
      auditId: "audit-real-link",
      auditUrl: "https://docs.google.com/document/d/audit-real-link/edit"
    });
  };

  try {
    const response = await postIa(
      `revogue o link publico deste documento https://docs.google.com/document/d/FILE_ID/edit e tambem deste = https://docs.google.com/document/d/${fileId}/edit?usp=drivesdk`,
      {
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(calls, 1);
    assert.equal(body.ok, true);
    assert.equal(body.driveSaverAction.fileId, fileId);
    assert.deepEqual(body.driveSaverAction.fileIds, [fileId]);
    assert.doesNotMatch(body.answer, /Para pesquisar|Fontes recomendadas/i);
    assert.match(body.answer, /AuditId: audit-real-link/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Drive Saver corrective action wins before guided legal research", async () => {
  const originalFetch = globalThis.fetch;
  const fileId = "1WnIK_dAlLjD5dxo1JH5GaAP7Vt3TB9iwA93dic7Zck4";
  globalThis.fetch = async () => Response.json({
    ok: true,
    status: "LINK_PUBLICO_RESTRINGIDO",
    mensagem: "Link publico revogado.",
    fileId,
    auditId: "audit-priority"
  });

  try {
    const response = await postIa(
      `revogue o link publico deste documento https://docs.google.com/document/d/${fileId}/edit e depois pesquise jurisprudencia sobre alimentos`,
      {
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.driveSaverAction.acao, "RESTRINGIR_LINK_PUBLICO");
    assert.doesNotMatch(body.answer, /Para pesquisar|Jurisprudencia - trilha segura|Fontes recomendadas/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Drive Saver corrective action processes multiple real Drive links", async () => {
  const originalFetch = globalThis.fetch;
  const fileIds = [
    "1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "1bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
  ];
  const seen = [];
  globalThis.fetch = async (url, options = {}) => {
    assert.equal(String(url), "https://drive-saver.test/exec");
    const payload = JSON.parse(String(options.body || "{}"));
    seen.push(payload.fileId);

    return Response.json({
      ok: true,
      status: "LINK_PUBLICO_RESTRINGIDO",
      mensagem: "Link publico revogado.",
      fileId: payload.fileId,
      auditId: `audit-${payload.fileId.slice(1, 5)}`
    });
  };

  try {
    const response = await postIa(
      `revogue estes links https://docs.google.com/document/d/${fileIds[0]}/edit e https://drive.google.com/file/d/${fileIds[1]}/view`,
      {
        JUS9_DRIVE_SAVER_URL: "https://drive-saver.test/exec",
        JUS9_DRIVE_SAVER_CHAVE_INTERNA: "internal-test-key"
      }
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(seen, fileIds);
    assert.deepEqual(body.driveSaverAction.fileIds, fileIds);
    assert.equal(body.driveSaverResults.length, 2);
    assert.match(body.answer, /Acao governada processada para 2 arquivos/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Drive Saver Apps Script declares governed corrective actions", async () => {
  const code = await fs.readFile(new URL("../INTEGRACOES/JUS9_DRIVE_SAVER_MVP/Code.gs", import.meta.url), "utf8");

  assert.match(code, /RESTRINGIR_LINK_PUBLICO/);
  assert.match(code, /MOVER_PARA_REVISAO/);
  assert.match(code, /ENVIAR_LIXEIRA_GOVERNADA/);
  assert.match(code, /assertManagedDriveSaverFile_/);
  assert.match(code, /fileBelongsToManagedDriveSaverFolder_/);
  assert.match(code, /auditId/);
  assert.match(code, /idempotencyKey/);
  assert.match(code, /CacheService\.getScriptCache/);
  assert.match(code, /idempotentReplay/);
});
