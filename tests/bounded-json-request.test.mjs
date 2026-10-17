import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_PUBLIC_JSON_REQUEST_BYTES,
  readBoundedJsonRequest
} from "../functions/lib/bounded-json-request.js";

const url = "https://example.invalid/api/ia";
function request(body, headers = {}) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body
  });
}

test("API Echo: pequeno JSON válido mantém compatibilidade", async () => {
  const parsed = await readBoundedJsonRequest(request('{"message":"Olá","mode":"social"}'));
  assert.deepEqual(parsed, { ok: true, value: { message: "Olá", mode: "social" } });
});

test("API Echo: Content-Length grande rejeitado sem ler corpo", async () => {
  const parsed = await readBoundedJsonRequest(request('{"message":"ok"}', {
    "Content-Length": String(MAX_PUBLIC_JSON_REQUEST_BYTES + 1)
  }));
  assert.equal(parsed.ok, false);
  assert.equal(parsed.status, 413);
  assert.equal(JSON.stringify(parsed).includes("ok\"}"), false);
});

test("API Echo: corpo acima do limite rejeitado mesmo sem Content-Length", async () => {
  const parsed = await readBoundedJsonRequest(request(JSON.stringify({
    message: "x".repeat(MAX_PUBLIC_JSON_REQUEST_BYTES)
  })));
  assert.equal(parsed.ok, false);
  assert.equal(parsed.status, 413);
});

test("API Echo: Content-Length falso não contorna limite real do stream", async () => {
  const parsed = await readBoundedJsonRequest(request(JSON.stringify({
    message: "x".repeat(MAX_PUBLIC_JSON_REQUEST_BYTES)
  }), { "Content-Length": "1" }));
  assert.equal(parsed.ok, false);
  assert.equal(parsed.status, 413);
});

test("API Echo: entrada exatamente no limite é aceita", async () => {
  const payload = " ".repeat(MAX_PUBLIC_JSON_REQUEST_BYTES - 2) + "{}";
  const parsed = await readBoundedJsonRequest(request(payload));
  assert.deepEqual(parsed, { ok: true, value: {} });
});

test("API Echo: JSON malformado não expõe conteúdo da solicitação", async () => {
  const parsed = await readBoundedJsonRequest(request('{"message":"segredo-invalido"'));
  assert.equal(parsed.ok, false);
  assert.equal(parsed.status, 400);
  assert.equal(JSON.stringify(parsed).includes("segredo-invalido"), false);
});

test("API Echo: stream segmentado é interrompido ao atingir limite", async () => {
  let cancelled = false;
  let sent = 0;
  const body = new ReadableStream({
    pull(controller) {
      sent += 1;
      controller.enqueue(new Uint8Array(10_000));
    },
    cancel() { cancelled = true; }
  });
  const streamed = new Request(url, { method: "POST", body, duplex: "half" });
  const parsed = await readBoundedJsonRequest(streamed);
  assert.equal(parsed.status, 413);
  assert.equal(cancelled, true);
  assert.ok(sent <= 7, "a leitura deve parar próximo ao limite, sem acumular o corpo inteiro");
});

test("API Echo: ausência de corpo devolve erro controlado", async () => {
  const parsed = await readBoundedJsonRequest(new Request(url, { method: "POST" }));
  assert.equal(parsed.ok, false);
  assert.equal(parsed.status, 400);
});
