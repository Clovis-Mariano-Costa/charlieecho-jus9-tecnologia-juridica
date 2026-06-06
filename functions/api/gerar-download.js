const SUPPORTED_FORMATS = new Set([
  'txt', 'md', 'pdf', 'html', 'json', 'csv', 'ics', 'vcf', 'xml', 'log',
  'rtf', 'yaml', 'yml', 'sql', 'js', 'css', 'svg', 'tex', 'docx', 'xlsx',
  'pptx', 'zip'
]);

const MIME_TYPES = {
  txt: 'text/plain; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  pdf: 'application/pdf',
  html: 'text/html; charset=utf-8',
  json: 'application/json; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  ics: 'text/calendar; charset=utf-8',
  vcf: 'text/vcard; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
  log: 'text/plain; charset=utf-8',
  rtf: 'application/rtf',
  yaml: 'application/x-yaml; charset=utf-8',
  yml: 'application/x-yaml; charset=utf-8',
  sql: 'application/sql; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  svg: 'image/svg+xml; charset=utf-8',
  tex: 'application/x-tex; charset=utf-8',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip'
};

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const content = String(body.content || '').trim();
  const title = String(body.title || 'charlie-echo-download').trim();
  const requestedFormat = String(body.format || 'txt').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'txt';
  const format = SUPPORTED_FORMATS.has(requestedFormat) ? requestedFormat : 'txt';
  const safeTitle = slug(title);
  const filename = `${safeTitle}.${format}`;

  if (!content) {
    return Response.json({ error: 'Conteudo vazio. Nao ha arquivo para gerar.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const output = buildOutput(format, title, content, now);

  return new Response(output, {
    status: 200,
    headers: {
      'Content-Type': MIME_TYPES[format] || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function buildOutput(format, title, content, now) {
  if (format === 'pdf') return buildSimplePdf(title, content, now);
  if (format === 'docx') return buildDocx(title, content, now);
  if (format === 'xlsx') return buildXlsx(title, content, now);
  if (format === 'pptx') return buildPptx(title, content, now);
  if (format === 'zip') return buildPackageZip(title, content, now);
  if (format === 'md') return buildMarkdown(title, content, now);
  if (format === 'html') return buildHtml(title, content, now);
  if (format === 'json') return JSON.stringify({ title, generatedAt: now, origin: 'Charlie Echo da Costa - Jus 9 Tecnologia Juridica', content }, null, 2);
  if (format === 'csv') return `campo,valor\n"titulo","${csv(title)}"\n"gerado_em","${csv(now)}"\n"conteudo","${csv(content)}"\n`;
  if (format === 'ics') return buildIcs(title, content, now);
  if (format === 'vcf') return buildVcf(title, content);
  if (format === 'xml') return `<?xml version="1.0" encoding="UTF-8"?>\n<documento><titulo>${xml(title)}</titulo><geradoEm>${xml(now)}</geradoEm><origem>Charlie Echo da Costa - Jus 9 Tecnologia Juridica</origem><conteudo>${xml(content)}</conteudo></documento>\n`;
  if (format === 'log') return `[${now}] ${title}\n${content}\n`;
  if (format === 'rtf') return `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\fs24\\b ${rtf(title)}\\b0\\par\\par Gerado em: ${rtf(now)}\\par\\par ${rtf(content).replace(/\n/g, '\\par ')}}`;
  if (format === 'yaml' || format === 'yml') return `titulo: "${yaml(title)}"\ngerado_em: "${yaml(now)}"\norigem: "Charlie Echo da Costa - Jus 9 Tecnologia Juridica"\nconteudo: |\n${content.split(/\r?\n/).map((line) => `  ${line}`).join('\n')}\n`;
  if (format === 'sql') return `-- ${sql(title)}\n-- Gerado em: ${sql(now)}\nCREATE TABLE IF NOT EXISTS documento_charlie_echo (titulo TEXT, conteudo TEXT, gerado_em TEXT);\nINSERT INTO documento_charlie_echo (titulo, conteudo, gerado_em) VALUES ('${sql(title)}', '${sql(content)}', '${sql(now)}');\n`;
  if (format === 'js') return `// ${title}\n// Gerado em: ${now}\nexport const documentoCharlieEcho = ${JSON.stringify({ title, generatedAt: now, content }, null, 2)};\n`;
  if (format === 'css') return `/* ${title}\n   Gerado em: ${now}\n*/\n:root { --charlie-document-title: "${css(title)}"; }\n.charlie-echo-document::before { content: "${css(title)}"; }\n`;
  if (format === 'svg') return buildSvg(title, content, now);
  if (format === 'tex') return buildTex(title, content, now);
  return content;
}

function buildMarkdown(title, content, now) {
  return `# ${title}\n\n- Cabecalho: Jus 9 Tecnologia Juridica\n- Assistente: Charlie Echo da Costa\n- Gerado em: ${now}\n- Origem: Charlie Echo da Costa - Jus 9 Tecnologia Juridica\n- Classificacao inicial: documento gerado sob governanca humana\n\n## Conteudo\n\n${content}\n`;
}

function buildHtml(title, content, now) {
  return `<!doctype html>\n<html lang="pt-BR">\n<head><meta charset="utf-8"><title>${xml(title)}</title><style>body{font-family:Arial,sans-serif;line-height:1.6;max-width:860px;margin:40px auto;padding:0 20px;color:#172033;background:#fffaf0}.header{border:1px solid #d9b45c;border-radius:18px;padding:20px;background:linear-gradient(135deg,#071426,#10233a);color:#fff}.brand{letter-spacing:.08em;text-transform:uppercase;color:#f2c66d;font-weight:800}.meta{color:#536078}.content{white-space:pre-wrap;background:#fff;border:1px solid #ead9b6;padding:18px;border-radius:14px}</style></head>\n<body><section class="header"><div class="brand">Jus 9 Tecnologia Juridica</div><h1>${xml(title)}</h1><p>Charlie Echo da Costa</p></section><p class="meta"><strong>Gerado em:</strong> ${xml(now)}<br><strong>Classificacao inicial:</strong> documento gerado sob governanca humana</p><section class="content">${xml(content)}</section></body>\n</html>\n`;
}

function buildIcs(title, content, now) {
  const dt = now.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Jus9//Charlie Echo//PT-BR\nBEGIN:VEVENT\nUID:${crypto.randomUUID()}@charlieecho.jus9\nDTSTAMP:${dt}\nDTSTART:${dt}\nSUMMARY:${ics(title)}\nDESCRIPTION:${ics(content)}\nEND:VEVENT\nEND:VCALENDAR\n`;
}

function buildVcf(title, content) {
  return `BEGIN:VCARD\nVERSION:3.0\nFN:${ics(title)}\nORG:Jus 9 Tecnologia Juridica\nNOTE:${ics(content)}\nEND:VCARD\n`;
}

function buildSvg(title, content, now) {
  const lines = wrapLine(`${title} - ${content}`, 62).slice(0, 18);
  const text = lines.map((line, i) => `<text x="40" y="${88 + i * 28}" font-size="20" fill="#172033">${xml(line)}</text>`).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650" viewBox="0 0 1000 650"><rect width="100%" height="100%" fill="#fffaf0"/><text x="40" y="48" font-size="28" font-weight="700" fill="#8a5b12">${xml(title)}</text><text x="40" y="620" font-size="14" fill="#666">Gerado em ${xml(now)} - Charlie Echo / Jus 9</text>${text}</svg>\n`;
}

function buildTex(title, content, now) {
  return `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\title{${tex(title)}}\n\\author{Charlie Echo da Costa - Jus 9 Tecnologia Juridica}\n\\date{${tex(now)}}\n\\begin{document}\n\\maketitle\n\\section*{Conteudo}\n${tex(content)}\n\\end{document}\n`;
}

function buildDocx(title, content, now) {
  const paragraphs = buildDocumentParagraphs(title, content, now);
  return zipFiles({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
    'docProps/core.xml': coreProperties(title, now),
    'docProps/app.xml': appProperties('Charlie Echo Documentos'),
    'word/_rels/document.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'word/styles.xml': docxStyles(),
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.map((line, index) => docxPara(line, docxStyleFor(index, line))).join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1260" w:bottom="1440" w:left="1260" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`
  });
}

function docxStyleFor(index, text) {
  if (index === 0) return 'Brand';
  if (index === 1) return 'Subtitle';
  if (index === 2) return 'Title';
  if (/^(Conteudo|Gerado em:|Origem:|Classificacao inicial:|Uso:)/i.test(text || '')) return 'Meta';
  return 'Normal';
}

function docxPara(text, style = 'Normal') {
  const content = String(text || '');
  const styleXml = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : '';
  if (!content.trim()) return `<w:p>${styleXml}</w:p>`;
  return `<w:p>${styleXml}<w:r><w:t xml:space="preserve">${xml(content)}</w:t></w:r></w:p>`;
}

function docxStyles() {
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/><w:color w:val="24344A"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Brand"><w:name w:val="Brand"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="120"/></w:pPr><w:rPr><w:b/><w:caps/><w:color w:val="8A5A12"/><w:sz w:val="22"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:color w:val="51627A"/><w:sz w:val="24"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="120" w:after="240"/></w:pPr><w:rPr><w:b/><w:color w:val="0B1728"/><w:sz w:val="36"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Meta"><w:name w:val="Meta"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:color w:val="5B3B09"/><w:sz w:val="20"/></w:rPr></w:style>' +
    '</w:styles>';
}

function buildXlsx(title, content, now) {
  const rows = [
    ['Campo', 'Valor'],
    ['Titulo', title],
    ['Gerado em', now],
    ['Origem', 'Charlie Echo da Costa - Jus 9 Tecnologia Juridica'],
    ['Conteudo', content]
  ];
  const sheetRows = rows.map((row, i) => `<row r="${i + 1}">${row.map((cell, j) => `<c r="${String.fromCharCode(65 + j)}${i + 1}" t="inlineStr"><is><t>${xml(cell)}</t></is></c>`).join('')}</row>`).join('');
  return zipFiles({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Charlie Echo" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`
  });
}

function buildPptx(title, content, now) {
  const bodyLines = splitPdfContent(content).flatMap((line) => wrapLine(line, 58)).slice(0, 12);
  const bodyXml = bodyLines.map((line) => `<a:p><a:r><a:rPr lang="pt-BR" sz="1800"/><a:t>${xml(line)}</a:t></a:r></a:p>`).join('');
  return zipFiles({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/><Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/><Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
    'docProps/core.xml': coreProperties(title, now),
    'docProps/app.xml': appProperties('Charlie Echo Apresentacoes'),
    'ppt/_rels/presentation.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/><Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>',
    'ppt/presentation.xml': '<?xml version="1.0" encoding="UTF-8"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst><p:sldSz cx="12192000" cy="6858000" type="wide"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle><a:defPPr><a:defRPr lang="pt-BR"/></a:defPPr></p:defaultTextStyle></p:presentation>',
    'ppt/slideMasters/_rels/slideMaster1.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>',
    'ppt/slideMasters/slideMaster1.xml': slideMasterXml(),
    'ppt/slideLayouts/_rels/slideLayout1.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>',
    'ppt/slideLayouts/slideLayout1.xml': slideLayoutXml(),
    'ppt/slides/_rels/slide1.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>',
    'ppt/slides/slide1.xml': slideXml(title, bodyXml, now),
    'ppt/theme/theme1.xml': themeXml(),
    'ppt/presProps.xml': '<?xml version="1.0" encoding="UTF-8"?><p:presentationPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>',
    'ppt/viewProps.xml': '<?xml version="1.0" encoding="UTF-8"?><p:viewPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>',
    'ppt/tableStyles.xml': '<?xml version="1.0" encoding="UTF-8"?><a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>'
  });
}

function buildPackageZip(title, content, now) {
  return zipFiles({
    'README.md': buildMarkdown(title, content, now),
    'documento.pdf': buildSimplePdf(title, content, now),
    'documento.docx': buildDocx(title, content, now),
    'apresentacao.pptx': buildPptx(title, content, now),
    'metadata.json': JSON.stringify({ title, generatedAt: now, origin: 'Charlie Echo da Costa - Jus 9 Tecnologia Juridica' }, null, 2)
  });
}

function buildDocumentParagraphs(title, content, now) {
  return [
    'JUS 9 TECNOLOGIA JURIDICA',
    'Charlie Echo da Costa',
    title,
    '',
    `Gerado em: ${now}`,
    'Origem: Charlie Echo da Costa - Jus 9 Tecnologia Juridica',
    'Classificacao inicial: documento gerado sob governanca humana',
    '',
    'Conteudo',
    '',
    ...String(content || '').split(/\r?\n/)
  ];
}

function coreProperties(title, now) {
  return `<?xml version="1.0" encoding="UTF-8"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xml(title)}</dc:title><dc:creator>Charlie Echo da Costa - Jus 9 Tecnologia Juridica</dc:creator><cp:lastModifiedBy>Charlie Echo da Costa</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${xml(now)}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${xml(now)}</dcterms:modified></cp:coreProperties>`;
}

function appProperties(appName) {
  return `<?xml version="1.0" encoding="UTF-8"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>${xml(appName || 'Charlie Echo')}</Application><Company>Jus 9 Tecnologia Juridica</Company></Properties>`;
}

function slideXml(title, bodyXml, now) {
  return `<?xml version="1.0" encoding="UTF-8"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FBFAF7"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="Cabecalho"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="1000000"/></a:xfrm><a:solidFill><a:srgbClr val="07111F"/></a:solidFill></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="pt-BR" sz="1600" b="1"><a:solidFill><a:srgbClr val="E7C36C"/></a:solidFill></a:rPr><a:t>Jus 9 Tecnologia Juridica</a:t></a:r></a:p><a:p><a:r><a:rPr lang="pt-BR" sz="2600" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:rPr><a:t>Charlie Echo da Costa</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="Titulo"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="700000" y="1250000"/><a:ext cx="10800000" cy="950000"/></a:xfrm></p:spPr><p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr lang="pt-BR" sz="3200" b="1"><a:solidFill><a:srgbClr val="0B1728"/></a:solidFill></a:rPr><a:t>${xml(title)}</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="4" name="Conteudo"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="700000" y="2350000"/><a:ext cx="10800000" cy="3400000"/></a:xfrm><a:solidFill><a:srgbClr val="FFF7E2"/></a:solidFill><a:ln w="12700"><a:solidFill><a:srgbClr val="E7C36C"/></a:solidFill></a:ln></p:spPr><p:txBody><a:bodyPr lIns="220000" tIns="180000" rIns="220000" bIns="180000" wrap="square"/><a:lstStyle/>${bodyXml || '<a:p><a:r><a:rPr lang="pt-BR" sz="1800"/><a:t>Sem conteudo no momento.</a:t></a:r></a:p>'}</p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="5" name="Rodape"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="700000" y="6200000"/><a:ext cx="10800000" cy="300000"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="pt-BR" sz="1200"><a:solidFill><a:srgbClr val="51627A"/></a:solidFill></a:rPr><a:t>Gerado em ${xml(now)} - documento demonstrativo sob governanca humana.</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}

function slideMasterXml() {
  return '<?xml version="1.0" encoding="UTF-8"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>';
}

function slideLayoutXml() {
  return '<?xml version="1.0" encoding="UTF-8"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>';
}

function themeXml() {
  return '<?xml version="1.0" encoding="UTF-8"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Jus9"><a:themeElements><a:clrScheme name="Jus9"><a:dk1><a:srgbClr val="07111F"/></a:dk1><a:lt1><a:srgbClr val="FBFAF7"/></a:lt1><a:dk2><a:srgbClr val="0B1728"/></a:dk2><a:lt2><a:srgbClr val="FFF7E2"/></a:lt2><a:accent1><a:srgbClr val="C58B2F"/></a:accent1><a:accent2><a:srgbClr val="E7C36C"/></a:accent2><a:accent3><a:srgbClr val="51627A"/></a:accent3><a:accent4><a:srgbClr val="24344A"/></a:accent4><a:accent5><a:srgbClr val="8A5A12"/></a:accent5><a:accent6><a:srgbClr val="EEF4FF"/></a:accent6><a:hlink><a:srgbClr val="5B3B09"/></a:hlink><a:folHlink><a:srgbClr val="8A5A12"/></a:folHlink></a:clrScheme><a:fontScheme name="Jus9"><a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/></a:minorFont></a:fontScheme><a:fmtScheme name="Jus9"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>';
}

function toAscii(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '-');
}

function slug(text) {
  return toAscii(text).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 80) || 'charlie-echo-download';
}

function pdfSafeText(text) {
  return toAscii(text)
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2022\u00b7]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function pdfLiteral(text) {
  return `(${pdfSafeText(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')})`;
}

function pdfColor(hex) {
  const value = String(hex || '#000000').replace('#', '');
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  return [r, g, b].map((n) => (Number.isFinite(n) ? n.toFixed(3) : '0')).join(' ');
}

function pdfText(text, x, y, size = 11, font = 'F1', color = '#0b1728') {
  return `BT\n${pdfColor(color)} rg\n/${font} ${size} Tf\n1 0 0 1 ${x} ${y} Tm\n${pdfLiteral(text)} Tj\nET\n`;
}

function pdfRect(x, y, width, height, color) {
  return `q\n${pdfColor(color)} rg\n${x} ${y} ${width} ${height} re f\nQ\n`;
}

function wrapLine(line, max) {
  const words = pdfSafeText(line).replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const out = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      out.push(current);
      current = word.slice(0, max);
    } else {
      current = next;
    }
  }
  if (current) out.push(current);
  return out.length ? out : [''];
}

function splitPdfContent(content) {
  const paragraphs = String(content || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return paragraphs.length ? paragraphs : ['Sem conteudo no momento.'];
}

function buildSimplePdf(title, content, now) {
  const pages = [[]];
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  function current() {
    return pages[pages.length - 1];
  }

  function startPage() {
    pages.push([]);
    y = 782;
    current().push(pdfRect(0, 0, pageWidth, pageHeight, '#fbfaf7'));
    current().push(pdfText('Charlie Echo da Costa - Documento', margin, 806, 10, 'F2', '#8a5a12'));
    current().push(pdfRect(margin, 790, contentWidth, 1, '#e7c36c'));
  }

  function ensure(space) {
    if (y - space < 74) startPage();
  }

  function addWrapped(text, opts = {}) {
    const size = opts.size || 11;
    const lineHeight = opts.lineHeight || Math.round(size * 1.45);
    const width = opts.width || contentWidth;
    const limit = Math.max(24, Math.floor(width / (size * 0.5)));
    for (const line of wrapLine(text, limit)) {
      ensure(lineHeight + 2);
      current().push(pdfText(line, opts.x || margin, y, size, opts.font || 'F1', opts.color || '#24344a'));
      y -= lineHeight;
    }
  }

  function addSection(label) {
    ensure(44);
    y -= 10;
    current().push(pdfRect(margin, y - 7, 4, 22, '#c58b2f'));
    current().push(pdfText(label, margin + 12, y, 15, 'F2', '#0b1728'));
    y -= 26;
  }

  function addMetaCard() {
    const metaLines = [
      `Gerado em: ${now}`,
      'Origem: Charlie Echo da Costa - Jus 9 Tecnologia Juridica',
      'Classificacao inicial: documento gerado sob governanca humana',
      'Uso: apoio demonstrativo, com revisao humana quando houver risco.'
    ];
    const wrapped = metaLines.flatMap((line) => wrapLine(line, 74));
    const cardHeight = 42 + wrapped.length * 15;
    ensure(cardHeight + 20);
    current().push(pdfRect(margin, y - cardHeight, contentWidth, cardHeight + 10, '#fff7e2'));
    current().push(pdfRect(margin, y - cardHeight, 5, cardHeight + 10, '#c58b2f'));
    current().push(pdfText('Informacoes do documento', margin + 18, y - 12, 13, 'F2', '#5b3b09'));
    let metaY = y - 34;
    for (const line of wrapped) {
      current().push(pdfText(line, margin + 18, metaY, 10.5, 'F1', '#24344a'));
      metaY -= 15;
    }
    y -= cardHeight + 24;
  }

  current().push(pdfRect(0, 0, pageWidth, pageHeight, '#fbfaf7'));
  current().push(pdfRect(0, 760, pageWidth, 82, '#07111f'));
  current().push(pdfText('Jus 9 Tecnologia Juridica', margin, 810, 11, 'F2', '#e7c36c'));
  current().push(pdfText('Documento da Charlie Echo', margin, 790, 18, 'F2', '#ffffff'));
  current().push(pdfText('Gerado pelo servidor da Charlie Echo, com padrao visual profissional.', margin, 770, 10.5, 'F1', '#dbe5f3'));
  y = 718;
  addWrapped(title || 'Documento Charlie Echo', { size: 22, lineHeight: 28, font: 'F2', color: '#0b1728' });
  addWrapped('Conteudo organizado para leitura, compartilhamento e revisao humana responsavel.', { size: 11.5, lineHeight: 17, color: '#51627a' });
  y -= 8;
  addMetaCard();
  addSection('Conteudo');
  for (const paragraph of splitPdfContent(content)) {
    addWrapped(paragraph, { size: 11, lineHeight: 16, color: '#24344a' });
    y -= 5;
  }

  pages.forEach((commands, index) => {
    commands.push(pdfRect(margin, 52, contentWidth, 1, '#eadfca'));
    commands.push(pdfText('Charlie Echo da Costa - Jus 9 Tecnologia Juridica', margin, 34, 9, 'F1', '#51627a'));
    commands.push(pdfText(`Pagina ${index + 1} de ${pages.length}`, pageWidth - margin - 70, 34, 9, 'F1', '#51627a'));
  });

  const objects = [];
  const add = (value) => {
    objects.push(value);
    return objects.length;
  };
  const catalogId = add('');
  const pagesId = add('');
  const fontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldFontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pageIds = [];
  for (const commands of pages) {
    const stream = commands.join('');
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
    const pageId = add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  }
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  return pdfFromObjects(objects);
}

function pdfFromObjects(objects) {
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

function zipFiles(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const entries = Object.entries(files);
  for (const [name, value] of entries) {
    const nameBytes = encoder.encode(name);
    const data = value instanceof Uint8Array ? value : encoder.encode(String(value));
    const crc = crc32(data);
    const local = concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length),
      u16(nameBytes.length), u16(0), nameBytes, data
    ]);
    localParts.push(local);
    centralParts.push(concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length),
      u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes
    ]));
    offset += local.length;
  }
  const central = concat(centralParts);
  const end = concat([u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length), u32(central.length), u32(offset), u16(0)]);
  return concat([...localParts, central, end]);
}

function concat(parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function u16(value) {
  return new Uint8Array([value & 255, (value >> 8) & 255]);
}

function u32(value) {
  return new Uint8Array([value & 255, (value >> 8) & 255, (value >> 16) & 255, (value >> 24) & 255]);
}

function crc32(data) {
  let crc = -1;
  for (let i = 0; i < data.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 255];
  }
  return (crc ^ -1) >>> 0;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function csv(text) { return String(text || '').replace(/"/g, '""'); }
function xml(text) { return String(text || '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c])); }
function ics(text) { return toAscii(text).replace(/[\\;,]/g, '\\$&').replace(/\r?\n/g, '\\n'); }
function rtf(text) { return toAscii(text).replace(/[\\{}]/g, '\\$&'); }
function yaml(text) { return String(text || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }
function sql(text) { return String(text || '').replace(/'/g, "''"); }
function css(text) { return String(text || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' '); }
function tex(text) { return toAscii(text).replace(/([#$%&_{}])/g, '\\$1').replace(/\^/g, '\\^{}').replace(/~/g, '\\~{}').replace(/\n/g, '\n\n'); }
