import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../mapa-canais.html", import.meta.url), "utf8");
const jsonText = await readFile(
  new URL("../data-publica/mapa-canais-charlie-echo.json", import.meta.url),
  "utf8",
);
const mapText = await readFile(
  new URL("../GOVERNANCA/MAPA_PUBLICO_CANAIS_CHARLIE_ECHO.md", import.meta.url),
  "utf8",
);
const data = JSON.parse(jsonText);

assert.equal(data.schema, "jus9.charlieecho.channels.public.v2");
assert.equal(data.language, "pt-BR");
assert.equal(data.formation.module_0_status, "Praticou");
assert.equal(data.formation.authorized_to_teach_programming, false);
assert.equal(data.formation.autonomous_execution_demonstrated, false);

assert.match(html, /<html lang="pt-BR">/);
assert.match(html, /<meta name="description"/);
assert.match(html, /rel="canonical"/);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.match(html, /Ainda não concedida|ainda não concedida/);
assert.doesNotMatch(html, /\btoken\s*[:=]\s*["'][^"']+/i);

assert.match(mapText, /futura CEO das I\.As/i);
assert.match(mapText, /depende de\s+competências demonstradas/i);
assert.match(mapText, /Módulo 0: `Praticou`/);
assert.match(mapText, /autorização para ensinar programação: não concedida/i);

console.log("Mapa integral de Charlie Echo: validação aprovada.");
