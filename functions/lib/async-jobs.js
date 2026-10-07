const MAX_MESSAGE_LENGTH = 4000;
const MAX_REQUEST_ID_LENGTH = 120;
const MAX_MODE_LENGTH = 64;
const MAX_METADATA_KEYS = 20;
const MAX_METADATA_VALUE_LENGTH = 240;
const DEFAULT_TTL_MS = 15 * 60 * 1000;

const TERMINAL_STATES = new Set(["succeeded", "failed", "expired", "reconciliation_required"]);
const TRANSITIONS = new Map([
  ["queued", new Set(["running", "expired", "reconciliation_required"])],
  ["running", new Set(["succeeded", "failed", "expired", "reconciliation_required"])],
  ["succeeded", new Set()],
  ["failed", new Set()],
  ["expired", new Set()],
  ["reconciliation_required", new Set()]
]);

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function randomId(prefix = "job") {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}_${uuid}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

function normalizeRequestId(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9._:-]/g, "")
    .slice(0, MAX_REQUEST_ID_LENGTH);
}

function normalizeMessage(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeMode(value) {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, MAX_MODE_LENGTH) : "";
}

function sanitizeMetadata(value) {
  if (value == null) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("metadata_must_be_object");
  }

  const entries = Object.entries(value).slice(0, MAX_METADATA_KEYS);
  const result = {};
  for (const [key, raw] of entries) {
    const safeKey = String(key).replace(/[^A-Za-z0-9_.:-]/g, "").slice(0, 64);
    if (!safeKey) continue;
    if (["message", "prompt", "response", "answer", "secret", "token", "credential"].includes(safeKey.toLowerCase())) {
      continue;
    }
    if (typeof raw === "string") result[safeKey] = raw.slice(0, MAX_METADATA_VALUE_LENGTH);
    else if (typeof raw === "number" && Number.isFinite(raw)) result[safeKey] = raw;
    else if (typeof raw === "boolean") result[safeKey] = raw;
  }
  return result;
}

function canonicalPayload({ message, mode, metadata }) {
  return JSON.stringify({
    message,
    mode,
    metadata: Object.fromEntries(Object.entries(metadata).sort(([a], [b]) => a.localeCompare(b)))
  });
}

async function sha256Hex(value) {
  if (!globalThis.crypto?.subtle) throw new Error("web_crypto_unavailable");
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validateInput(body) {
  const requestId = normalizeRequestId(body?.requestId);
  const message = normalizeMessage(body?.message);
  const mode = normalizeMode(body?.mode);

  if (!requestId) throw new Error("request_id_required");
  if (!message) throw new Error("message_required");
  if (message.length > MAX_MESSAGE_LENGTH) throw new Error("message_too_long");
  if (!mode) throw new Error("mode_required");

  return { requestId, message, mode, metadata: sanitizeMetadata(body?.metadata) };
}

function nowIso(now) {
  return new Date(now).toISOString();
}

function cloneJob(job) {
  return JSON.parse(JSON.stringify(job));
}

export function publicJob(job) {
  if (!job) return null;
  return {
    job_id: job.job_id,
    request_id: job.request_id,
    state: job.state,
    created_at: job.created_at,
    updated_at: job.updated_at,
    expires_at: job.expires_at,
    process_effect: "none",
    result_available: job.state === "succeeded" && Boolean(job.result_ref),
    failure_code: job.failure_code || null,
    reconciliation_required: job.state === "reconciliation_required",
  };
}

export function isTerminalState(state) {
  return TERMINAL_STATES.has(state);
}

export function transitionJob(job, nextState, { now = Date.now(), failureCode = null, resultRef = null } = {}) {
  if (!job || !TRANSITIONS.has(job.state)) throw new Error("invalid_job_state");
  if (!TRANSITIONS.get(job.state).has(nextState)) {
    throw new Error(`invalid_transition_${job.state}_to_${nextState}`);
  }

  const next = cloneJob(job);
  next.state = nextState;
  next.updated_at = nowIso(now);
  if (failureCode) next.failure_code = String(failureCode).slice(0, 120);
  if (resultRef) next.result_ref = String(resultRef).slice(0, 240);
  return next;
}

export async function createAsyncJob(body, { store, now = Date.now(), ttlMs = DEFAULT_TTL_MS } = {}) {
  if (!store || typeof store.getByRequestId !== "function" || typeof store.createIfAbsent !== "function" || typeof store.save !== "function") {
    throw new Error("async_job_store_not_configured");
  }

  const input = validateInput(body);
  const payloadHash = await sha256Hex(canonicalPayload(input));
  const created = {
    job_id: randomId(),
    request_id: input.requestId,
    payload_hash: payloadHash,
    state: "queued",
    created_at: nowIso(now),
    updated_at: nowIso(now),
    expires_at: nowIso(now + Math.max(1000, Math.trunc(ttlMs))),
    process_effect: "none",
    metadata: input.metadata,
    result_ref: null,
    failure_code: null,
  };
  const insertion = await store.createIfAbsent(created);
  if (insertion?.created === true) return { kind: "created", job: created };

  const existing = insertion?.job || await store.getByRequestId(input.requestId);
  if (!existing) throw new Error("async_job_store_inconsistent");
  if (existing.payload_hash === payloadHash) {
    return { kind: "replay", job: cloneJob(existing) };
  }
  const reconciled = existing.state === "reconciliation_required"
    ? existing
    : transitionJob(existing, "reconciliation_required", { now });
  await store.save(reconciled);
  return { kind: "conflict", job: cloneJob(reconciled) };
}

export async function expireIfNeeded(job, { now = Date.now(), store } = {}) {
  if (!job || isTerminalState(job.state) || Date.parse(job.expires_at) > now) return job;
  const expired = transitionJob(job, "expired", { now, failureCode: "ttl_expired" });
  if (store?.save) await store.save(expired);
  return expired;
}

export class MemoryAsyncJobStore {
  #jobs = new Map();

  async getByRequestId(requestId) {
    for (const job of this.#jobs.values()) {
      if (job.request_id === requestId) return cloneJob(job);
    }
    return null;
  }

  async get(jobId) {
    const job = this.#jobs.get(jobId);
    return job ? cloneJob(job) : null;
  }

  async createIfAbsent(job) {
    const existing = await this.getByRequestId(job.request_id);
    if (existing) return { created: false, job: existing };
    this.#jobs.set(job.job_id, cloneJob(job));
    return { created: true, job: cloneJob(job) };
  }

  async save(job) {
    this.#jobs.set(job.job_id, cloneJob(job));
  }
}

export function getAsyncJobRoute(request) {
  if (!request?.url) return null;
  const url = new URL(request.url);
  const match = url.pathname.match(/\/api\/ia\/jobs(?:\/([^/]+))?\/?$/);
  if (!match) return null;
  return { jobId: match[1] || null, collectionUrl: `${url.origin}/api/ia/jobs` };
}

export function getConfiguredAsyncJobStore(env) {
  const store = env?.ASYNC_JOB_STORE;
  if (!store || typeof store.getByRequestId !== "function" || typeof store.createIfAbsent !== "function" || typeof store.get !== "function" || typeof store.save !== "function") {
    return null;
  }
  return store;
}

export const asyncJobLimits = Object.freeze({
  maxMessageLength: MAX_MESSAGE_LENGTH,
  defaultTtlMs: DEFAULT_TTL_MS,
  supportedStates: ["queued", "running", "succeeded", "failed", "expired", "reconciliation_required"],
});
