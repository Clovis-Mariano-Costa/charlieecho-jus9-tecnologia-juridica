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
  assert.match(body.answer, /Para pesquisar/i);
  assert.match(body.answer, /Jurisprudencia - trilha segura/i);
});

test("download prompt forbids empty link promises", async () => {
  const apiHandler = await fs.readFile(new URL("../functions/api/ia.js", import.meta.url), "utf8");

  assert.match(apiHandler, /nao prometa "vou disponibilizar"/i);
  assert.match(apiHandler, /Drive Saver estiver configurado/i);
  assert.match(apiHandler, /link real/i);
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
    assert.match(body.answer, /Estrutura da minuta/i);
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
    assert.match(body.answer, /AO JUIZO DA VARA DE FAMILIA/i);
    assert.match(body.answer, /\[NOME DO ALIMENTANDO\]/i);
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
    assert.match(body.answer, /AO JUIZO DA VARA DE FAMILIA/i);
    assert.match(body.answer, /\[NOME DO ALIMENTANDO\]/i);
    assert.doesNotMatch(body.answer, /Posso preparar|disponibilizado|alguma informacao especifica/i);
    assert.match(body.answer, /botoes da pagina/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("document download autonomously saves public demonstrative draft to Drive Saver", async () => {
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
    assert.match(payload.conteudo, /AO JUIZO DA VARA DE FAMILIA/i);

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
    assert.match(body.answer, /Link de download: https:\/\/docs\.google\.com\/document\/d\/drive-file-123\/export\?format=pdf/i);
    assert.equal(body.artifact.driveDecision.classificacao, "PUBLICO");
    assert.equal(body.artifact.criarLinkDownload, true);
    assert.equal(body.driveSaver.downloadUrl, "https://docs.google.com/document/d/drive-file-123/export?format=pdf");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
