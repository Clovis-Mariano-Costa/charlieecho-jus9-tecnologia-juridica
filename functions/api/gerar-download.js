export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const content = String(body.content || '').trim();
  const title = String(body.title || 'charlie-echo-download').trim();
  const requestedFormat = String(body.format || 'txt').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'txt';
  const format = requestedFormat === 'md' ? 'md' : 'txt';
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
