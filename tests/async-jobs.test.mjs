import assert from "node:assert/strict";
import test from "node:test";
import { onRequestGet, onRequestPost } from "../functions/api/ia.js";
import { MemoryAsyncJobStore } from "../functions/lib/async-jobs.js";

function postRequest(body) {
  return new Request("https://charlieecho.test/api/ia/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("async jobs fail closed without a durable store", async () => {
  const response = await onRequestPost({ request: postRequest({ message: "hello", mode: "estudantes", requestId: "s52-no-store" }), env: {} });
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.error, "async_job_store_not_configured");
  assert.equal(body.process_effect, "none");
});

test("async jobs return 202, poll URL, and a terminal-safe idempotent replay", async () => {
  const store = new MemoryAsyncJobStore();
  const env = { ASYNC_JOB_STORE: store };
  const input = { message: "hello", mode: "estudantes", requestId: "s52-replay", metadata: { source: "synthetic" } };

  const first = await onRequestPost({ request: postRequest(input), env });
  const firstBody = await first.json();
  assert.equal(first.status, 202, JSON.stringify(firstBody));
  assert.equal(firstBody.ok, true);
  assert.equal(firstBody.state, "queued");
  assert.equal(firstBody.queued, true);
  assert.equal(firstBody.process_effect, "none");
  assert.match(firstBody.poll_url, /\/api\/ia\/jobs\/job_/);
  assert.ok(firstBody.expires_at);

  const replay = await onRequestPost({ request: postRequest(input), env });
  const replayBody = await replay.json();
  assert.equal(replay.status, 202, JSON.stringify(replayBody));
  assert.equal(replayBody.job_id, firstBody.job_id);
  assert.equal(replayBody.idempotent_replay, true);

  const poll = await onRequestGet({
    request: new Request(firstBody.poll_url),
    env,
  });
  const pollBody = await poll.json();
  assert.equal(poll.status, 200, JSON.stringify(pollBody));
  assert.equal(pollBody.job.state, "queued");
  assert.equal(pollBody.job.process_effect, "none");
  assert.equal("message" in pollBody.job, false);
  assert.equal("payload_hash" in pollBody.job, false);
});

test("same request ID with a different payload becomes reconciliation_required", async () => {
  const store = new MemoryAsyncJobStore();
  const env = { ASYNC_JOB_STORE: store };
  await onRequestPost({ request: postRequest({ message: "first", mode: "estudantes", requestId: "s52-conflict" }), env });

  const conflict = await onRequestPost({
    request: postRequest({ message: "different", mode: "estudantes", requestId: "s52-conflict" }),
    env,
  });
  const body = await conflict.json();
  assert.equal(conflict.status, 409);
  assert.equal(body.ok, false);
  assert.equal(body.reconciliation_required, true);
  assert.equal(body.state, "reconciliation_required");
  assert.equal(body.process_effect, "none");
});

test("invalid async input is rejected before any job is created", async () => {
  const store = new MemoryAsyncJobStore();
  const response = await onRequestPost({
    request: postRequest({ message: "", mode: "estudantes", requestId: "s52-invalid" }),
    env: { ASYNC_JOB_STORE: store },
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.error, "message_required");
  assert.equal(await store.getByRequestId("s52-invalid"), null);
});
