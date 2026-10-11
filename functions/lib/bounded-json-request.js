/**
 * Read untrusted JSON requests with a strict byte cap before deserialization.
 * The Content-Length header is an early rejection hint, not a trust boundary.
 * The stream cap still applies when that header is absent or inaccurate.
 */
export const MAX_PUBLIC_JSON_REQUEST_BYTES = 64 * 1024;

const TOO_LARGE = Object.freeze({
  ok: false,
  status: 413,
  error: "A solicitação excede o tamanho permitido para a versão pública."
});
const INVALID_JSON = Object.freeze({
  ok: false,
  status: 400,
  error: "Não foi possível interpretar o JSON da solicitação."
});

export async function readBoundedJsonRequest(request, maxBytes = MAX_PUBLIC_JSON_REQUEST_BYTES) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new TypeError("max_request_bytes_invalid");
  }

  const reportedLength = request?.headers?.get?.("content-length");
  if (reportedLength && /^\d+$/.test(reportedLength.trim())) {
    if (Number(reportedLength) > maxBytes) return TOO_LARGE;
  }

  if (!request?.body || typeof request.body.getReader !== "function") {
    return INVALID_JSON;
  }

  const reader = request.body.getReader();
  const chunks = [];
  let bytesRead = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) {
        await reader.cancel().catch(() => {});
        return INVALID_JSON;
      }
      if (value.byteLength > maxBytes - bytesRead) {
        await reader.cancel().catch(() => {});
        return TOO_LARGE;
      }
      bytesRead += value.byteLength;
      chunks.push(value);
    }
  } catch {
    return INVALID_JSON;
  } finally {
    reader.releaseLock();
  }

  const boundedBytes = new Uint8Array(bytesRead);
  let offset = 0;
  for (const chunk of chunks) {
    boundedBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(boundedBytes);
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return INVALID_JSON;
  }
}
