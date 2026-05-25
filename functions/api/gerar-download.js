export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const content = String(body.content || '').trim();
  const title = String(body.title || 'charlie-echo-download').trim();
  const requestedFormat = String(body.format || 'txt').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'txt';
  const format = ['md', 'pdf'].includes(requestedFormat) ? requestedFormat : 'txt';
  const safeTitle = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 80) || 'charlie-echo-download';
  const filename = `${safeTitle}.${format}`;

  if (!content) {
    return Response.json({ error: 'Conteudo vazio. Nao ha arquivo para gerar.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  if (format === 'pdf') {
    const pdf = buildSimplePdf(title, content, now);
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }

  const output = format === 'md'
    ? `# ${title}\n\n- Gerado em: ${now}\n- Origem: Charlie Echo da Costa - Jus 9 Tecnologia Juridica\n- Classificacao inicial: documento gerado sob governanca humana\n\n## Conteudo\n\n${content}\n`
    : content;
  const type = format === 'md'
    ? 'text/markdown; charset=utf-8'
    : 'text/plain; charset=utf-8';

  return new Response(output, {
    status: 200,
    headers: {
      'Content-Type': type,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function toAscii(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '-');
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
  const raw = [
    title,
    '',
    `Gerado em: ${now}`,
    'Origem: Charlie Echo da Costa - Jus 9 Tecnologia Juridica',
    'Classificacao inicial: documento gerado sob governanca humana',
    '',
    'Conteudo',
    '',
    content
  ].join('\n');
  const lines = [];
  for (const paragraph of raw.split(/\r?\n/)) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    lines.push(...wrapLine(paragraph, 88));
  }
  return lines;
}

function buildSimplePdf(title, content, now) {
  const lines = buildLines(title, content, now);
  const perPage = 46;
  const pages = [];
  for (let i = 0; i < lines.length; i += perPage) {
    pages.push(lines.slice(i, i + perPage));
  }
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

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  return new TextEncoder().encode(pdf);
}
