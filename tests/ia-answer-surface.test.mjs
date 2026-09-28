import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost } from "../functions/api/ia.js";

// Exercises the real response pipeline; fetch is mocked so no API credit is used.
test("public answers preserve useful content without automatic internal narration", async (t) => {
  const cases = [
    ["Explique arrays", "Arrays guardam uma sequência de valores."],
    ["Não entendi o exercício", "Vamos revisar o exercício com um exemplo simples."],
    ["Qual o prazo?", "O prazo depende do ato e da data. Confirme com profissional habilitado."],
    ["Explique governança", "Governança organiza responsabilidades e critérios de decisão."],
    ["Explique seu método", "Comparei os critérios apresentados e distingui fatos de hipóteses."],
    ["Como proteger uma senha?", "Não compartilhe sua senha. Use autenticação adicional quando disponível."]
  ];
  for (const [message, answer] of cases) {
    await t.test(message, async () => {
      const previousFetch = globalThis.fetch;
      let calls = 0;
      globalThis.fetch = async (url) => {
        assert.equal(String(url), "https://api.openai.com/v1/responses");
        calls += 1;
        return Response.json({ output_text: answer });
      };
      try {
        const response = await onRequestPost({
          env: { OPENAI_API_KEY: "test-key-not-a-credential" },
          request: new Request("https://charlieecho.test/api/ia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, mode: "estudantes", requestId: "surface-test" })
          })
        });
        const body = await response.json();
        assert.equal(response.status, 200, JSON.stringify(body));
        assert.equal(calls, 1);
        assert.ok(body.answer.includes(answer), "Must retain the substantive answer and safety guidance");
        assert.doesNotMatch(body.answer, /(?:Escuta|Sentire|Leitura do pedido|Caminho escolhido):/i);
        assert.ok(body.governance, "Must retain governed response metadata");
      } finally {
        globalThis.fetch = previousFetch;
      }
    });
  }
});
