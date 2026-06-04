#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const htmlFiles = [
  'index.html',
  'ia-estudantes.html',
  'ia-estudantes/index.html',
  'ia-profissional.html',
  'ia-profissional/index.html'
];

for (const file of htmlFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    failures.push(`${file}: arquivo nao encontrado.`);
    continue;
  }
  const html = fs.readFileSync(full, 'utf8');
  if (file === 'index.html' && /Governan\?a/.test(html)) {
    failures.push(`${file}: botao Governanca ainda esta quebrado.`);
  }
  if (/ia-(estudantes|profissional)/.test(file)) {
    if (!html.includes('chat-room-panel')) failures.push(`${file}: painel de salas ausente.`);
    if (!html.includes('charlie-ia-pages.js?v=3.7')) failures.push(`${file}: script sem versao v3.7 para evitar cache.`);
    if (!html.includes('.png') || !html.includes('.docx') || !html.includes('.xlsx')) {
      failures.push(`${file}: tipos de anexo ampliados ausentes.`);
    }
  }
}

const jsPath = path.join(root, 'assets/js/charlie-ia-pages.js');
const js = fs.readFileSync(jsPath, 'utf8');
for (const token of ['ensureTesseract', 'readImageOcr', 'ocrPdfFirstPages', 'initRooms', 'rememberExchange', 'buildMessageWithRoomMemory']) {
  if (!js.includes(token)) failures.push(`charlie-ia-pages.js: ${token} ausente.`);
}
if (js.includes("window.prompt('Nome da nova sala:'")) {
  failures.push('charlie-ia-pages.js: Nova sala ainda depende de prompt().');
}
if (!js.includes('continuationFallback')) {
  failures.push('charlie-ia-pages.js: fallback de continuidade ausente.');
}

const cssPath = path.join(root, 'assets/css/charlie-light.css');
const css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.chat-room-panel')) failures.push('charlie-light.css: estilos de sala ausentes.');

if (failures.length) {
  console.error('Auditoria Charlie Echo encontrou pendencias:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Auditoria Charlie Echo OK: salas, memoria curta, anexos ampliados, OCR local e botao Governanca verificados.');
