import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost } from "../functions/api/ia.js";

function requestFor(message = "Explique arrays") {
  return new Request("https://charlieecho.test/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode: "profissional", requestId: "s45-upstream-test" })
  });
}

test("generative subrequest aborts locally and returns governed JSON timeout", async () => {
  const previousFetch = globalThis.fetch;
  const previousError = console.error;
  const logs = [];
  let observedClientRequestId = null;

  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), "https://api.openai.com/v1/responses");
    observedClientRequestId = init.headers.get("X-Client-Request-Id");
    return new Promise(() => {});
  };
  console.error = (...args) => logs.push(args.join(" "));

  try {
    const response = await onRequestPost({
      env: {
        OPENAI_API_KEY: "test-key-not-a-credential",
        JUS9_OPENAI_TIMEOUT_MS: "100"
      },
      request: requestFor()
    });
    const body = await response.json();

    assert.equal(response.status, 504, JSON.stringify(body));
    assert.equal(body.ok, false);
    assert.equal(body.debug?.failure_class, "timeout_soft");
    assert.equal(body.debug?.route, "responses");
    assert.equal(body.debug?.timed_out, true);
    assert.equal(body.debug?.timeout_ms, 100);
    assert.match(observedClientRequestId, /^charlie-echo-/);
    assert.equal(body.debug?.client_request_id, observedClientRequestId);

    const logged = logs.join("\n");
    assert.match(logged, /charlie_echo_openai_upstream/);
    assert.doesNotMatch(logged, /Explique arrays/);
    assert.doesNotMatch(logged, /test-key-not-a-credential/);
  } finally {
    globalThis.fetch = previousFetch;
    console.error = previousError;
  }
});

test("upstream HTTP failure keeps request ids and status without logging prompt or secret", async () => {
  const previousFetch = globalThis.fetch;
  const previousError = console.error;
  const logs = [];
  let observedClientRequestId = null;

  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), "https://api.openai.com/v1/responses");
    observedClientRequestId = init.headers.get("X-Client-Request-Id");
    return new Response(JSON.stringify({ error: { message: "synthetic rate limit" } }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "x-request-id": "req_s45_safe_123",
        "openai-processing-ms": "42"
      }
    });
  };
  console.error = (...args) => logs.push(args.join(" "));

  try {
    const response = await onRequestPost({
      env: { OPENAI_API_KEY: "test-key-not-a-credential" },
      request: requestFor("Explique objetos em JavaScript")
    });
    const body = await response.json();

    assert.equal(response.status, 502, JSON.stringify(body));
    assert.equal(body.debug?.failure_class, "upstream_http_error");
    assert.equal(body.debug?.upstream_status, 429);
    assert.equal(body.debug?.upstream_request_id, "req_s45_safe_123");
    assert.equal(body.debug?.upstream_processing_ms, "42");
    assert.equal(body.debug?.client_request_id, observedClientRequestId);
    assert.match(observedClientRequestId, /^charlie-echo-/);

    const logged = logs.join("\n");
    assert.match(logged, /req_s45_safe_123/);
    assert.doesNotMatch(logged, /Explique objetos em JavaScript/);
    assert.doesNotMatch(logged, /test-key-not-a-credential/);
    assert.doesNotMatch(logged, /synthetic rate limit/);
  } finally {
    globalThis.fetch = previousFetch;
    console.error = previousError;
  }
});
