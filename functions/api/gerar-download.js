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
  return `# ${title}\n\n- Gerado em: ${now}\n- Origem: Charlie Echo da Costa - Jus 9 Tecnologia Juridica\n- Classificacao inicial: documento gerado sob governanca humana\n\n## Conteudo\n\n${content}\n`;
}

function buildHtml(title, content, now) {
  return `<!doctype html>\n<html lang="pt-BR">\n<head><meta charset="utf-8"><title>${xml(title)}</title><style>body{font-family:Arial,sans-serif;line-height:1.6;max-width:860px;margin:40px auto;padding:0 20px;color:#172033}pre{white-space:pre-wrap;background:#f7f4ee;padding:16px;border-radius:8px}</style></head>\n<body><h1>${xml(title)}</h1><p><strong>Gerado em:</strong> ${xml(now)}</p><p><strong>Origem:</strong> Charlie Echo da Costa - Jus 9 Tecnologia Juridica</p><pre>${xml(content)}</pre></body>\n</html>\n`;
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
  return zipFiles({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${docxPara(title, true)}${docxPara(`Gerado em: ${now}`)}${docxPara('Origem: Charlie Echo da Costa - Jus 9 Tecnologia Juridica')}${content.split(/\r?\n/).map((line) => docxPara(line)).join('')}<w:sectPr/></w:body></w:document>`
  });
}

function docxPara(text, bold = false) {
  const b = bold ? '<w:b/>' : '';
  return `<w:p><w:r><w:rPr>${b}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`;
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
  const text = xml(`${content.slice(0, 900)}\n\nGerado em: ${now}`);
  return zipFiles({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>',
    'ppt/_rels/presentation.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/></Relationships>',
    'ppt/presentation.xml': '<?xml version="1.0" encoding="UTF-8"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldIdLst><p:sldId id="256" r:id="rId1"/></p:sldIdLst><p:sldSz cx="9144000" cy="5143500"/></p:presentation>',
    'ppt/slides/slide1.xml': `<?xml version="1.0" encoding="UTF-8"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/><p:sp><p:nvSpPr><p:cNvPr id="2" name="Titulo"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>${xml(title)}</a:t></a:r></a:p><a:p><a:r><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`
  });
}

function buildPackageZip(title, content, now) {
  return zipFiles({
    'README.md': buildMarkdown(title, content, now),
    'documento.txt': content,
    'documento.html': buildHtml(title, content, now),
    'metadata.json': JSON.stringify({ title, generatedAt: now, origin: 'Charlie Echo da Costa - Jus 9 Tecnologia Juridica' }, null, 2)
  });
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

function escapePdfText(text) {
  return toAscii(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapLine(line, max) {
  const words = toAscii(line).replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
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

function buildLines(title, content, now) {
  const raw = [title, '', `Gerado em: ${now}`, 'Origem: Charlie Echo da Costa - Jus 9 Tecnologia Juridica', 'Classificacao inicial: documento gerado sob governanca humana', '', 'Conteudo', '', content].join('\n');
  const lines = [];
  for (const paragraph of raw.split(/\r?\n/)) {
    if (!paragraph.trim()) lines.push('');
    else lines.push(...wrapLine(paragraph, 88));
  }
  return lines;
}

function buildSimplePdf(title, content, now) {
  const lines = buildLines(title, content, now);
  const perPage = 46;
  const pages = [];
  for (let i = 0; i < lines.length; i += perPage) pages.push(lines.slice(i, i + perPage));
  const objects = [];
  const add = (value) => {
    objects.push(value);
    return objects.length;
  };

  add('<< /Type /Catalog /Pages 2 0 R >>');
  add('');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  const pageIds = [];
  for (const pageLines of pages) {
    const textOps = pageLines.map((line) => `(${escapePdfText(line)}) Tj T*`).join('\n');
    const stream = `BT\n/F1 11 Tf\n50 790 Td\n14 TL\n${textOps}\nET`;
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  }

  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
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
