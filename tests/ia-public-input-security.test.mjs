import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost } from "../functions/api/ia.js";

function post(body, headers = {}) {
  return new Request("https://charlieecho.test/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body
  });
}

test("rejects oversized public request before any upstream or storage side effect", async () => {
  const previousFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error("must_not_call"); };
  try {
    const payload = JSON.stringify({ message: "A".repeat(66000), mode: "estudantes" });
    const response = await onRequestPost({
      env: { OPENAI_API_KEY: "synthetic-test-key" },
      request: post(payload)
    });
    assert.equal(response.status, 413);
    assert.equal(calls, 0);
    assert.doesNotMatch(JSON.stringify(await response.json()), /synthetic-test-key/);
  } finally { globalThis.fetch = previousFetch; }
});

test("rejects forged low content-length through actual body measurement", async () => {
  const previousFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error("must_not_call"); };
  try {
    const response = await onRequestPost({
      env: { OPENAI_API_KEY: "synthetic-test-key" },
      request: post(JSON.stringify({ message: "B".repeat(66000) }), { "Content-Length": "10" })
    });
    assert.equal(response.status, 413);
    assert.equal(calls, 0);
  } finally { globalThis.fetch = previousFetch; }
});

test("upstream provider error text is not returned publicly", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: { message: "PRIVATE_PROVIDER_DEBUG_STRING" } }),
    { status: 429, headers: { "Content-Type": "application/json" } }
  );
  try {
    const response = await onRequestPost({
      env: { OPENAI_API_KEY: "synthetic-test-key" },
      request: post(JSON.stringify({ message: "Explique arrays", mode: "estudantes" }))
    });
    assert.equal(response.status, 502);
    assert.doesNotMatch(JSON.stringify(await response.json()), /PRIVATE_PROVIDER_DEBUG_STRING/);
  } finally { globalThis.fetch = previousFetch; }
});
