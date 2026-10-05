import assert from "node:assert/strict";
import test from "node:test";
import { onRequestGet } from "../functions/api/ia.js";

test("GET exposes safe upstream guard runtime marker without secrets", async () => {
  const response = await onRequestGet();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.upstreamGuard?.version, "s48");
  assert.equal(body.upstreamGuard?.timeoutPolicy, "JUS9_OPENAI_TIMEOUT_MS_or_3000ms");
  assert.equal(body.upstreamGuard?.correlation, "X-Client-Request-Id");
  assert.equal(body.upstreamGuard?.publicDiagnosticsContainContent, false);
  assert.doesNotMatch(JSON.stringify(body), /OPENAI_API_KEY|Bearer|secret[-_]?value/i);
});
