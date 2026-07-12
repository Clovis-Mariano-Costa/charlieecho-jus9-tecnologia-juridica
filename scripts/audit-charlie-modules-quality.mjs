#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const modules = [
  { name: 'estudantes', files: ['ia-estudantes.html', 'ia-estudantes/index.html'] },
  { name: 'profissional', files: ['ia-profissional.html', 'ia-profissional/index.html'] }
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

for (const module of modules) {
  for (const file of module.files) {
    if (!fs.existsSync(path.join(root, file))) {
      failures.push(`${module.name}: ${file} ausente`);
      continue;
    }
    const html = read(file);
    for (const token of [
      'chat-room-panel',
      'data-room-new',
      'data-room-rename',
      'data-room-archive',
      'data-room-delete',
      'data-attach-input',
      'charlie-ia-pages.js?v=3.8'
    ]) {
      if (!html.includes(token)) failures.push(`${file}: token ausente ${token}`);
    }
    const downloadToken = module.name === 'estudantes' ? 'data-student-action="download"' : 'data-prof-action="download"';
    if (!html.includes(downloadToken)) failures.push(`${file}: token ausente ${downloadToken}`);
  }
}

const browserScript = read('assets/js/charlie-ia-pages.js');
for (const token of [
  'Baixar PDF',
  'Baixar DOCX',
  'Baixar PPTX',
  'Baixar ZIP',
  'showDownloadMenu',
  'buildMessageWithAttachments',
  'ensureTesseract',
  'readImageOcr',
  'readPdfText',
  'initRooms',
  'rememberExchange',
  'buildMessageWithRoomMemory',
  'target="_blank" rel="noopener noreferrer"'
]) {
  if (!browserScript.includes(token)) failures.push(`charlie-ia-pages.js: token ausente ${token}`);
}

for (const forbidden of ['Baixar .txt local', 'Baixar .xlsx pelo servidor']) {
  if (browserScript.includes(forbidden)) failures.push(`charlie-ia-pages.js: opcao antiga retornou ${forbidden}`);
}

const apiHandler = read('functions/api/ia.js');
for (const token of [
  'PROTOCOLO SENTIRE 1.0',
  'PROTOCOLO ENTRELINHAS 1.0',
  'PESQUISA JURIDICA ATIVA 1.0',
  'asksActiveLegalCitationResearch',
  'activeLegalResearchContext',
  'callOpenAiActiveLegalSearch',
  'activeLegalChatSearchModel',
  'appendWebSearchSources',
  'https://api.openai.com/v1/chat/completions',
  'web_search_options',
  'gpt-5-search-api',
  'Escuta:',
  'Sentire: risco',
  'applyCreativeSurface',
  'inferListeningMode',
  'inferSentireRisk'
]) {
  if (!apiHandler.includes(token)) failures.push(`functions/api/ia.js: token ausente ${token}`);
}

const downloadHandler = read('functions/api/gerar-download.js');
for (const token of [
  'Helvetica-Bold',
  'Informacoes do documento',
  'word/styles.xml',
  'ppt/slideMasters/slideMaster1.xml',
  'ppt/theme/theme1.xml',
  'ppt/slides/_rels/slide1.xml.rels',
  'apresentacao.pptx'
]) {
  if (!downloadHandler.includes(token)) failures.push(`functions/api/gerar-download.js: token ausente ${token}`);
}

if (failures.length) {
  console.error('Auditoria de qualidade por modulo encontrou pendencias:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('CHARLIE_MODULES_QUALITY_OK downloads,salas,memoria,ocr,links,sentire,escuta');
