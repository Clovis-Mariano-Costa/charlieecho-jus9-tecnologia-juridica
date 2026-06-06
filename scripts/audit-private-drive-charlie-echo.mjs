#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const privateRoot = 'G:\\Meu Drive\\charlieecho-jus9-tecnologia-juridica';
const sensitivePattern = /(token|api|chave|secret|senha|cofre|dna|whatsapp|nao.publicar|não.publicar|privado|secreto)/i;

const result = {
  root: privateRoot,
  exists: fs.existsSync(privateRoot),
  directories: 0,
  files: 0,
  extensions: {},
  sensitiveNameHits: 0,
  topLevel: []
};

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.directories += 1;
      if (path.dirname(full) === privateRoot) result.topLevel.push({ type: 'dir', name: entry.name });
      if (sensitivePattern.test(full)) result.sensitiveNameHits += 1;
      walk(full);
      continue;
    }
    if (entry.isFile()) {
      result.files += 1;
      if (path.dirname(full) === privateRoot) result.topLevel.push({ type: 'file', name: entry.name });
      const ext = path.extname(entry.name).toLowerCase() || '(sem extensao)';
      result.extensions[ext] = (result.extensions[ext] || 0) + 1;
      if (sensitivePattern.test(full)) result.sensitiveNameHits += 1;
    }
  }
}

if (result.exists) walk(privateRoot);

console.log(JSON.stringify(result, null, 2));

if (!result.exists) {
  console.error('PRIVATE_DRIVE_MISSING');
  process.exit(1);
}

console.log('PRIVATE_DRIVE_CHARLIE_ECHO_OK inventario-sem-conteudo');
