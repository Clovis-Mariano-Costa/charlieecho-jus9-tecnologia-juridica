// S52 contract primitives only. No queue, persistence, external API calls or deploy.
// Runtime adapter and authenticated routing are deliberately NOT enabled here.
export const JOB_STATUSES = Object.freeze(["queued","running","succeeded","failed","expired","reconciliation_required"]);
export const JOB_MODES = Object.freeze(["estudantes","profissional","social"]);
const REQUEST_ID = /^[A-Za-z0-9._:-]{1,120}$/;
const JOB_ID = /^[A-Za-z0-9._:-]{1,160}$/;

export function parseJobRequest(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok:false, code:"invalid_envelope" };
  if (typeof input.message !== "string" || !input.message.trim() || input.message.length > 8000) return { ok:false, code:"invalid_message" };
  if (typeof input.requestId !== "string" || !REQUEST_ID.test(input.requestId)) return { ok:false, code:"invalid_request_id" };
  if (!JOB_MODES.includes(input.mode)) return { ok:false, code:"invalid_mode" };
  if (input.process_effect != null && input.process_effect !== "none") return { ok:false, code:"side_effect_not_allowed" };
  if (input.route != null || input.artifact != null || input.driveSaver != null) return { ok:false, code:"unsupported_side_effect_fields" };
  return { ok:true, value:{ message:input.message.trim(), mode:input.mode, requestId:input.requestId, process_effect:"none" } };
}

export async function fingerprintJobRequest(value) {
  const bytes = new TextEncoder().encode(JSON.stringify([value.mode,value.message,"none"]));
  const digest = await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,"0")).join("");
}

export function reconcileDuplicate(existing, incomingHash) {
  if (!existing || typeof existing !== "object" || typeof existing.payload_hash !== "string") return { ok:false, status:"reconciliation_required" };
  if (existing.payload_hash !== incomingHash) return { ok:false, status:"reconciliation_required" };
  if (!JOB_STATUSES.includes(existing.status)) return { ok:false, status:"reconciliation_required" };
  return { ok:true, status:existing.status, job_id:existing.job_id };
}

export function publicJobState(job) {
  if (!job || !JOB_ID.test(String(job.job_id || "")) || !JOB_STATUSES.includes(job.status)) return null;
  const result = { job_id:job.job_id, status:job.status, process_effect:"none" };
  if (typeof job.expires_at === "string") result.expires_at=job.expires_at;
  if (job.status === "succeeded" && typeof job.answer === "string") result.answer=job.answer;
  if (job.status === "failed") result.error_code=typeof job.error_code === "string" && /^[a-z_]{1,48}$/.test(job.error_code) ? job.error_code : "job_failed";
  return result;
}

export function jobPollPath(jobId) {
  if (!JOB_ID.test(String(jobId || ""))) return null;
  return "/api/ia/jobs/" + encodeURIComponent(jobId);
}
