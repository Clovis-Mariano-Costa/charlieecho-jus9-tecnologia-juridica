import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const { onRequestPost } = await import("../functions/api/ia.js");

async function postIa(message, env = {}) {
  return onRequestPost({
    env,
    request: new Request("https://charlieecho.test/api/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        mode: "profissional"
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

test("document download typo donwload does not fall into guided legal research", async () => {
  const response = await postIa("quero link para donwload de uma minuta de pensao alimenticia");
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.ok, false);
  assert.doesNotMatch(String(body.answer || body.error || ""), /Para pesquisar/i);
  assert.doesNotMatch(String(body.answer || body.error || ""), /Fontes recomendadas/i);
});

test("explicit jurisprudence research still uses guided legal research", async () => {
  const response = await postIa("pesquise jurisprudencia sobre revisao de alimentos");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.governance.targetMvp, "DAJ_ADVOGADOS");
  assert.equal(body.governance.driveMemory.official, true);
  assert.match(body.answer, /Para pesquisar/i);
  assert.match(body.answer, /Jurisprudencia - trilha segura/i);
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
});
